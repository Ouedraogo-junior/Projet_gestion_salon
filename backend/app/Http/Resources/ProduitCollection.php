<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class ProduitCollection extends ResourceCollection
{
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'meta' => [
                'total'        => $this->total(),
                'per_page'     => $this->perPage(),
                'current_page' => $this->currentPage(),
                'last_page'    => $this->lastPage(),
                'from'         => $this->firstItem(),
                'to'           => $this->lastItem(),
            ],
            'statistiques' => $this->when(
                $request->has('include_stats'),
                fn() => $this->calculerStatistiques()
            ),
        ];
    }

    // ========================================
    // STATISTIQUES
    // ========================================

    private function calculerStatistiques(): array
    {
        $produits = $this->collection;

        // Aplatir toutes les variantes de tous les produits
        $variantes = $produits->flatMap(fn($p) => $p->resource->variantes ?? collect());

        return [
            'total_produits'   => $produits->count(),
            'produits_actifs'  => $produits->where('is_active', true)->count(),
            'produits_inactifs' => $produits->where('is_active', false)->count(),

            // Stocks (agrégés sur toutes les variantes)
            'total_stock_vente'       => $variantes->sum('stock_vente'),
            'total_stock_utilisation' => $variantes->sum('stock_utilisation'),
            'total_stock_reserve'     => $variantes->sum('stock_reserve'),
            'valeur_stock_vente'      => $variantes->sum(fn($v) => $v->stock_vente * $v->prix_achat),
            'valeur_stock_utilisation' => $variantes->sum(fn($v) => $v->stock_utilisation * $v->prix_achat),
            'valeur_stock_reserve'    => $variantes->sum(fn($v) => ($v->stock_reserve ?? 0) * $v->prix_achat),
            'valeur_stock_total'      => $variantes->sum(fn($v) =>
                ($v->stock_vente + $v->stock_utilisation + ($v->stock_reserve ?? 0)) * $v->prix_achat
            ),

            // Alertes (par variante)
            'alertes_stock_vente'          => $variantes->filter(fn($v) =>
                $v->seuil_alerte && $v->stock_vente <= $v->seuil_alerte
            )->count(),
            'alertes_stock_utilisation'    => $variantes->filter(fn($v) =>
                $v->stock_utilisation <= ($v->seuil_alerte_utilisation ?? 5)
            )->count(),
            'alertes_stock_reserve'        => $variantes->filter(fn($v) =>
                $v->seuil_alerte_reserve && $v->stock_reserve <= $v->seuil_alerte_reserve
            )->count(),
            'critiques_stock_vente'        => $variantes->filter(fn($v) =>
                $v->seuil_critique && $v->stock_vente <= $v->seuil_critique
            )->count(),
            'critiques_stock_utilisation'  => $variantes->filter(fn($v) =>
                $v->stock_utilisation <= ($v->seuil_critique_utilisation ?? 2)
            )->count(),
            'critiques_stock_reserve'      => $variantes->filter(fn($v) =>
                $v->seuil_critique_reserve && $v->stock_reserve <= $v->seuil_critique_reserve
            )->count(),

            // Prix (moyennes sur les variantes)
            'prix_moyen_achat' => round($variantes->avg('prix_achat'), 2),
            'prix_moyen_vente' => round($variantes->avg('prix_vente'), 2),
            'marge_moyenne'    => round($variantes->avg(fn($v) =>
                $v->prix_achat > 0
                    ? (($v->prix_vente - $v->prix_achat) / $v->prix_achat) * 100
                    : 0
            ), 2),

            // Promotions
            'produits_en_promo' => $variantes->filter(function ($v) {
                if (!$v->prix_promo || !$v->date_debut_promo || !$v->date_fin_promo) {
                    return false;
                }
                return now()->between($v->date_debut_promo, $v->date_fin_promo);
            })->count(),

            // Validation
            'variantes_en_attente' => $variantes->where('statut_validation', 'en_attente')->count(),
            'variantes_rejetees'   => $variantes->where('statut_validation', 'rejete')->count(),
            'variantes_validees'   => $variantes->where('statut_validation', 'valide')->count(),
        ];
    }
}