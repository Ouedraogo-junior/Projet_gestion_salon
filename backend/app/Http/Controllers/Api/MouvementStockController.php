<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMouvementStockRequest;
use App\Http\Resources\MouvementStockResource;
use App\Models\MouvementStock;
use App\Models\ProduitVariante;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MouvementStockController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MouvementStock::query();

        // produit_id → chercher via les variantes du produit
        if ($request->filled('produit_id')) {
            $varianteIds = ProduitVariante::where('produit_id', $request->produit_id)->pluck('id');
            $query->whereIn('variante_id', $varianteIds);
        }

        if ($request->filled('variante_id')) {
            $query->where('variante_id', $request->variante_id);
        }

        if ($request->filled('type_stock')) {
            $query->where('type_stock', $request->type_stock);
        }

        if ($request->filled('type_mouvement')) {
            $query->where('type_mouvement', $request->type_mouvement);
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

        if ($request->has('aujourd_hui')) {
            $query->whereDate('created_at', today());
        }

        if ($request->has('semaine')) {
            $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
        }

        if ($request->has('mois')) {
            $query->whereMonth('created_at', now()->month)
                  ->whereYear('created_at', now()->year);
        }

        $query->with(['variante.produit.categorie', 'user', 'vente', 'transfert', 'confection'])->latest();

        $perPage    = $request->input('per_page', 50);
        $mouvements = $query->paginate($perPage);

        $stats = null;
        if ($request->has('include_stats')) {
            $stats = $this->calculerStatistiques(clone $query);
        }

        return response()->json([
            'success' => true,
            'data'    => MouvementStockResource::collection($mouvements),
            'stats'   => $stats,
            'message' => 'Mouvements de stock récupérés avec succès',
        ]);
    }

    public function store(StoreMouvementStockRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $variante = ProduitVariante::findOrFail($request->variante_id);

            if ($request->type_mouvement === 'sortie') {
                $stockActuel = $request->type_stock === 'vente'
                    ? $variante->stock_vente
                    : ($request->type_stock === 'utilisation' ? $variante->stock_utilisation : $variante->stock_reserve);

                if ($stockActuel < $request->quantite) {
                    return response()->json([
                        'success'           => false,
                        'message'           => 'Stock insuffisant',
                        'stock_disponible'  => $stockActuel,
                        'quantite_demandee' => $request->quantite,
                    ], 422);
                }
            }

            $mouvement = MouvementStock::enregistrerMouvement(
                varianteId:    $request->variante_id,
                typeStock:     $request->type_stock,
                typeMouvement: $request->type_mouvement,
                quantite:      $request->quantite,
                motif:         $request->motif,
                userId:        auth()->id()
            );

            DB::commit();

            $mouvement->load(['variante.produit', 'user']);

            return response()->json([
                'success' => true,
                'data'    => new MouvementStockResource($mouvement),
                'message' => 'Mouvement de stock enregistré avec succès',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'enregistrement du mouvement',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function show(MouvementStock $mouvement): JsonResponse
    {
        $mouvement->load(['variante.produit.categorie', 'user', 'vente', 'transfert', 'confection']);

        return response()->json([
            'success' => true,
            'data'    => new MouvementStockResource($mouvement),
            'message' => 'Mouvement récupéré avec succès',
        ]);
    }

    public function ajuster(Request $request): JsonResponse
    {
        $request->validate([
            'variante_id'  => 'required|exists:produit_variantes,id',
            'type_stock'   => 'required|in:vente,utilisation,reserve',
            'nouveau_stock' => 'required|integer|min:0',
            'motif'        => 'required|string|max:500',
        ]);

        DB::beginTransaction();
        try {
            $mouvement = MouvementStock::enregistrerMouvement(
                varianteId:    $request->variante_id,
                typeStock:     $request->type_stock,
                typeMouvement: 'ajustement',
                quantite:      $request->nouveau_stock,
                motif:         $request->motif,
                userId:        auth()->id()
            );

            DB::commit();

            $mouvement->load(['variante.produit', 'user']);

            return response()->json([
                'success' => true,
                'data'    => new MouvementStockResource($mouvement),
                'message' => 'Stock ajusté avec succès',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'ajustement du stock',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function export(Request $request): JsonResponse
    {
        $query = MouvementStock::query();

        if ($request->filled('produit_id')) {
            $varianteIds = ProduitVariante::where('produit_id', $request->produit_id)->pluck('id');
            $query->whereIn('variante_id', $varianteIds);
        }

        if ($request->filled('variante_id')) {
            $query->where('variante_id', $request->variante_id);
        }

        if ($request->filled('type_stock')) {
            $query->where('type_stock', $request->type_stock);
        }

        if ($request->filled('type_mouvement')) {
            $query->where('type_mouvement', $request->type_mouvement);
        }

        if ($request->filled('date_debut') && $request->filled('date_fin')) {
            $query->whereBetween('created_at', [$request->date_debut, $request->date_fin]);
        }

        $mouvements = $query->with(['variante.produit', 'user'])->get();

        return response()->json([
            'success' => true,
            'data'    => MouvementStockResource::collection($mouvements),
            'message' => 'Export préparé avec succès',
        ]);
    }

    private function calculerStatistiques($query): array
    {
        $mouvements = $query->get();

        return [
            'total_mouvements'  => $mouvements->count(),
            'total_entrees'     => $mouvements->where('type_mouvement', 'entree')->count(),
            'total_sorties'     => $mouvements->where('type_mouvement', 'sortie')->count(),
            'total_ajustements' => $mouvements->where('type_mouvement', 'ajustement')->count(),
            'total_inventaires' => $mouvements->where('type_mouvement', 'inventaire')->count(),
            'quantite_entree'   => $mouvements->where('type_mouvement', 'entree')->sum('quantite'),
            'quantite_sortie'   => $mouvements->where('type_mouvement', 'sortie')->sum('quantite'),
            'par_type_stock'    => [
                'vente'        => $mouvements->where('type_stock', 'vente')->count(),
                'utilisation'  => $mouvements->where('type_stock', 'utilisation')->count(),
                'reserve'      => $mouvements->where('type_stock', 'reserve')->count(),
            ],
        ];
    }
}