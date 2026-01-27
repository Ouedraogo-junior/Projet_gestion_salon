<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class ProduitCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'meta' => [
                'total' => $this->total(),
                'per_page' => $this->perPage(),
                'current_page' => $this->currentPage(),
                'last_page' => $this->lastPage(),
                'from' => $this->firstItem(),
                'to' => $this->lastItem(),
            ],
            'statistiques' => $this->when(
                $request->has('include_stats'),
                fn() => $this->calculerStatistiques()
            ),
        ];
    }
    
    /**
     * Calcule les statistiques globales des produits
     */
    private function calculerStatistiques(): array
    {
        $produits = $this->collection;
        
        return [
            'total_produits' => $produits->count(),
            'produits_actifs' => $produits->where('is_active', true)->count(),
            'produits_inactifs' => $produits->where('is_active', false)->count(),
            
            // Stocks
            'total_stock_vente' => $produits->sum('stock_vente'),
            'total_stock_utilisation' => $produits->sum('stock_utilisation'),
            'valeur_stock_vente' => $produits->sum(fn($p) => $p->stock_vente * $p->prix_achat),
            'valeur_stock_utilisation' => $produits->sum(fn($p) => $p->stock_utilisation * $p->prix_achat),
            'valeur_stock_total' => $produits->sum(fn($p) => 
                ($p->stock_vente + $p->stock_utilisation) * $p->prix_achat
            ),
            
            // Alertes
            'alertes_stock_vente' => $produits->filter(fn($p) => 
                $p->stock_vente <= $p->seuil_alerte
            )->count(),
            'alertes_stock_utilisation' => $produits->filter(fn($p) => 
                $p->stock_utilisation <= ($p->seuil_alerte_utilisation ?? 5)
            )->count(),
            'critiques_stock_vente' => $produits->filter(fn($p) => 
                $p->stock_vente <= $p->seuil_critique
            )->count(),
            'critiques_stock_utilisation' => $produits->filter(fn($p) => 
                $p->stock_utilisation <= ($p->seuil_critique_utilisation ?? 2)
            )->count(),
            
            // Prix
            'prix_moyen_achat' => round($produits->avg('prix_achat'), 2),
            'prix_moyen_vente' => round($produits->avg('prix_vente'), 2),
            'marge_moyenne' => round($produits->avg(fn($p) => 
                (($p->prix_vente - $p->prix_achat) / $p->prix_achat) * 100
            ), 2),
            
            // Promotions
            'produits_en_promo' => $produits->filter(function($p) {
                if (!$p->prix_promo || !$p->date_debut_promo || !$p->date_fin_promo) {
                    return false;
                }
                $now = now();
                return $now->between($p->date_debut_promo, $p->date_fin_promo);
            })->count(),
        ];
    }
}