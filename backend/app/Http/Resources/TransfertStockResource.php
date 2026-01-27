<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransfertStockResource extends JsonResource
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
            'numero_transfert' => $this->numero_transfert,
            
            // Produit
            'produit_id' => $this->produit_id,
            'produit' => new ProduitResource($this->whenLoaded('produit')),
            
            // Type de transfert
            'type_transfert' => $this->type_transfert,
            'type_transfert_libelle' => $this->type_transfert_libelle,
            'stock_source' => $this->stock_source,
            'stock_destination' => $this->stock_destination,
            
            // Quantité et valorisation
            'quantite' => $this->quantite,
            'prix_unitaire' => (float) $this->prix_unitaire,
            'montant_total' => (float) $this->montant_total,
            
            // Motif
            'motif' => $this->motif,
            
            // Statut
            'valide' => $this->valide,
            'statut' => $this->valide ? 'validé' : 'en_attente',
            'statut_badge' => $this->getStatutBadge(),
            
            // Utilisateur créateur
            'user_id' => $this->user_id,
            'user' => $this->when(
                $this->relationLoaded('user'),
                [
                    'id' => $this->user?->id,
                    'nom_complet' => $this->user?->nom_complet,
                    'role' => $this->user?->role,
                ]
            ),
            
            // Valideur
            'valideur_id' => $this->valideur_id,
            'valideur' => $this->when(
                $this->relationLoaded('valideur') && $this->valideur,
                [
                    'id' => $this->valideur?->id,
                    'nom_complet' => $this->valideur?->nom_complet,
                    'role' => $this->valideur?->role,
                ]
            ),
            'date_validation' => $this->date_validation?->format('Y-m-d H:i:s'),
            
            // Mouvements générés
            'mouvements' => MouvementStockResource::collection(
                $this->whenLoaded('mouvements')
            ),
            'nombre_mouvements' => $this->whenCounted('mouvements'),
            
            // Actions possibles
            'peut_valider' => !$this->valide,
            'peut_annuler' => !$this->valide,
            
            // Timestamps
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'date_transfert' => $this->created_at?->format('d/m/Y'),
            'heure_transfert' => $this->created_at?->format('H:i'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            
            // Temps écoulé
            'temps_attente' => $this->when(
                !$this->valide,
                $this->created_at?->diffForHumans()
            ),
        ];
    }
    
    /**
     * Obtient le badge de statut pour l'affichage
     */
    private function getStatutBadge(): array
    {
        if ($this->valide) {
            return [
                'label' => 'Validé',
                'color' => 'success',
                'icon' => 'check-circle',
            ];
        }
        
        return [
            'label' => 'En attente',
            'color' => 'warning',
            'icon' => 'clock',
        ];
    }
}