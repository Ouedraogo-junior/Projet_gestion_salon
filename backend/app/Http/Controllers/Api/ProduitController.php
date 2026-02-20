<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProduitRequest;
use App\Http\Requests\UpdateProduitRequest;
use App\Http\Resources\ProduitResource;
use App\Http\Resources\ProduitCollection;
use App\Http\Resources\MouvementStockResource;
use App\Models\Produit;
use App\Models\ProduitAttributValeur;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProduitController extends Controller
{
    /**
     * Liste tous les produits avec filtres et recherche
     */
    public function index(Request $request): JsonResponse
    {
        $query = Produit::query();
        $user  = auth()->user();
            if ($user->role !== 'gestionnaire') {
                if ($request->input('statut_validation') === 'valide') {
                    // Filtre strict caisse
                    $query->where('statut_validation', 'valide');
                } else {
                    // Vue normale produits
                    $query->where(function($q) use ($user) {
                        $q->where('statut_validation', 'valide')
                        ->orWhere(function($q2) use ($user) {
                            $q2->where('cree_par', $user->id)
                                ->whereIn('statut_validation', ['en_attente', 'rejete']);
                        });
                    });
                }
            } else {
            // Gestionnaire peut filtrer librement par statut
            if ($request->filled('statut_validation')) {
                $query->where('statut_validation', $request->statut_validation);
            }
        }

        // Recherche par nom ou référence
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nom', 'ILIKE', '%' . $search . '%')
                ->orWhere('reference', 'ILIKE', '%' . $search . '%')
                ->orWhere('marque', 'ILIKE', '%' . $search . '%');
            });
        }

        if ($request->filled('categorie_id')) {
            $query->where('categorie_id', $request->categorie_id);
        }

        if ($request->filled('type_stock_principal')) {
            $query->where('type_stock_principal', $request->type_stock_principal);
        }

        if ($request->has('actifs_only')) {
            $query->where('is_active', true);
        }

        if ($request->has('alerte_stock_vente')) {
            $query->whereRaw('stock_vente <= seuil_alerte');
        }

        if ($request->has('alerte_stock_utilisation')) {
            $query->whereRaw('stock_utilisation <= seuil_alerte_utilisation');
        }

        if ($request->has('critique_stock_vente')) {
            $query->whereRaw('stock_vente <= seuil_critique');
        }

        if ($request->has('en_promotion')) {
            $query->whereNotNull('prix_promo')
                ->whereNotNull('date_debut_promo')
                ->whereNotNull('date_fin_promo')
                ->whereDate('date_debut_promo', '<=', now())
                ->whereDate('date_fin_promo', '>=', now());
        }

        $query->with(['categorie', 'valeursAttributs.attribut']);

        $sortField = $request->input('sort_by', 'nom');
        $sortOrder = $request->input('sort_order', 'asc');
        $allowedSorts = ['nom', 'reference', 'prix_vente', 'prix_achat', 'stock_vente', 'stock_utilisation', 'created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortOrder);
        }

        $perPage = min($request->input('per_page', 100), 500);
        $produits = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => new ProduitCollection($produits),
            'message' => 'Produits récupérés avec succès',
        ]);
    }

    /**
     * Crée un nouveau produit avec ses attributs
     */
    public function store(StoreProduitRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $produitData = $request->except('attributs');
            $produitData['seuil_alerte']               = $request->input('seuil_alerte') ?? null;
            $produitData['seuil_critique']              = $request->input('seuil_critique') ?? null;
            $produitData['seuil_alerte_utilisation']    = $request->input('seuil_alerte_utilisation') ?? null;
            $produitData['seuil_critique_utilisation']  = $request->input('seuil_critique_utilisation') ?? null;

            // Statut selon le rôle
            $user = auth()->user();
            $produitData['cree_par']           = $user->id;
            $produitData['statut_validation']  = $user->role === 'gestionnaire' ? 'valide' : 'en_attente';

            // Si gestionnaire crée directement, on trace la validation
            if ($user->role === 'gestionnaire') {
                $produitData['valide_par'] = $user->id;
                $produitData['valide_le']  = now();
            }

            $produit = Produit::create($produitData);

            if ($request->has('attributs') && is_array($request->attributs)) {
                foreach ($request->attributs as $attributId => $valeur) {
                    if (!empty($valeur)) {
                        $produit->setAttribut($attributId, $valeur);
                    }
                }
            }

            DB::commit();

            // Notifier les gestionnaires si produit en attente
            app(\App\Services\NotificationService::class)->notifierProduitSoumis($produit);

            $produit->load(['categorie', 'valeursAttributs.attribut', 'createur']);

            $message = $produit->statut_validation === 'valide'
                ? 'Produit créé et validé avec succès'
                : 'Produit soumis pour validation';

            return response()->json([
                'success' => true,
                'data'    => new ProduitResource($produit),
                'message' => $message,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Impossible de créer le produit : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Affiche un produit spécifique
     */
    public function show(Produit $produit): JsonResponse
    {
        $produit->load([
            'categorie.attributs',
            'valeursAttributs.attribut',
            'mouvementsStock' => function($query) {
                $query->latest()->limit(10);
            },
            'transferts' => function($query) {
                $query->latest()->limit(5);
            }
        ]);

        return response()->json([
            'success' => true,
            'data' => new ProduitResource($produit),
            'message' => 'Produit récupéré avec succès',
        ]);
    }

    /**
     * Met à jour un produit
     */
   public function update(UpdateProduitRequest $request, Produit $produit): JsonResponse
    {
        $user = auth()->user();

        // Contrôle d'accès pour coiffeur et gérant
        if ($user->role !== 'gestionnaire') {
            if ($produit->cree_par !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez modifier que vos propres produits',
                ], 403);
            }

            if ($produit->statut_validation === 'valide') {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de modifier un produit déjà validé',
                ], 403);
            }
        }

        DB::beginTransaction();
        try {
            $produitData = $request->except('attributs');

            // Gérer les valeurs nullables pour les seuils
            if ($request->has('seuil_alerte')) {
                $produitData['seuil_alerte'] = $request->input('seuil_alerte') ?: null;
            }
            if ($request->has('seuil_critique')) {
                $produitData['seuil_critique'] = $request->input('seuil_critique') ?: null;
            }
            if ($request->has('seuil_alerte_utilisation')) {
                $produitData['seuil_alerte_utilisation'] = $request->input('seuil_alerte_utilisation') ?: null;
            }
            if ($request->has('seuil_critique_utilisation')) {
                $produitData['seuil_critique_utilisation'] = $request->input('seuil_critique_utilisation') ?: null;
            }

            // Si produit rejeté modifié par son créateur → repasse en attente
            if ($user->role !== 'gestionnaire' && $produit->statut_validation === 'rejete') {
                $produitData['statut_validation'] = 'en_attente';
                $produitData['motif_rejet']       = null;
                $produitData['valide_par']        = null;
                $produitData['valide_le']         = null;

                // Renotifier les gestionnaires
                $produit->load('createur');
                app(\App\Services\NotificationService::class)->notifierProduitSoumis(
                    $produit->fill($produitData) // on passe les nouvelles données pour le message
                );
            }

            $produit->update($produitData);

            // Mettre à jour les attributs si fournis
            if ($request->has('attributs') && is_array($request->attributs)) {
                ProduitAttributValeur::supprimerPourProduit($produit->id);
                foreach ($request->attributs as $attributId => $valeur) {
                    if (!empty($valeur)) {
                        $produit->setAttribut($attributId, $valeur);
                    }
                }
            }

            DB::commit();

            $produit->load(['categorie', 'valeursAttributs.attribut', 'createur', 'validateur']);

            return response()->json([
                'success' => true,
                'data'    => new ProduitResource($produit),
                'message' => 'Produit mis à jour avec succès',
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            $errors     = $e->errors();
            $firstError = reset($errors)[0] ?? 'Erreur de validation';

            return response()->json([
                'success' => false,
                'message' => $firstError,
                'errors'  => $errors,
            ], 422);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Impossible de modifier le produit : ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Supprime un produit
     */
    public function destroy(Produit $produit): JsonResponse
    {
        // Vérifier si le produit a des ventes
        // Note: Vérification à adapter selon votre modèle Vente
        // $ventesCount = $produit->ventes()->count();
        // if ($ventesCount > 0) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Impossible de supprimer ce produit car il a des ventes associées',
        //     ], 422);
        // }

        $produit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produit supprimé avec succès',
        ]);
    }

    /**
     * Récupère les produits en alerte stock
     */
    public function alertes(Request $request): JsonResponse
    {
        $query = Produit::query();
        $typeAlerte = $request->input('type', 'all'); // all, vente, utilisation, reserve

        if ($typeAlerte === 'vente' || $typeAlerte === 'all') {
            $query->orWhereRaw('stock_vente <= seuil_alerte');
        }

        if ($typeAlerte === 'utilisation' || $typeAlerte === 'all') {
            $query->orWhereRaw('stock_utilisation <= seuil_alerte_utilisation');
        }

        // ✅ AJOUT: Alertes réserve
        if ($typeAlerte === 'reserve' || $typeAlerte === 'all') {
            $query->orWhereRaw('stock_reserve <= seuil_alerte_reserve');
        }

        $query->where('is_active', true);
        $query->with(['categorie']);
        $produits = $query->get();

        return response()->json([
            'success' => true,
            'data' => ProduitResource::collection($produits),
            'stats' => [
                'total_alertes' => $produits->count(),
                'alertes_vente' => $produits->filter(fn($p) => $p->stock_vente <= ($p->seuil_alerte ?? 0))->count(),
                'alertes_utilisation' => $produits->filter(fn($p) => $p->stock_utilisation <= ($p->seuil_alerte_utilisation ?? 0))->count(),
                // ✅ AJOUT
                'alertes_reserve' => $produits->filter(fn($p) => $p->stock_reserve <= ($p->seuil_alerte_reserve ?? 0))->count(),
                'critiques_vente' => $produits->filter(fn($p) => $p->stock_vente <= ($p->seuil_critique ?? 0))->count(),
                'critiques_utilisation' => $produits->filter(fn($p) => $p->stock_utilisation <= ($p->seuil_critique_utilisation ?? 0))->count(),
                // ✅ AJOUT
                'critiques_reserve' => $produits->filter(fn($p) => $p->stock_reserve <= ($p->seuil_critique_reserve ?? 0))->count(),
            ],
            'message' => 'Produits en alerte récupérés avec succès',
        ]);
    }

    /**
     * Récupère l'historique des mouvements d'un produit
     */
    public function mouvements(Request $request, Produit $produit): JsonResponse
    {
        $query = $produit->mouvementsStock();

        // Filtrer par type de stock
        if ($request->filled('type_stock')) {
            $query->where('type_stock', $request->type_stock);
        }

        // Filtrer par type de mouvement
        if ($request->filled('type_mouvement')) {
            $query->where('type_mouvement', $request->type_mouvement);
        }

        // Filtrer par période
        if ($request->filled('date_debut') && $request->filled('date_fin')) {
            $query->whereBetween('created_at', [
                $request->date_debut,
                $request->date_fin
            ]);
        }

        $query->with(['user', 'vente', 'transfert', 'confection'])
              ->latest();

        $perPage = $request->input('per_page', 50);
        $mouvements = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => MouvementStockResource::collection($mouvements),
            'message' => 'Historique des mouvements récupéré avec succès',
        ]);
    }

    /**
     * Active/désactive un produit
     */
    public function toggleActive(Produit $produit): JsonResponse
    {
        $produit->update([
            'is_active' => !$produit->is_active
        ]);

        return response()->json([
            'success' => true,
            'data' => new ProduitResource($produit),
            'message' => $produit->is_active 
                ? 'Produit activé avec succès' 
                : 'Produit désactivé avec succès',
        ]);
    }

    /**
     * Upload photo produit
     */
    public function uploadPhoto(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'photo' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // Max 5MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $produit = Produit::findOrFail($id);

            if ($request->hasFile('photo')) {
                // Supprimer l'ancienne photo si elle existe
                if ($produit->photo_url && Storage::disk('public')->exists($produit->photo_url)) {
                    Storage::disk('public')->delete($produit->photo_url);
                }

                $file = $request->file('photo');
                
                // Nom de fichier sécurisé
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $file->getClientOriginalExtension();
                $safeName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $originalName);
                $filename = 'produit_' . $produit->id . '_' . time() . '_' . $safeName . '.' . $extension;
                
                // Stocker dans public/storage/photos/produits
                $path = $file->storeAs('photos/produits', $filename, 'public');

                // Mettre à jour le produit
                $produit->update([
                    'photo_url' => $path
                ]);

                // Recharger les relations
                $produit->load(['categorie', 'valeursAttributs.attribut']);

                return response()->json([
                    'success' => true,
                    'message' => 'Photo uploadée avec succès',
                    'data' => new ProduitResource($produit)
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => 'Aucun fichier fourni'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload de la photo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer la photo d'un produit
     */
    public function deletePhoto($id): JsonResponse
    {
        try {
            $produit = Produit::findOrFail($id);

            if (!$produit->photo_url) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucune photo à supprimer'
                ], 404);
            }

            // Supprimer le fichier physique
            if (Storage::disk('public')->exists($produit->photo_url)) {
                Storage::disk('public')->delete($produit->photo_url);
            }
            
            // Mettre à jour le produit
            $produit->update([
                'photo_url' => null
            ]);

            // Recharger les relations
            $produit->load(['categorie', 'valeursAttributs.attribut']);

            return response()->json([
                'success' => true,
                'message' => 'Photo supprimée avec succès',
                'data' => new ProduitResource($produit)
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la photo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Liste des produits en attente de validation (gestionnaire uniquement)
     */
    public function enAttente(Request $request): JsonResponse
    {
        $produits = Produit::enAttente()
            ->with(['categorie', 'valeursAttributs.attribut', 'createur'])
            ->latest()
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data'    => new ProduitCollection($produits),
            'message' => 'Produits en attente de validation',
        ]);
    }

    /**
     * Valider un produit sans modification
     */
    public function valider(Produit $produit): JsonResponse
    {
        if ($produit->statut_validation === 'valide') {
            return response()->json([
                'success' => false,
                'message' => 'Ce produit est déjà validé',
            ], 422);
        }

        $produit->update([
            'statut_validation' => 'valide',
            'valide_par'        => auth()->id(),
            'valide_le'         => now(),
            'motif_rejet'       => null,
        ]);

        $produit->load(['categorie', 'valeursAttributs.attribut', 'validateur']);

        return response()->json([
            'success' => true,
            'data'    => new ProduitResource($produit),
            'message' => 'Produit validé avec succès',
        ]);
    }

    /**
     * Modifier et valider en une seule action
     */
    public function modifierEtValider(UpdateProduitRequest $request, Produit $produit): JsonResponse
    {
        DB::beginTransaction();
        try {
            $produitData = $request->except('attributs');

            // Champs seuils nullables
            foreach (['seuil_alerte', 'seuil_critique', 'seuil_alerte_utilisation', 'seuil_critique_utilisation'] as $champ) {
                if ($request->has($champ)) {
                    $produitData[$champ] = $request->input($champ) ?: null;
                }
            }

            $produitData['statut_validation'] = 'valide';
            $produitData['valide_par']        = auth()->id();
            $produitData['valide_le']         = now();
            $produitData['motif_rejet']       = null;

            $produit->update($produitData);

            if ($request->has('attributs') && is_array($request->attributs)) {
                ProduitAttributValeur::supprimerPourProduit($produit->id);
                foreach ($request->attributs as $attributId => $valeur) {
                    if (!empty($valeur)) {
                        $produit->setAttribut($attributId, $valeur);
                    }
                }
            }

            DB::commit();

            $produit->load(['categorie', 'valeursAttributs.attribut', 'validateur']);

            return response()->json([
                'success' => true,
                'data'    => new ProduitResource($produit),
                'message' => 'Produit modifié et validé avec succès',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Rejeter un produit avec motif
     */
    public function rejeter(Request $request, Produit $produit): JsonResponse
    {
        $request->validate([
            'motif' => 'required|string|max:500',
        ]);

        $produit->update([
            'statut_validation' => 'rejete',
            'valide_par'        => auth()->id(),
            'valide_le'         => now(),
            'motif_rejet'       => $request->motif,
        ]);

        $produit->load(['categorie', 'valeursAttributs.attribut', 'validateur']);

        return response()->json([
            'success' => true,
            'data'    => new ProduitResource($produit),
            'message' => 'Produit rejeté',
        ]);
    }
}