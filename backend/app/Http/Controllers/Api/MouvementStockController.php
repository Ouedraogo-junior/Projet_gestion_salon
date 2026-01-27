<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMouvementStockRequest;
use App\Http\Resources\MouvementStockResource;
use App\Models\MouvementStock;
use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MouvementStockController extends Controller
{
    /**
     * Liste tous les mouvements de stock avec filtres
     */
    public function index(Request $request): JsonResponse
    {
        $query = MouvementStock::query();

        // Filtre par produit
        if ($request->filled('produit_id')) {
            $query->where('produit_id', $request->produit_id);
        }

        // Filtre par type de stock
        if ($request->filled('type_stock')) {
            $query->where('type_stock', $request->type_stock);
        }

        // Filtre par type de mouvement
        if ($request->filled('type_mouvement')) {
            $query->where('type_mouvement', $request->type_mouvement);
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

        // Filtrer par date du jour
        if ($request->has('aujourd_hui')) {
            $query->whereDate('created_at', today());
        }

        // Filtrer par semaine en cours
        if ($request->has('semaine')) {
            $query->whereBetween('created_at', [
                now()->startOfWeek(),
                now()->endOfWeek()
            ]);
        }

        // Filtrer par mois en cours
        if ($request->has('mois')) {
            $query->whereMonth('created_at', now()->month)
                  ->whereYear('created_at', now()->year);
        }

        // Eager loading
        $query->with(['produit.categorie', 'user', 'vente', 'transfert', 'confection']);

        // Tri
        $query->latest();

        // Pagination
        $perPage = $request->input('per_page', 50);
        $mouvements = $query->paginate($perPage);

        // Statistiques si demandées
        $stats = null;
        if ($request->has('include_stats')) {
            $stats = $this->calculerStatistiques($query);
        }

        return response()->json([
            'success' => true,
            'data' => MouvementStockResource::collection($mouvements),
            'stats' => $stats,
            'message' => 'Mouvements de stock récupérés avec succès',
        ]);
    }

    /**
     * Crée un mouvement de stock manuel
     */
    public function store(StoreMouvementStockRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $produit = Produit::findOrFail($request->produit_id);

            // Vérifier le stock disponible pour les sorties
            if ($request->type_mouvement === 'sortie') {
                $stockActuel = $request->type_stock === 'vente' 
                    ? $produit->stock_vente 
                    : $produit->stock_utilisation;

                if ($stockActuel < $request->quantite) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Stock insuffisant',
                        'stock_disponible' => $stockActuel,
                        'quantite_demandee' => $request->quantite,
                    ], 422);
                }
            }

            // Créer le mouvement
            $mouvement = MouvementStock::enregistrerMouvement(
                produitId: $request->produit_id,
                typeStock: $request->type_stock,
                typeMouvement: $request->type_mouvement,
                quantite: $request->quantite,
                motif: $request->motif,
                userId: auth()->id()
            );

            DB::commit();

            $mouvement->load(['produit', 'user']);

            return response()->json([
                'success' => true,
                'data' => new MouvementStockResource($mouvement),
                'message' => 'Mouvement de stock enregistré avec succès',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'enregistrement du mouvement',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Affiche un mouvement spécifique
     */
    public function show(MouvementStock $mouvement): JsonResponse
    {
        $mouvement->load([
            'produit.categorie',
            'user',
            'vente',
            'transfert',
            'confection'
        ]);

        return response()->json([
            'success' => true,
            'data' => new MouvementStockResource($mouvement),
            'message' => 'Mouvement récupéré avec succès',
        ]);
    }

    /**
     * Ajustement rapide de stock
     */
    public function ajuster(Request $request): JsonResponse
    {
        $request->validate([
            'produit_id' => 'required|exists:produits,id',
            'type_stock' => 'required|in:vente,utilisation',
            'nouveau_stock' => 'required|integer|min:0',
            'motif' => 'required|string|max:500',
        ]);

        DB::beginTransaction();
        try {
            $mouvement = MouvementStock::enregistrerMouvement(
                produitId: $request->produit_id,
                typeStock: $request->type_stock,
                typeMouvement: 'ajustement',
                quantite: $request->nouveau_stock,
                motif: $request->motif,
                userId: auth()->id()
            );

            DB::commit();

            $mouvement->load(['produit', 'user']);

            return response()->json([
                'success' => true,
                'data' => new MouvementStockResource($mouvement),
                'message' => 'Stock ajusté avec succès',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'ajustement du stock',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Exporte les mouvements en CSV
     */
    public function export(Request $request): JsonResponse
    {
        // Cette méthode retournerait normalement un fichier CSV
        // Pour l'instant, on retourne les données formatées
        
        $query = MouvementStock::query();

        // Appliquer les mêmes filtres que l'index
        if ($request->filled('produit_id')) {
            $query->where('produit_id', $request->produit_id);
        }

        if ($request->filled('type_stock')) {
            $query->where('type_stock', $request->type_stock);
        }

        if ($request->filled('type_mouvement')) {
            $query->where('type_mouvement', $request->type_mouvement);
        }

        if ($request->filled('date_debut') && $request->filled('date_fin')) {
            $query->whereBetween('created_at', [
                $request->date_debut,
                $request->date_fin
            ]);
        }

        $mouvements = $query->with(['produit', 'user'])->get();

        return response()->json([
            'success' => true,
            'data' => MouvementStockResource::collection($mouvements),
            'message' => 'Export préparé avec succès',
        ]);
    }

    /**
     * Calcule les statistiques des mouvements
     */
    private function calculerStatistiques($query): array
    {
        // Cloner la query pour ne pas affecter la pagination
        $statsQuery = clone $query;
        $mouvements = $statsQuery->get();

        return [
            'total_mouvements' => $mouvements->count(),
            'total_entrees' => $mouvements->where('type_mouvement', 'entree')->count(),
            'total_sorties' => $mouvements->where('type_mouvement', 'sortie')->count(),
            'total_ajustements' => $mouvements->where('type_mouvement', 'ajustement')->count(),
            'total_inventaires' => $mouvements->where('type_mouvement', 'inventaire')->count(),
            'quantite_entree' => $mouvements->where('type_mouvement', 'entree')->sum('quantite'),
            'quantite_sortie' => $mouvements->where('type_mouvement', 'sortie')->sum('quantite'),
            'par_type_stock' => [
                'vente' => $mouvements->where('type_stock', 'vente')->count(),
                'utilisation' => $mouvements->where('type_stock', 'utilisation')->count(),
            ],
        ];
    }
}