<?php

namespace App\Observers;

use App\Models\Produit;
use App\Services\NotificationService;

class ProduitObserver
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Après création ou mise à jour du produit
     */
    public function saved(Produit $produit)
    {
        $this->verifierStock($produit);
    }

    /**
     * Vérifier et notifier les alertes de stock
     */
    protected function verifierStock(Produit $produit): void
    {
        // Stock vente critique
        if ($produit->stock_vente <= $produit->seuil_critique) {
            $this->notificationService->notifierStockCritique($produit);
        }
        // Stock vente en alerte
        elseif ($produit->stock_vente <= $produit->seuil_alerte) {
            $this->notificationService->notifierStockAlerte($produit);
        }

        // Stock utilisation critique
        if ($produit->stock_utilisation <= $produit->seuil_critique_utilisation) {
            $this->notificationService->notifierStockCritique($produit);
        }
        // Stock utilisation en alerte
        elseif ($produit->stock_utilisation <= $produit->seuil_alerte_utilisation) {
            $this->notificationService->notifierStockAlerte($produit);
        }
    }
}