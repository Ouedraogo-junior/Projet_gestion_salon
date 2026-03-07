<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProduitResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'nom'            => $this->nom,
            'description'    => $this->description,
            'marque'         => $this->marque,
            'fournisseur'    => $this->fournisseur,
            'categorie_id'   => $this->categorie_id,
            'categorie'      => new CategorieResource($this->whenLoaded('categorie')),
            'photo_url'      => $this->photo_url,
            'visible_public' => $this->visible_public,
            'is_active'      => $this->is_active,
            'salon_id'       => $this->salon_id,
            'prix_min'       => $this->prix_min,
            'prix_max'       => $this->prix_max,
            'stock_total'    => $this->stock_total,
            'has_variantes'  => $this->hasVariantes(),
            'variantes'      => $this->when(
                $this->relationLoaded('variantes'),
                fn() => $this->variantes->map(fn($v) => $this->formaterVariante($v))
            ),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deleted_at?->format('Y-m-d H:i:s'),
        ];
    }

    // ========================================
    // VARIANTE
    // ========================================

    private function formaterVariante($variante): array
    {
        return [
            'id'        => $variante->id,
            'reference' => $variante->reference,

            // Prix
            'prix_achat'       => (float) $variante->prix_achat,
            'prix_vente'       => (float) $variante->prix_vente,
            'prix_promo'       => $variante->prix_promo ? (float) $variante->prix_promo : null,
            'date_debut_promo' => $variante->date_debut_promo?->format('Y-m-d'),
            'date_fin_promo'   => $variante->date_fin_promo?->format('Y-m-d'),
            'prix_actuel'      => $this->getPrixActuelVariante($variante),
            'en_promotion'     => $this->estEnPromotionVariante($variante),

            // Marges
            'marge_montant'           => $variante->marge_unitaire,
            'marge_pourcentage'       => $variante->marge_pourcentage,
            'gain_total_commande'     => $variante->gain_total_commande,
            'gain_total_stock_actuel' => $variante->gain_total_stock_actuel,

            // Stocks
            'stock_vente'               => $variante->stock_vente,
            'stock_utilisation'         => $variante->stock_utilisation,
            'stock_reserve'             => $variante->stock_reserve ?? 0,
            'stock_total'               => $variante->stock_total,
            'seuil_alerte'              => $variante->seuil_alerte,
            'seuil_critique'            => $variante->seuil_critique,
            'seuil_alerte_utilisation'  => $variante->seuil_alerte_utilisation ?? 5,
            'seuil_critique_utilisation' => $variante->seuil_critique_utilisation ?? 2,
            'seuil_alerte_reserve'      => $variante->seuil_alerte_reserve,
            'seuil_critique_reserve'    => $variante->seuil_critique_reserve,
            'alerte_stock_vente'        => $this->getStatutStock(
                $variante->stock_vente,
                $variante->seuil_alerte,
                $variante->seuil_critique
            ),
            'alerte_stock_utilisation'  => $this->getStatutStock(
                $variante->stock_utilisation,
                $variante->seuil_alerte_utilisation ?? 5,
                $variante->seuil_critique_utilisation ?? 2
            ),
            'alerte_stock_reserve'      => $this->getStatutStock(
                $variante->stock_reserve,
                $variante->seuil_alerte_reserve,
                $variante->seuil_critique_reserve
            ),

            // Achat / Import
            'type_stock_principal'      => $variante->type_stock_principal,
            'devise_achat'              => $variante->devise_achat ?? 'FCFA',
            'taux_change'               => $variante->taux_change ? (float) $variante->taux_change : null,
            'prix_achat_devise_origine' => $variante->prix_achat_devise_origine ? (float) $variante->prix_achat_devise_origine : null,
            'prix_achat_stock_total'    => $variante->prix_achat_stock_total ? (float) $variante->prix_achat_stock_total : null,
            'quantite_stock_commande'   => $variante->quantite_stock_commande,
            'frais_cmb'                 => $variante->frais_cmb ? (float) $variante->frais_cmb : null,
            'frais_transit'             => $variante->frais_transit ? (float) $variante->frais_transit : null,
            'frais_bancaires'           => $variante->frais_bancaires ? (float) $variante->frais_bancaires : null,
            'frais_courtier'            => $variante->frais_courtier ? (float) $variante->frais_courtier : null,
            'frais_transport_local'     => $variante->frais_transport_local ? (float) $variante->frais_transport_local : null,
            'montant_total_achat'       => $variante->montant_total_achat ? (float) $variante->montant_total_achat : null,
            'moyen_paiement'            => $variante->moyen_paiement,
            'date_commande'             => $variante->date_commande?->format('Y-m-d'),
            'date_reception'            => $variante->date_reception?->format('Y-m-d'),
            'cbm'                       => $variante->cbm ? (float) $variante->cbm : null,
            'poids_kg'                  => $variante->poids_kg ? (float) $variante->poids_kg : null,
            'quantite_min_commande'     => $variante->quantite_min_commande,
            'delai_livraison_jours'     => $variante->delai_livraison_jours,

            // Valorisation
            'valeur_stock_vente'        => $variante->stock_vente * $variante->prix_achat,
            'valeur_stock_utilisation'  => $variante->stock_utilisation * $variante->prix_achat,
            'valeur_stock_reserve'      => ($variante->stock_reserve ?? 0) * $variante->prix_achat,
            'valeur_stock_total'        => $variante->stock_total * $variante->prix_achat,

            // Validation
            'statut_validation' => $variante->statut_validation,
            'motif_rejet'       => $variante->motif_rejet,
            'valide_le'         => $variante->valide_le?->format('d/m/Y H:i'),
            'is_active'         => $variante->is_active,
            'sync_status'       => $variante->sync_status,
            'validateur'        => $variante->relationLoaded('validateur') ? [
                'id'   => $variante->validateur?->id,
                'name' => trim($variante->validateur?->prenom . ' ' . $variante->validateur?->nom),
            ] : null,
            'createur'          => $variante->relationLoaded('createur') ? [
                'id'   => $variante->createur?->id,
                'name' => trim($variante->createur?->prenom . ' ' . $variante->createur?->nom),
            ] : null,

            // Attributs
            'attributs' => $variante->relationLoaded('valeursAttributs')
                ? $variante->valeursAttributs->map(fn($val) => [
                    'attribut_id'    => $val->attribut_id,
                    'nom'            => $val->attribut->nom,
                    'slug'           => $val->attribut->slug,
                    'type_valeur'    => $val->attribut->type_valeur,
                    'valeur'         => $val->valeur,
                    'valeur_formatee' => $val->valeur_formatee,
                    'unite'          => $val->attribut->unite,
                ])->toArray()
                : [],

            // Mouvements et transferts
            'mouvements_recents' => $variante->relationLoaded('mouvementsStock')
                ? MouvementStockResource::collection($variante->mouvementsStock)
                : [],
            'transferts'         => $variante->relationLoaded('transferts')
                ? TransfertStockResource::collection($variante->transferts)
                : [],
        ];
    }

    // ========================================
    // HELPERS PRIVÉS
    // ========================================

    private function getPrixActuelVariante($variante): float
    {
        return $this->estEnPromotionVariante($variante)
            ? (float) $variante->prix_promo
            : (float) $variante->prix_vente;
    }

    private function estEnPromotionVariante($variante): bool
    {
        if (!$variante->prix_promo || !$variante->date_debut_promo || !$variante->date_fin_promo) {
            return false;
        }
        return now()->between($variante->date_debut_promo, $variante->date_fin_promo);
    }

    private function getStatutStock($stock, $seuilAlerte, $seuilCritique): string
    {
        if ($seuilCritique && $stock <= $seuilCritique) return 'critique';
        if ($seuilAlerte && $stock <= $seuilAlerte) return 'alerte';
        return 'ok';
    }
}