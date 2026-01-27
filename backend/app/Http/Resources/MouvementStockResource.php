<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MouvementStockResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            
            // Produit
            'produit_id' => $this->produit_id,
            'produit' => new ProduitResource($this->whenLoaded('produit')),
            
            // Type de stock et mouvement
            'type_stock' => $this->type_stock,
            'type_stock_libelle' => $this->type_stock_libelle,
            'type_mouvement' => $this->type_mouvement,
            'type_mouvement_libelle' => $this->type_mouvement_libelle,
            
            // Quantités
            'quantite' => $this->quantite,
            'stock_avant' => $this->stock_avant,
            'stock_apres' => $this->stock_apres,
            'variation' => $this->stock_apres - $this->stock_avant,
            
            // Motif
            'motif' => $this->motif,
            
            // Relations avec autres entités
            'vente_id' => $this->vente_id,
            'vente' => $this->whenLoaded('vente'),
            
            'transfert_id' => $this->transfert_id,
            'transfert' => new TransfertStockResource($this->whenLoaded('transfert')),
            
            'confection_id' => $this->confection_id,
            'confection' => $this->whenLoaded('confection'),
            
            // Utilisateur
            'user_id' => $this->user_id,
            'user' => $this->when(
                $this->relationLoaded('user'),
                [
                    'id' => $this->user?->id,
                    'nom_complet' => $this->user?->nom_complet,
                    'role' => $this->user?->role,
                ]
            ),
            
            // Indicateurs visuels
            'is_entree' => $this->isEntree(),
            'is_sortie' => $this->isSortie(),
            'is_ajustement' => $this->isAjustement(),
            'is_inventaire' => $this->isInventaire(),
            
            // Timestamps
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'date_mouvement' => $this->created_at?->format('d/m/Y'),
            'heure_mouvement' => $this->created_at?->format('H:i'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}