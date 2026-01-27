<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransfertStockRequest;
use App\Http\Resources\TransfertStockResource;
use App\Models\TransfertStock;
use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TransfertStockController extends Controller
{
    /**
     * Liste tous les transferts avec filtres
     */
    public function index(Request $request): JsonResponse
    {
        $query = TransfertStock::query();

        // Filtre par produit
        if ($request->filled('produit_id')) {
            $query->where('produit_id', $request->produit_id);
        }

        // Filtre par type de transfert
        if ($request->filled('type_transfert')) {
            $query->where('type_transfert', $request->type_transfert);
        }

        // Filtre par statut
        if ($request->has('en_attente')) {
            $query->where('valide', false);
        }

        if ($request->has('valides')) {
            $query->where('valide', true);
        }

        // Filtre par utilisateur
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filtre par période
        if ($request->filled('date_debut') && $request->filled('date_fin')) {
            $query->whereBetween('created_at', [
                $request->date_debut . ' 00:00:00',
                $request->date_fin . ' 23:59:59'
            ]);
        }

        // Eager loading
        $query->with([
            'produit.categorie',
            'user',
            'valideur',
            'mouvements'
        ]);

        // Tri
        $query->latest();

        // Pagination
        $perPage = $request->input('per_page', 20);
        $transferts = $query->paginate($perPage);

        // Statistiques si demandées
        $stats = null;
        if ($request->has('include_stats')) {
            $stats = $this->calculerStatistiques($query);
        }

        return response()->json([
            'success' => true,
            'data' => TransfertStockResource::collection($transferts),
            'stats' => $stats,
            'message' => 'Transferts récupérés avec succès',
        ]);
    }

    /**
     * Crée un nouveau transfert (validé automatiquement)
     */
    public function store(StoreTransfertStockRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $produit = Produit::findOrFail($request->produit_id);

            // Vérifier le stock source disponible
            $stockSource = $request->type_transfert === 'vente_vers_utilisation'
                ? $produit->stock_vente
                : $produit->stock_utilisation;

            if ($stockSource < $request->quantite) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stock source insuffisant',
                    'stock_disponible' => $stockSource,
                    'quantite_demandee' => $request->quantite,
                ], 422);
            }

            // ✅ MODIFICATION: Tous les transferts sont validés automatiquement
            $autoValider = true;

            // Créer le transfert
            $transfert = TransfertStock::creerTransfert(
                produitId: $request->produit_id,
                typeTransfert: $request->type_transfert,
                quantite: $request->quantite,
                motif: $request->motif,
                userId: auth()->id(),
                autoValider: $autoValider
            );

            DB::commit();

            $transfert->load(['produit', 'user', 'valideur', 'mouvements']);

            return response()->json([
                'success' => true,
                'data' => new TransfertStockResource($transfert),
                'message' => 'Transfert créé et validé avec succès',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du transfert',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Affiche un transfert spécifique
     */
    public function show(TransfertStock $transfert): JsonResponse
    {
        $transfert->load([
            'produit.categorie',
            'user',
            'valideur',
            'mouvements.user'
        ]);

        return response()->json([
            'success' => true,
            'data' => new TransfertStockResource($transfert),
            'message' => 'Transfert récupéré avec succès',
        ]);
    }

    /**
     * Valide un transfert (réservé au gérant)
     */
    public function valider(Request $request, TransfertStock $transfert): JsonResponse
    {
        // Vérifier que l'utilisateur est gérant
        if (!auth()->user()->isGerant()) {
            return response()->json([
                'success' => false,
                'message' => 'Seul un gérant peut valider les transferts',
            ], 403);
        }

        // Vérifier que le transfert n'est pas déjà validé
        if ($transfert->valide) {
            return response()->json([
                'success' => false,
                'message' => 'Ce transfert a déjà été validé',
                'date_validation' => $transfert->date_validation->format('d/m/Y H:i'),
                'valideur' => $transfert->valideur->nom_complet,
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Valider le transfert
            $transfert->valider(auth()->id());

            DB::commit();

            $transfert->load(['produit', 'user', 'valideur', 'mouvements']);

            return response()->json([
                'success' => true,
                'data' => new TransfertStockResource($transfert),
                'message' => 'Transfert validé avec succès',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la validation du transfert',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Annule un transfert non validé
     */
    public function destroy(TransfertStock $transfert): JsonResponse
    {
        // Vérifier que le transfert n'est pas validé
        if ($transfert->valide) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible d\'annuler un transfert déjà validé',
            ], 422);
        }

        // Vérifier les permissions (créateur ou gérant)
        if ($transfert->user_id !== auth()->id() && !auth()->user()->isGerant()) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas autorisé à annuler ce transfert',
            ], 403);
        }

        $transfert->delete();

        return response()->json([
            'success' => true,
            'message' => 'Transfert annulé avec succès',
        ]);
    }

    /**
     * Liste des transferts en attente (pour gérant)
     */
    public function enAttente(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est gérant
        if (!auth()->user()->isGerant()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé',
            ], 403);
        }

        $transferts = TransfertStock::enAttente()
            ->with(['produit', 'user'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => TransfertStockResource::collection($transferts),
            'count' => $transferts->count(),
            'message' => 'Transferts en attente récupérés avec succès',
        ]);
    }

    /**
     * Valide plusieurs transferts en masse (gérant)
     */
    public function validerEnMasse(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est gérant
        if (!auth()->user()->isGerant()) {
            return response()->json([
                'success' => false,
                'message' => 'Seul un gérant peut valider les transferts',
            ], 403);
        }

        $request->validate([
            'transfert_ids' => 'required|array',
            'transfert_ids.*' => 'exists:transferts_stock,id',
        ]);

        DB::beginTransaction();
        try {
            $validesCount = 0;
            $errors = [];

            foreach ($request->transfert_ids as $transfertId) {
                $transfert = TransfertStock::find($transfertId);

                if (!$transfert->valide) {
                    try {
                        $transfert->valider(auth()->id());
                        $validesCount++;
                    } catch (\Exception $e) {
                        $errors[] = [
                            'transfert_id' => $transfertId,
                            'numero' => $transfert->numero_transfert,
                            'erreur' => $e->getMessage(),
                        ];
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'valides' => $validesCount,
                'errors' => $errors,
                'message' => "$validesCount transfert(s) validé(s) avec succès",
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la validation en masse',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Calcule les statistiques des transferts
     */
    private function calculerStatistiques($query): array
    {
        $statsQuery = clone $query;
        $transferts = $statsQuery->get();

        return [
            'total_transferts' => $transferts->count(),
            'en_attente' => $transferts->where('valide', false)->count(),
            'valides' => $transferts->where('valide', true)->count(),
            'vente_vers_utilisation' => $transferts->where('type_transfert', 'vente_vers_utilisation')->count(),
            'utilisation_vers_vente' => $transferts->where('type_transfert', 'utilisation_vers_vente')->count(),
            'montant_total' => $transferts->sum('montant_total'),
            'quantite_totale' => $transferts->sum('quantite'),
        ];
    }
}