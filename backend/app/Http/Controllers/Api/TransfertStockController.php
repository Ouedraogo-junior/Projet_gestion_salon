<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransfertStockRequest;
use App\Http\Resources\TransfertStockResource;
use App\Models\TransfertStock;
use App\Models\ProduitVariante;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TransfertStockController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TransfertStock::query();

        if ($request->filled('produit_id')) {
            $varianteIds = ProduitVariante::where('produit_id', $request->produit_id)->pluck('id');
            $query->whereIn('variante_id', $varianteIds);
        }

        if ($request->filled('variante_id')) {
            $query->where('variante_id', $request->variante_id);
        }

        if ($request->filled('type_transfert')) {
            $query->where('type_transfert', $request->type_transfert);
        }

        if ($request->has('en_attente')) {
            $query->where('valide', false);
        }

        if ($request->has('valides')) {
            $query->where('valide', true);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('date_debut') && $request->filled('date_fin')) {
            $query->whereBetween('created_at', [
                $request->date_debut . ' 00:00:00',
                $request->date_fin . ' 23:59:59',
            ]);
        }

        $query->with(['variante.produit.categorie', 'user', 'valideur', 'mouvements'])->latest();

        $perPage    = $request->input('per_page', 20);
        $transferts = $query->paginate($perPage);

        $stats = null;
        if ($request->has('include_stats')) {
            $stats = $this->calculerStatistiques(clone $query);
        }

        return response()->json([
            'success' => true,
            'data'    => TransfertStockResource::collection($transferts),
            'stats'   => $stats,
            'message' => 'Transferts récupérés avec succès',
        ]);
    }

    public function store(StoreTransfertStockRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $variante = ProduitVariante::findOrFail($request->variante_id);

            $stockSource = match($request->type_transfert) {
                'vente_vers_utilisation', 'vente_vers_reserve'        => $variante->stock_vente,
                'utilisation_vers_vente', 'utilisation_vers_reserve'  => $variante->stock_utilisation,
                'reserve_vers_vente', 'reserve_vers_utilisation'      => $variante->stock_reserve,
                default => throw new \Exception("Type de transfert invalide")
            };

            if ($stockSource < $request->quantite) {
                return response()->json([
                    'success'          => false,
                    'message'          => 'Stock source insuffisant',
                    'stock_disponible' => $stockSource,
                ], 422);
            }

            // Mettre à jour les seuils si transfert depuis réserve
            if (in_array($request->type_transfert, ['reserve_vers_vente', 'reserve_vers_utilisation'])) {
                $updates = [];

                if ($request->type_transfert === 'reserve_vers_vente') {
                    if ($request->filled('seuil_alerte'))   $updates['seuil_alerte']   = $request->seuil_alerte;
                    if ($request->filled('seuil_critique')) $updates['seuil_critique'] = $request->seuil_critique;
                } else {
                    if ($request->filled('seuil_alerte_utilisation'))   $updates['seuil_alerte_utilisation']   = $request->seuil_alerte_utilisation;
                    if ($request->filled('seuil_critique_utilisation')) $updates['seuil_critique_utilisation'] = $request->seuil_critique_utilisation;
                }

                if (!empty($updates)) {
                    $variante->update($updates);
                }
            }

            $transfert = TransfertStock::creerTransfert(
                varianteId:    $request->variante_id,
                typeTransfert: $request->type_transfert,
                quantite:      $request->quantite,
                motif:         $request->motif,
                userId:        auth()->id(),
                autoValider:   true
            );

            DB::commit();

            $transfert->load(['variante.produit', 'user', 'valideur', 'mouvements']);

            return response()->json([
                'success' => true,
                'data'    => new TransfertStockResource($transfert),
                'message' => 'Transfert créé et validé avec succès',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(TransfertStock $transfert): JsonResponse
    {
        $transfert->load(['variante.produit.categorie', 'user', 'valideur', 'mouvements.user']);

        return response()->json([
            'success' => true,
            'data'    => new TransfertStockResource($transfert),
            'message' => 'Transfert récupéré avec succès',
        ]);
    }

    public function valider(Request $request, TransfertStock $transfert): JsonResponse
    {
        if (!auth()->user()->isGerant()) {
            return response()->json(['success' => false, 'message' => 'Seul un gérant peut valider les transferts'], 403);
        }

        if ($transfert->valide) {
            return response()->json([
                'success'          => false,
                'message'          => 'Ce transfert a déjà été validé',
                'date_validation'  => $transfert->date_validation->format('d/m/Y H:i'),
                'valideur'         => $transfert->valideur->nom_complet,
            ], 422);
        }

        DB::beginTransaction();
        try {
            $transfert->valider(auth()->id());
            DB::commit();

            $transfert->load(['variante.produit', 'user', 'valideur', 'mouvements']);

            return response()->json([
                'success' => true,
                'data'    => new TransfertStockResource($transfert),
                'message' => 'Transfert validé avec succès',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(TransfertStock $transfert): JsonResponse
    {
        if ($transfert->valide) {
            return response()->json(['success' => false, 'message' => 'Impossible d\'annuler un transfert déjà validé'], 422);
        }

        if ($transfert->user_id !== auth()->id() && !auth()->user()->isGerant()) {
            return response()->json(['success' => false, 'message' => 'Vous n\'êtes pas autorisé à annuler ce transfert'], 403);
        }

        $transfert->delete();

        return response()->json(['success' => true, 'message' => 'Transfert annulé avec succès']);
    }

    public function enAttente(Request $request): JsonResponse
    {
        if (!auth()->user()->isGerant()) {
            return response()->json(['success' => false, 'message' => 'Accès non autorisé'], 403);
        }

        $transferts = TransfertStock::enAttente()
            ->with(['variante.produit', 'user'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data'    => TransfertStockResource::collection($transferts),
            'count'   => $transferts->count(),
            'message' => 'Transferts en attente récupérés avec succès',
        ]);
    }

    public function validerEnMasse(Request $request): JsonResponse
    {
        if (!auth()->user()->isGerant()) {
            return response()->json(['success' => false, 'message' => 'Seul un gérant peut valider les transferts'], 403);
        }

        $request->validate([
            'transfert_ids'   => 'required|array',
            'transfert_ids.*' => 'exists:transferts_stock,id',
        ]);

        DB::beginTransaction();
        try {
            $validesCount = 0;
            $errors       = [];

            foreach ($request->transfert_ids as $transfertId) {
                $transfert = TransfertStock::find($transfertId);
                if (!$transfert->valide) {
                    try {
                        $transfert->valider(auth()->id());
                        $validesCount++;
                    } catch (\Exception $e) {
                        $errors[] = [
                            'transfert_id' => $transfertId,
                            'numero'       => $transfert->numero_transfert,
                            'erreur'       => $e->getMessage(),
                        ];
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'valides' => $validesCount,
                'errors'  => $errors,
                'message' => "$validesCount transfert(s) validé(s) avec succès",
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    private function calculerStatistiques($query): array
    {
        $transferts = $query->get();

        return [
            'total_transferts'       => $transferts->count(),
            'en_attente'             => $transferts->where('valide', false)->count(),
            'valides'                => $transferts->where('valide', true)->count(),
            'vente_vers_utilisation' => $transferts->where('type_transfert', 'vente_vers_utilisation')->count(),
            'utilisation_vers_vente' => $transferts->where('type_transfert', 'utilisation_vers_vente')->count(),
            'montant_total'          => $transferts->sum('montant_total'),
            'quantite_totale'        => $transferts->sum('quantite'),
        ];
    }
}