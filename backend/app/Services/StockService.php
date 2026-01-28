<?php

namespace App\Services;

use App\Models\Vente;
use App\Models\VenteDetail;
use App\Models\Produit;
use App\Models\MouvementStock;
use Exception;

class StockService
{
    /**
     * Traiter les mouvements de stock pour une vente
     */
    public function traiterStockVente(Vente $vente): void
    {
        foreach ($vente->details as $detail) {
            if ($detail->type_article === 'produit' && $detail->produit_id) {
                $this->decrementerStock($detail);
                $this->creerMouvementStock($detail, 'sortie');
            }
        }
    }

    /**
     * Restaurer les stocks lors d'une annulation
     */
    public function restaurerStockVente(Vente $vente): void
    {
        foreach ($vente->details as $detail) {
            if ($detail->type_article === 'produit' && $detail->produit_id) {
                $this->incrementerStock($detail);
                $this->creerMouvementStock($detail, 'entree', 'Annulation vente');
            }
        }
    }

    /**
     * Décrémenter le stock approprié
     */
    protected function decrementerStock(VenteDetail $detail): void
    {
        $produit = $detail->produit;
        
        if (!$produit) {
            throw new Exception("Produit introuvable pour l'article {$detail->article_nom}");
        }

        // Déterminer le stock à décrémenter
        $champStock = $this->determinerChampStock($produit, $detail);

        if ($produit->$champStock < $detail->quantite) {
            throw new Exception(
                "Stock insuffisant pour {$produit->nom}. " .
                "Disponible: {$produit->$champStock}, Demandé: {$detail->quantite}"
            );
        }

        $produit->decrement($champStock, $detail->quantite);
    }

    /**
     * Incrémenter le stock approprié
     */
    protected function incrementerStock(VenteDetail $detail): void
    {
        $produit = $detail->produit;
        
        if (!$produit) {
            return; // Si le produit n'existe plus, on ne peut pas restaurer
        }

        $champStock = $this->determinerChampStock($produit, $detail);
        $produit->increment($champStock, $detail->quantite);
    }

    /**
     * Déterminer quel champ de stock utiliser
     */
    protected function determinerChampStock(Produit $produit, VenteDetail $detail): string
    {
        // Si le prix correspond au prix de vente, c'est du stock vente
        if ($detail->prix_unitaire == $produit->prix_vente) {
            return 'stock_vente';
        }
        
        // Sinon, c'est du stock d'utilisation
        return 'stock_utilisation';
    }

    /**
     * Créer un mouvement de stock
     */
    protected function creerMouvementStock(VenteDetail $detail, string $type, string $motifCustom = null): void
    {
        $motif = $motifCustom ?? "Vente #{$detail->vente->numero_facture}";

        MouvementStock::create([
            'produit_id' => $detail->produit_id,
            'vente_id' => $detail->vente_id,
            'type_mouvement' => $type,
            'quantite' => $detail->quantite,
            'stock_avant' => $this->getStockAvant($detail),
            'stock_apres' => $this->getStockApres($detail, $type),
            'motif' => $motif,
            'user_id' => auth()->id(),
        ]);
    }

    /**
     * Obtenir le stock avant mouvement
     */
    protected function getStockAvant(VenteDetail $detail): int
    {
        $produit = $detail->produit;
        $champStock = $this->determinerChampStock($produit, $detail);
        return $produit->$champStock;
    }

    /**
     * Obtenir le stock après mouvement
     */
    protected function getStockApres(VenteDetail $detail, string $type): int
    {
        $produit = $detail->produit->fresh();
        $champStock = $this->determinerChampStock($produit, $detail);
        return $produit->$champStock;
    }

    /**
     * Vérifier la disponibilité du stock
     */
    public function verifierDisponibilite(int $produitId, int $quantite, string $sourceStock = 'vente'): array
    {
        $produit = Produit::find($produitId);

        if (!$produit) {
            return [
                'disponible' => false,
                'message' => 'Produit introuvable',
            ];
        }

        $champStock = $sourceStock === 'vente' ? 'stock_vente' : 'stock_utilisation';
        $stockDisponible = $produit->$champStock;

        if ($stockDisponible < $quantite) {
            return [
                'disponible' => false,
                'message' => "Stock insuffisant. Disponible: {$stockDisponible}",
                'stock_disponible' => $stockDisponible,
            ];
        }

        return [
            'disponible' => true,
            'stock_disponible' => $stockDisponible,
        ];
    }

    /**
     * Obtenir les produits en alerte de stock
     */
    public function getProduitsEnAlerte(): array
    {
        $produitsVenteAlerte = Produit::whereColumn('stock_vente', '<=', 'seuil_alerte')
            ->where('is_active', true)
            ->get()
            ->map(function ($produit) {
                return [
                    'produit' => $produit,
                    'type_stock' => 'vente',
                    'niveau' => $produit->stock_vente <= $produit->seuil_critique ? 'critique' : 'alerte',
                ];
            });

        $produitsUtilisationAlerte = Produit::whereColumn('stock_utilisation', '<=', 'seuil_alerte_utilisation')
            ->where('is_active', true)
            ->get()
            ->map(function ($produit) {
                return [
                    'produit' => $produit,
                    'type_stock' => 'utilisation',
                    'niveau' => $produit->stock_utilisation <= $produit->seuil_critique_utilisation ? 'critique' : 'alerte',
                ];
            });

        return array_merge($produitsVenteAlerte->toArray(), $produitsUtilisationAlerte->toArray());
    }
}