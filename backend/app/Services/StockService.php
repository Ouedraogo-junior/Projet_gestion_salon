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
            if ($detail->type_article === 'produit' && $detail->variante_id) {
                $this->decrementerStock($detail);
                $this->creerMouvementStock($detail, 'sortie');
            }
        }
    }

    public function restaurerStockVente(Vente $vente): void
    {
        foreach ($vente->details as $detail) {
            if ($detail->type_article === 'produit' && $detail->variante_id) {
                $this->incrementerStock($detail);
                $this->creerMouvementStock($detail, 'entree', 'Annulation vente');
            }
        }
    }

    protected function decrementerStock(VenteDetail $detail): void
    {
        $variante = $detail->variante;

        if (!$variante) {
            throw new Exception("Variante introuvable pour l'article {$detail->article_nom}");
        }

        if ($variante->type_stock_principal === 'reserve') {
            throw new Exception(
                "La variante {$variante->produit->nom} est en réserve. " .
                "Veuillez d'abord la transférer vers le stock vente."
            );
        }

        $champStock = $this->determinerChampStock($variante, $detail);

        if ($variante->$champStock < $detail->quantite) {
            throw new Exception(
                "Stock insuffisant pour {$variante->produit->nom}. " .
                "Disponible: {$variante->$champStock}, Demandé: {$detail->quantite}"
            );
        }

        $variante->decrement($champStock, $detail->quantite);
    }

    protected function incrementerStock(VenteDetail $detail): void
    {
        $variante = $detail->variante;
        if (!$variante) return;

        $champStock = $this->determinerChampStock($variante, $detail);
        $variante->increment($champStock, $detail->quantite);
    }

    protected function determinerChampStock(\App\Models\ProduitVariante $variante, VenteDetail $detail): string
    {
        if ($detail->prix_unitaire == $variante->prix_vente) {
            return 'stock_vente';
        }
        return 'stock_utilisation';
    }

    protected function creerMouvementStock(VenteDetail $detail, string $type, string $motifCustom = null): void
    {
        $motif    = $motifCustom ?? "Vente #{$detail->vente->numero_facture}";
        $variante = $detail->variante;
        $champStock = $this->determinerChampStock($variante, $detail);
        $typeStock  = $champStock === 'stock_vente' ? 'vente' : 'utilisation';

        $stockAvant = $variante->$champStock;
        $variante->refresh();
        $stockApres = $variante->$champStock;

        MouvementStock::create([
            'variante_id'    => $detail->variante_id,
            'vente_id'       => $detail->vente_id,
            'type_stock'     => $typeStock,
            'type_mouvement' => $type,
            'quantite'       => $detail->quantite,
            'stock_avant'    => $stockAvant,
            'stock_apres'    => $stockApres,
            'motif'          => $motif,
            'user_id'        => auth()->id(),
        ]);
    }

    public function verifierDisponibilite(int $varianteId, int $quantite, string $sourceStock = 'vente'): array
    {
        $variante = \App\Models\ProduitVariante::find($varianteId);

        if (!$variante) {
            return ['disponible' => false, 'message' => 'Variante introuvable'];
        }

        if ($variante->type_stock_principal === 'reserve') {
            return [
                'disponible'       => false,
                'message'          => 'Cette variante est en réserve. Transférez-la avant de vendre.',
                'stock_disponible' => 0,
            ];
        }

        $champStock      = $sourceStock === 'vente' ? 'stock_vente' : 'stock_utilisation';
        $stockDisponible = $variante->$champStock;

        if ($stockDisponible < $quantite) {
            return [
                'disponible'       => false,
                'message'          => "Stock insuffisant. Disponible: {$stockDisponible}",
                'stock_disponible' => $stockDisponible,
            ];
        }

        return ['disponible' => true, 'stock_disponible' => $stockDisponible];
    }

    public function getProduitsEnAlerte(): array
    {
        $variantes = \App\Models\ProduitVariante::where('is_active', true)
            ->with('produit')
            ->get();

        $alertes = [];

        foreach ($variantes as $v) {
            if ($v->seuil_alerte && $v->stock_vente <= $v->seuil_alerte) {
                $alertes[] = [
                    'variante'   => $v,
                    'type_stock' => 'vente',
                    'niveau'     => $v->stock_vente <= ($v->seuil_critique ?? 0) ? 'critique' : 'alerte',
                ];
            }
            if ($v->seuil_alerte_utilisation && $v->stock_utilisation <= $v->seuil_alerte_utilisation) {
                $alertes[] = [
                    'variante'   => $v,
                    'type_stock' => 'utilisation',
                    'niveau'     => $v->stock_utilisation <= ($v->seuil_critique_utilisation ?? 0) ? 'critique' : 'alerte',
                ];
            }
            if ($v->seuil_alerte_reserve && $v->stock_reserve <= $v->seuil_alerte_reserve) {
                $alertes[] = [
                    'variante'   => $v,
                    'type_stock' => 'reserve',
                    'niveau'     => $v->stock_reserve <= ($v->seuil_critique_reserve ?? 0) ? 'critique' : 'alerte',
                ];
            }
        }

        return $alertes;
    }
}