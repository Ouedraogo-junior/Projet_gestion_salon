<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProduitResource extends JsonResource
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
            'nom' => $this->nom,
            'reference' => $this->reference,
            'description' => $this->description,
            'marque' => $this->marque,
            'fournisseur' => $this->fournisseur,
            
            // Catégorie
            'categorie_id' => $this->categorie_id,
            'categorie' => new CategorieResource($this->whenLoaded('categorie')),
            
            // Type de stock
            'type_stock_principal' => $this->type_stock_principal,

             // CHAMPS DE COMMANDE
            'date_commande' => $this->date_commande?->format('Y-m-d'),
            'date_reception' => $this->date_reception?->format('Y-m-d'),
            'devise_achat' => $this->devise_achat ?? 'FCFA',
            'taux_change' => $this->taux_change ? (float) $this->taux_change : null,
            'prix_achat_devise_origine' => $this->prix_achat_devise_origine ? (float) $this->prix_achat_devise_origine : null,  
            'prix_achat_stock_total' => $this->prix_achat_stock_total ? (float) $this->prix_achat_stock_total : null, 
            'quantite_stock_commande' => $this->quantite_stock_commande,
            'frais_cmb' => $this->frais_cmb ? (float) $this->frais_cmb : null,
            'frais_transit' => $this->frais_transit ? (float) $this->frais_transit : null,
            'moyen_paiement' => $this->moyen_paiement,
            'cbm' => $this->cbm ? (float) $this->cbm : null,
            'poids_kg' => $this->poids_kg ? (float) $this->poids_kg : null,
            'frais_bancaires' => $this->frais_bancaires ? (float) $this->frais_bancaires : null,
            'frais_courtier' => $this->frais_courtier ? (float) $this->frais_courtier : null,
            'frais_transport_local' => $this->frais_transport_local ? (float) $this->frais_transport_local : null,
            'montant_total_achat' => $this->montant_total_achat ? (float) $this->montant_total_achat : null,
            
            // Prix
            'prix_achat' => (float) $this->prix_achat,
            'prix_vente' => (float) $this->prix_vente,
            'prix_promo' => $this->prix_promo ? (float) $this->prix_promo : null,
            'date_debut_promo' => $this->date_debut_promo?->format('Y-m-d'),
            'date_fin_promo' => $this->date_fin_promo?->format('Y-m-d'),
            
            // Calculs de marge
            'marge_montant' => $this->calculerMarge(),
            'marge_pourcentage' => $this->calculerMargePourcentage(),
            'prix_actuel' => $this->getPrixActuel(),
            'en_promotion' => $this->estEnPromotion(),
            
            // Stocks
            'stock_vente' => $this->stock_vente,
            'stock_utilisation' => $this->stock_utilisation,
            'stock_reserve' => $this->stock_reserve ?? 0,
            'stock_total' => $this->stock_vente + $this->stock_utilisation + ($this->stock_reserve ?? 0),
            
            // Seuils vente
            'seuil_alerte' => $this->seuil_alerte,
            'seuil_critique' => $this->seuil_critique,
            
            // Seuils utilisation
            'seuil_alerte_utilisation' => $this->seuil_alerte_utilisation ?? 5,
            'seuil_critique_utilisation' => $this->seuil_critique_utilisation ?? 2,

            // Seuils réserve - AJOUTEZ CES LIGNES
            'seuil_alerte_reserve' => $this->seuil_alerte_reserve,
            'seuil_critique_reserve' => $this->seuil_critique_reserve,
            
            // Statuts des stocks
            'alerte_stock_vente' => $this->getStatutStockVente(),
            'alerte_stock_utilisation' => $this->getStatutStockUtilisation(),
            'alerte_stock_reserve' => $this->getStatutStockReserve(),
            'stock_vente_ok' => $this->stock_vente > $this->seuil_alerte,
            'stock_utilisation_ok' => $this->stock_utilisation > ($this->seuil_alerte_utilisation ?? 5),
            
            // Photo
            'photo_url' => $this->photo_url,
            
            // Gestion commande
            'quantite_min_commande' => $this->quantite_min_commande,
            'delai_livraison_jours' => $this->delai_livraison_jours,
            
            // Statut
            'is_active' => $this->is_active,
            'visible_public' => $this->visible_public,
            'sync_status' => $this->sync_status,
            
            // Attributs dynamiques
            'attributs' => $this->when(
                $this->relationLoaded('valeursAttributs'),
                fn() => $this->formaterAttributs()
            ),
            
            // Valorisation stock
            'valeur_stock_vente' => $this->stock_vente * $this->prix_achat,
            'valeur_stock_utilisation' => $this->stock_utilisation * $this->prix_achat,
            'valeur_stock_reserve' => ($this->stock_reserve ?? 0) * $this->prix_achat,  // ← AJOUTEZ
            'valeur_stock_total' => ($this->stock_vente + $this->stock_utilisation + ($this->stock_reserve ?? 0)) * $this->prix_achat,
            
            // Relations (si chargées)
            'mouvements_recents' => MouvementStockResource::collection(
                $this->whenLoaded('mouvementsStock')
            ),
            'transferts' => TransfertStockResource::collection(
                $this->whenLoaded('transferts')
            ),
            
            // Statistiques (si calculées)
            'stats' => $this->when(isset($this->stats), $this->stats),
            
            // Timestamps
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deleted_at?->format('Y-m-d H:i:s'),
        ];
    }
    
    /**
     * Calcule la marge en montant
     */
    private function calculerMarge(): float
    {
        return round($this->prix_vente - $this->prix_achat, 2);
    }
    
    /**
     * Calcule la marge en pourcentage
     */
    private function calculerMargePourcentage(): float
    {
        if ($this->prix_achat == 0) {
            return 0;
        }
        
        return round((($this->prix_vente - $this->prix_achat) / $this->prix_achat) * 100, 2);
    }
    
    /**
     * Obtient le prix actuel (avec promo si applicable)
     */
    private function getPrixActuel(): float
    {
        return $this->estEnPromotion() ? (float) $this->prix_promo : (float) $this->prix_vente;
    }
    
    /**
     * Vérifie si le produit est en promotion
     */
    private function estEnPromotion(): bool
    {
        if (!$this->prix_promo || !$this->date_debut_promo || !$this->date_fin_promo) {
            return false;
        }
        
        $now = now();
        return $now->between($this->date_debut_promo, $this->date_fin_promo);
    }
    
    /**
     * Obtient le statut du stock vente
     */
    private function getStatutStockVente(): string
    {
        if ($this->stock_vente <= $this->seuil_critique) {
            return 'critique';
        }
        
        if ($this->stock_vente <= $this->seuil_alerte) {
            return 'alerte';
        }
        
        return 'ok';
    }
    
    /**
     * Obtient le statut du stock utilisation
     */
    private function getStatutStockUtilisation(): string
    {
        $seuilCritique = $this->seuil_critique_utilisation ?? 2;
        $seuilAlerte = $this->seuil_alerte_utilisation ?? 5;
        
        if ($this->stock_utilisation <= $seuilCritique) {
            return 'critique';
        }
        
        if ($this->stock_utilisation <= $seuilAlerte) {
            return 'alerte';
        }
        
        return 'ok';
    }
    
    /**
     * Formate les attributs dynamiques
     */
    private function formaterAttributs(): array
    {
        return $this->valeursAttributs->map(function ($valeur) {
            return [
                'attribut_id' => $valeur->attribut_id,
                'nom' => $valeur->attribut->nom,
                'slug' => $valeur->attribut->slug,
                'type_valeur' => $valeur->attribut->type_valeur,
                'valeur' => $valeur->valeur,
                'valeur_formatee' => $valeur->valeur_formatee,
                'unite' => $valeur->attribut->unite,
            ];
        })->toArray();
    }

    /**
     * Obtient le statut du stock réserve
     */
    private function getStatutStockReserve(): string
    {
        if (!$this->seuil_critique_reserve && !$this->seuil_alerte_reserve) {
            return 'ok';
        }
        
        if ($this->seuil_critique_reserve && $this->stock_reserve <= $this->seuil_critique_reserve) {
            return 'critique';
        }
        
        if ($this->seuil_alerte_reserve && $this->stock_reserve <= $this->seuil_alerte_reserve) {
            return 'alerte';
        }
        
        return 'ok';
    }
}