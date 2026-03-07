<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProduitRequest;
use App\Http\Requests\UpdateProduitRequest;
use App\Http\Resources\ProduitResource;
use App\Http\Resources\ProduitCollection;
use App\Http\Resources\MouvementStockResource;
use App\Models\Produit;
use App\Models\ProduitVariante;
use App\Models\ProduitAttributValeur;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProduitController extends Controller
{
    // ========================================
    // INDEX
    // ========================================

    public function index(Request $request): JsonResponse
    {
        $query = Produit::query()->with(['categorie', 'variantes.valeursAttributs.attribut']);
        $user  = auth()->user();

        if ($user->role !== 'gestionnaire') {
            if ($request->input('statut_validation') === 'valide') {
                $query->whereHas('variantes', fn($q) => $q->where('statut_validation', 'valide'));
            } else {
                $query->whereHas('variantes', function ($q) use ($user) {
                    $q->where('statut_validation', 'valide')
                      ->orWhere(function ($q2) use ($user) {
                          $q2->where('cree_par', $user->id)
                             ->whereIn('statut_validation', ['en_attente', 'rejete']);
                      });
                });
            }
        } else {
            if ($request->filled('statut_validation')) {
                $query->whereHas('variantes', fn($q) =>
                    $q->where('statut_validation', $request->statut_validation)
                );
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'ILIKE', '%' . $search . '%')
                  ->orWhere('marque', 'ILIKE', '%' . $search . '%')
                  ->orWhereHas('variantes', fn($q2) =>
                      $q2->where('reference', 'ILIKE', '%' . $search . '%')
                  );
            });
        }

        if ($request->filled('categorie_id')) {
            $query->where('categorie_id', $request->categorie_id);
        }

        if ($request->filled('type_stock_principal')) {
            $query->whereHas('variantes', fn($q) =>
                $q->where('type_stock_principal', $request->type_stock_principal)
            );
        }

        if ($request->has('actifs_only')) {
            $query->where('is_active', true);
        }

        if ($request->has('alerte_stock_vente')) {
            $query->whereHas('variantes', fn($q) =>
                $q->whereRaw('stock_vente <= seuil_alerte')
            );
        }

        if ($request->has('alerte_stock_utilisation')) {
            $query->whereHas('variantes', fn($q) =>
                $q->whereRaw('stock_utilisation <= seuil_alerte_utilisation')
            );
        }

        if ($request->has('critique_stock_vente')) {
            $query->whereHas('variantes', fn($q) =>
                $q->whereRaw('stock_vente <= seuil_critique')
            );
        }

        if ($request->has('en_promotion')) {
            $query->whereHas('variantes', fn($q) =>
                $q->whereNotNull('prix_promo')
                  ->whereNotNull('date_debut_promo')
                  ->whereNotNull('date_fin_promo')
                  ->whereDate('date_debut_promo', '<=', now())
                  ->whereDate('date_fin_promo', '>=', now())
            );
        }

        $sortField = $request->input('sort_by', 'nom');
        $sortOrder = $request->input('sort_order', 'asc');
        $allowedSorts = ['nom', 'created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortOrder);
        }

        $perPage  = min($request->input('per_page', 100), 500);
        $produits = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => new ProduitCollection($produits),
            'message' => 'Produits récupérés avec succès',
        ]);
    }

    // ========================================
    // STORE
    // ========================================

    public function store(StoreProduitRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $user = auth()->user();

            // Créer le produit parent
            $produit = Produit::create([
                'nom'          => $request->nom,
                'description'  => $request->description,
                'categorie_id' => $request->categorie_id,
                'marque'       => $request->marque,
                'fournisseur'  => $request->fournisseur,
                'photo_url'    => $request->photo_url,
                'visible_public' => $request->input('visible_public', true),
                'is_active'    => true,
                'salon_id'     => $request->salon_id ?? 1,
            ]);

            // Créer les variantes
            foreach ($request->variantes as $varianteData) {
                $varianteData['produit_id']        = $produit->id;
                $varianteData['cree_par']          = $user->id;
                $varianteData['statut_validation'] = $user->role === 'gestionnaire' ? 'valide' : 'en_attente';

                if ($user->role === 'gestionnaire') {
                    $varianteData['valide_par'] = $user->id;
                    $varianteData['valide_le']  = now();
                }

                // Seuils nullables
                foreach (['seuil_alerte', 'seuil_critique', 'seuil_alerte_utilisation', 'seuil_critique_utilisation'] as $champ) {
                    $varianteData[$champ] = $varianteData[$champ] ?? null;
                }

                $variante = ProduitVariante::create($varianteData);

                // Attributs de la variante
                if (!empty($varianteData['attributs']) && is_array($varianteData['attributs'])) {
                    foreach ($varianteData['attributs'] as $attributId => $valeur) {
                        if (!empty($valeur)) {
                            $variante->setAttribut($attributId, $valeur);
                        }
                    }
                }
            }

            DB::commit();

            // Recharger les variantes avant la notification
            $produit->load(['variantes']);

            $premiereVariante = $produit->variantes->first();
            if ($premiereVariante) {
                app(\App\Services\NotificationService::class)->notifierProduitSoumis($premiereVariante);
            }

            $statut  = $produit->variantes->first()->statut_validation;
            $message = $statut === 'valide'
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

    // ========================================
    // SHOW
    // ========================================

    public function show(Produit $produit): JsonResponse
    {
        $produit->load([
            'categorie.attributs',
            'variantes.valeursAttributs.attribut',
            'variantes.mouvementsStock' => fn($q) => $q->latest()->limit(10),
            'variantes.transferts'      => fn($q) => $q->latest()->limit(5),
        ]);

        return response()->json([
            'success' => true,
            'data'    => new ProduitResource($produit),
            'message' => 'Produit récupéré avec succès',
        ]);
    }

    // ========================================
    // UPDATE
    // ========================================

    public function update(UpdateProduitRequest $request, Produit $produit): JsonResponse
    {
        $user = auth()->user();

        DB::beginTransaction();
        try {
            // Mettre à jour le produit parent
            $produit->update($request->only(['nom', 'description', 'categorie_id', 'marque', 'fournisseur', 'visible_public', 'is_active']));

            // Mettre à jour les variantes existantes ou en créer de nouvelles
            if ($request->has('variantes') && is_array($request->variantes)) {
                foreach ($request->variantes as $varianteData) {

                    // Variante existante → update
                    if (!empty($varianteData['id'])) {
                        $variante = ProduitVariante::findOrFail($varianteData['id']);

                        if ($user->role !== 'gestionnaire') {
                            if ($variante->cree_par !== $user->id) {
                                continue; // skip les variantes qui ne lui appartiennent pas
                            }
                            if ($variante->statut_validation === 'valide') {
                                continue;
                            }
                            if ($variante->statut_validation === 'rejete') {
                                $varianteData['statut_validation'] = 'en_attente';
                                $varianteData['motif_rejet']       = null;
                                $varianteData['valide_par']        = null;
                                $varianteData['valide_le']         = null;
                            }
                        }

                        $variante->update($varianteData);

                        if (!empty($varianteData['attributs']) && is_array($varianteData['attributs'])) {
                            ProduitAttributValeur::supprimerPourVariante($variante->id);
                            foreach ($varianteData['attributs'] as $attributId => $valeur) {
                                if (!empty($valeur)) {
                                    $variante->setAttribut($attributId, $valeur);
                                }
                            }
                        }

                    // Nouvelle variante → create
                    } else {
                        $varianteData['produit_id']        = $produit->id;
                        $varianteData['cree_par']          = $user->id;
                        $varianteData['statut_validation'] = $user->role === 'gestionnaire' ? 'valide' : 'en_attente';

                        if ($user->role === 'gestionnaire') {
                            $varianteData['valide_par'] = $user->id;
                            $varianteData['valide_le']  = now();
                        }

                        $variante = ProduitVariante::create($varianteData);

                        if (!empty($varianteData['attributs']) && is_array($varianteData['attributs'])) {
                            foreach ($varianteData['attributs'] as $attributId => $valeur) {
                                if (!empty($valeur)) {
                                    $variante->setAttribut($attributId, $valeur);
                                }
                            }
                        }
                    }
                }
            }

            DB::commit();

            $produit->load(['categorie', 'variantes.valeursAttributs.attribut', 'variantes.createur', 'variantes.validateur']);

            return response()->json([
                'success' => true,
                'data'    => new ProduitResource($produit),
                'message' => 'Produit mis à jour avec succès',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Impossible de modifier le produit : ' . $e->getMessage(),
            ], 500);
        }
    }

    // ========================================
    // DESTROY
    // ========================================

    public function destroy(Produit $produit): JsonResponse
    {
        $produit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produit supprimé avec succès',
        ]);
    }

    // ========================================
    // ALERTES
    // ========================================

    public function alertes(Request $request): JsonResponse
    {
        $typeAlerte = $request->input('type', 'all');

        $variantes = ProduitVariante::query()
            ->where('is_active', true)
            ->when(in_array($typeAlerte, ['vente', 'all']),
                fn($q) => $q->orWhereRaw('stock_vente <= seuil_alerte')
            )
            ->when(in_array($typeAlerte, ['utilisation', 'all']),
                fn($q) => $q->orWhereRaw('stock_utilisation <= seuil_alerte_utilisation')
            )
            ->when(in_array($typeAlerte, ['reserve', 'all']),
                fn($q) => $q->orWhereRaw('stock_reserve <= seuil_alerte_reserve')
            )
            ->with(['produit.categorie'])
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $variantes,
            'stats'   => [
                'total_alertes'          => $variantes->count(),
                'alertes_vente'          => $variantes->filter(fn($v) => $v->stock_vente <= ($v->seuil_alerte ?? 0))->count(),
                'alertes_utilisation'    => $variantes->filter(fn($v) => $v->stock_utilisation <= ($v->seuil_alerte_utilisation ?? 0))->count(),
                'alertes_reserve'        => $variantes->filter(fn($v) => $v->stock_reserve <= ($v->seuil_alerte_reserve ?? 0))->count(),
                'critiques_vente'        => $variantes->filter(fn($v) => $v->stock_vente <= ($v->seuil_critique ?? 0))->count(),
                'critiques_utilisation'  => $variantes->filter(fn($v) => $v->stock_utilisation <= ($v->seuil_critique_utilisation ?? 0))->count(),
                'critiques_reserve'      => $variantes->filter(fn($v) => $v->stock_reserve <= ($v->seuil_critique_reserve ?? 0))->count(),
            ],
            'message' => 'Produits en alerte récupérés avec succès',
        ]);
    }

    // ========================================
    // MOUVEMENTS
    // ========================================

    public function mouvements(Request $request, Produit $produit): JsonResponse
    {
        $varianteId = $request->input('variante_id');

        // Si variante_id fourni → mouvements d'une variante spécifique
        // Sinon → mouvements de toutes les variantes du produit
        $query = $varianteId
            ? \App\Models\MouvementStock::where('variante_id', $varianteId)
            : \App\Models\MouvementStock::whereIn(
                'variante_id',
                $produit->variantes->pluck('id')
              );

        if ($request->filled('type_stock')) {
            $query->where('type_stock', $request->type_stock);
        }

        if ($request->filled('type_mouvement')) {
            $query->where('type_mouvement', $request->type_mouvement);
        }

        if ($request->filled('date_debut') && $request->filled('date_fin')) {
            $query->whereBetween('created_at', [$request->date_debut, $request->date_fin]);
        }

        $query->with(['user', 'vente', 'transfert', 'confection'])->latest();

        $mouvements = $query->paginate($request->input('per_page', 50));

        return response()->json([
            'success' => true,
            'data'    => MouvementStockResource::collection($mouvements),
            'message' => 'Historique des mouvements récupéré avec succès',
        ]);
    }

    // ========================================
    // TOGGLE ACTIVE
    // ========================================

    public function toggleActive(Produit $produit): JsonResponse
    {
        $produit->update(['is_active' => !$produit->is_active]);

        return response()->json([
            'success' => true,
            'data'    => new ProduitResource($produit),
            'message' => $produit->is_active ? 'Produit activé avec succès' : 'Produit désactivé avec succès',
        ]);
    }

    // ========================================
    // UPLOAD / DELETE PHOTO
    // ========================================

    public function uploadPhoto(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'photo' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Erreur de validation', 'errors' => $validator->errors()], 422);
        }

        try {
            $produit = Produit::findOrFail($id);

            if ($request->hasFile('photo')) {
                if ($produit->photo_url && Storage::disk('public')->exists($produit->photo_url)) {
                    Storage::disk('public')->delete($produit->photo_url);
                }

                $file         = $request->file('photo');
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension    = $file->getClientOriginalExtension();
                $safeName     = preg_replace('/[^A-Za-z0-9_\-]/', '_', $originalName);
                $filename     = 'produit_' . $produit->id . '_' . time() . '_' . $safeName . '.' . $extension;
                $path         = $file->storeAs('photos/produits', $filename, 'public');

                $produit->update(['photo_url' => $path]);
                $produit->load(['categorie', 'variantes.valeursAttributs.attribut']);

                return response()->json(['success' => true, 'message' => 'Photo uploadée avec succès', 'data' => new ProduitResource($produit)]);
            }

            return response()->json(['success' => false, 'message' => 'Aucun fichier fourni'], 400);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur lors de l\'upload', 'error' => $e->getMessage()], 500);
        }
    }

    public function deletePhoto($id): JsonResponse
    {
        try {
            $produit = Produit::findOrFail($id);

            if (!$produit->photo_url) {
                return response()->json(['success' => false, 'message' => 'Aucune photo à supprimer'], 404);
            }

            if (Storage::disk('public')->exists($produit->photo_url)) {
                Storage::disk('public')->delete($produit->photo_url);
            }

            $produit->update(['photo_url' => null]);
            $produit->load(['categorie', 'variantes.valeursAttributs.attribut']);

            return response()->json(['success' => true, 'message' => 'Photo supprimée avec succès', 'data' => new ProduitResource($produit)]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur lors de la suppression', 'error' => $e->getMessage()], 500);
        }
    }

    // ========================================
    // VALIDATION
    // ========================================

    public function enAttente(Request $request): JsonResponse
    {
        $variantes = ProduitVariante::enAttente()
            ->with(['produit.categorie', 'valeursAttributs.attribut', 'createur'])
            ->latest()
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data'    => $variantes,
            'message' => 'Variantes en attente de validation',
        ]);
    }

    public function valider(Request $request, Produit $produit): JsonResponse
    {
        $varianteId = $request->input('variante_id');

        $variantes = $varianteId
            ? ProduitVariante::where('id', $varianteId)->where('produit_id', $produit->id)->get()
            : $produit->variantes()->where('statut_validation', '!=', 'valide')->get();

        foreach ($variantes as $variante) {
            $variante->update([
                'statut_validation' => 'valide',
                'valide_par'        => auth()->id(),
                'valide_le'         => now(),
                'motif_rejet'       => null,
            ]);
        }

        $produit->load(['categorie', 'variantes.valeursAttributs.attribut', 'variantes.validateur']);

        return response()->json([
            'success' => true,
            'data'    => new ProduitResource($produit),
            'message' => 'Variante(s) validée(s) avec succès',
        ]);
    }

    public function modifierEtValider(UpdateProduitRequest $request, Produit $produit): JsonResponse
    {
        DB::beginTransaction();
        try {
            $produit->update($request->only(['nom', 'description', 'categorie_id', 'marque', 'fournisseur']));

            if ($request->has('variantes') && is_array($request->variantes)) {
                foreach ($request->variantes as $varianteData) {
                    if (empty($varianteData['id'])) continue;

                    $variante = ProduitVariante::findOrFail($varianteData['id']);

                    $varianteData['statut_validation'] = 'valide';
                    $varianteData['valide_par']        = auth()->id();
                    $varianteData['valide_le']         = now();
                    $varianteData['motif_rejet']       = null;

                    $variante->update($varianteData);

                    if (!empty($varianteData['attributs']) && is_array($varianteData['attributs'])) {
                        ProduitAttributValeur::supprimerPourVariante($variante->id);
                        foreach ($varianteData['attributs'] as $attributId => $valeur) {
                            if (!empty($valeur)) {
                                $variante->setAttribut($attributId, $valeur);
                            }
                        }
                    }
                }
            }

            DB::commit();

            $produit->load(['categorie', 'variantes.valeursAttributs.attribut', 'variantes.validateur']);

            return response()->json([
                'success' => true,
                'data'    => new ProduitResource($produit),
                'message' => 'Produit modifié et validé avec succès',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Erreur : ' . $e->getMessage()], 500);
        }
    }

    public function rejeter(Request $request, Produit $produit): JsonResponse
    {
        $request->validate(['motif' => 'required|string|max:500']);

        $varianteId = $request->input('variante_id');

        $variantes = $varianteId
            ? ProduitVariante::where('id', $varianteId)->where('produit_id', $produit->id)->get()
            : $produit->variantes()->where('statut_validation', '!=', 'rejete')->get();

        foreach ($variantes as $variante) {
            $variante->update([
                'statut_validation' => 'rejete',
                'valide_par'        => auth()->id(),
                'valide_le'         => now(),
                'motif_rejet'       => $request->motif,
            ]);
        }

        $produit->load(['categorie', 'variantes.valeursAttributs.attribut', 'variantes.validateur']);

        return response()->json([
            'success' => true,
            'data'    => new ProduitResource($produit),
            'message' => 'Variante(s) rejetée(s)',
        ]);
    }
}