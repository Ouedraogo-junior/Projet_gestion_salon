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

        // Recherche par nom ou référence
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nom', 'ILIKE', '%' . $search . '%')
                  ->orWhere('reference', 'ILIKE', '%' . $search . '%')
                  ->orWhere('marque', 'ILIKE', '%' . $search . '%');
            });
        }

        // Filtre par catégorie
        if ($request->filled('categorie_id')) {
            $query->where('categorie_id', $request->categorie_id);
        }

        // Filtre par type de stock
        if ($request->filled('type_stock_principal')) {
            $query->where('type_stock_principal', $request->type_stock_principal);
        }

        // Filtre par statut actif
        if ($request->has('actifs_only')) {
            $query->where('is_active', true);
        }

        // Filtre par alerte stock vente
        if ($request->has('alerte_stock_vente')) {
            $query->whereRaw('stock_vente <= seuil_alerte');
        }

        // Filtre par alerte stock utilisation
        if ($request->has('alerte_stock_utilisation')) {
            $query->whereRaw('stock_utilisation <= seuil_alerte_utilisation');
        }

        // Filtre par stock critique
        if ($request->has('critique_stock_vente')) {
            $query->whereRaw('stock_vente <= seuil_critique');
        }

        // Filtre par produits en promotion
        if ($request->has('en_promotion')) {
            $query->whereNotNull('prix_promo')
                  ->whereNotNull('date_debut_promo')
                  ->whereNotNull('date_fin_promo')
                  ->whereDate('date_debut_promo', '<=', now())
                  ->whereDate('date_fin_promo', '>=', now());
        }

        // Eager loading
        $query->with(['categorie', 'valeursAttributs.attribut']);

        // Tri
        $sortField = $request->input('sort_by', 'nom');
        $sortOrder = $request->input('sort_order', 'asc');
        
        $allowedSorts = ['nom', 'reference', 'prix_vente', 'prix_achat', 'stock_vente', 'stock_utilisation', 'created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortOrder);
        }

        // Pagination
        $perPage = $request->input('per_page', 20);
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
            // Créer le produit
            $produitData = $request->except('attributs');
            
            // Gérer les valeurs nullables pour les seuils
            $produitData['seuil_alerte'] = $request->input('seuil_alerte') ?? null;
            $produitData['seuil_critique'] = $request->input('seuil_critique') ?? null;
            $produitData['seuil_alerte_utilisation'] = $request->input('seuil_alerte_utilisation') ?? null;
            $produitData['seuil_critique_utilisation'] = $request->input('seuil_critique_utilisation') ?? null;
            
            $produit = Produit::create($produitData);

            // Ajouter les attributs si fournis
            if ($request->has('attributs') && is_array($request->attributs)) {
                foreach ($request->attributs as $attributId => $valeur) {
                    if (!empty($valeur)) {
                        $produit->setAttribut($attributId, $valeur);
                    }
                }
            }

            DB::commit();

            // Charger les relations
            $produit->load(['categorie', 'valeursAttributs.attribut']);

            return response()->json([
                'success' => true,
                'data' => new ProduitResource($produit),
                'message' => 'Produit créé avec succès',
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            
            // Extraire la première erreur de validation
            $errors = $e->errors();
            $firstError = reset($errors)[0] ?? 'Erreur de validation';
            
            return response()->json([
                'success' => false,
                'message' => $firstError,
                'errors' => $errors,
            ], 422);
            
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
    DB::beginTransaction();
    try {
        // Mettre à jour le produit
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
        
        $produit->update($produitData);

        // Mettre à jour les attributs si fournis
        if ($request->has('attributs') && is_array($request->attributs)) {
            // Supprimer les anciennes valeurs
            ProduitAttributValeur::supprimerPourProduit($produit->id);
            
            // Ajouter les nouvelles
            foreach ($request->attributs as $attributId => $valeur) {
                if (!empty($valeur)) {
                    $produit->setAttribut($attributId, $valeur);
                }
            }
        }

        DB::commit();

        // Recharger les relations
        $produit->load(['categorie', 'valeursAttributs.attribut']);

        return response()->json([
            'success' => true,
            'data' => new ProduitResource($produit),
            'message' => 'Produit mis à jour avec succès',
        ]);

    } catch (\Illuminate\Validation\ValidationException $e) {
        DB::rollBack();
        
        // Extraire la première erreur de validation
        $errors = $e->errors();
        $firstError = reset($errors)[0] ?? 'Erreur de validation';
        
        return response()->json([
            'success' => false,
            'message' => $firstError,
            'errors' => $errors,
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

        // Type d'alerte (vente, utilisation, ou les deux)
        $typeAlerte = $request->input('type', 'all'); // all, vente, utilisation

        if ($typeAlerte === 'vente' || $typeAlerte === 'all') {
            $query->orWhereRaw('stock_vente <= seuil_alerte');
        }

        if ($typeAlerte === 'utilisation' || $typeAlerte === 'all') {
            $query->orWhereRaw('stock_utilisation <= seuil_alerte_utilisation');
        }

        // Seulement les produits actifs
        $query->where('is_active', true);

        $query->with(['categorie']);

        $produits = $query->get();

        return response()->json([
            'success' => true,
            'data' => ProduitResource::collection($produits),
            'stats' => [
                'total_alertes' => $produits->count(),
                'alertes_vente' => $produits->filter(fn($p) => $p->stock_vente <= $p->seuil_alerte)->count(),
                'alertes_utilisation' => $produits->filter(fn($p) => $p->stock_utilisation <= ($p->seuil_alerte_utilisation ?? 5))->count(),
                'critiques_vente' => $produits->filter(fn($p) => $p->stock_vente <= $p->seuil_critique)->count(),
                'critiques_utilisation' => $produits->filter(fn($p) => $p->stock_utilisation <= ($p->seuil_critique_utilisation ?? 2))->count(),
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
}