<?php
namespace App\Observers;

use App\Models\ProduitVariante;
use App\Services\NotificationService;

class ProduitVarianteObserver
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function updated(ProduitVariante $variante): void
    {
        $stocksModifies = array_intersect(
            array_keys($variante->getDirty()),
            ['stock_vente', 'stock_utilisation', 'stock_reserve']
        );

        if (empty($stocksModifies)) {
            return;
        }

        $this->verifierStock($variante, $stocksModifies);
    }

    protected function verifierStock(ProduitVariante $variante, array $stocksModifies): void
    {
        if (in_array('stock_vente', $stocksModifies)) {
            if ($variante->seuil_critique && $variante->stock_vente <= $variante->seuil_critique) {
                $this->notificationService->notifierStockCritique($variante, 'vente');
            } elseif ($variante->seuil_alerte && $variante->stock_vente <= $variante->seuil_alerte) {
                $this->notificationService->notifierStockAlerte($variante, 'vente');
            }
        }

        if (in_array('stock_utilisation', $stocksModifies)) {
            if ($variante->seuil_critique_utilisation && $variante->stock_utilisation <= $variante->seuil_critique_utilisation) {
                $this->notificationService->notifierStockCritique($variante, 'utilisation');
            } elseif ($variante->seuil_alerte_utilisation && $variante->stock_utilisation <= $variante->seuil_alerte_utilisation) {
                $this->notificationService->notifierStockAlerte($variante, 'utilisation');
            }
        }

        if (in_array('stock_reserve', $stocksModifies)) {
            if ($variante->seuil_critique_reserve && $variante->stock_reserve <= $variante->seuil_critique_reserve) {
                $this->notificationService->notifierStockCritique($variante, 'reserve');
            } elseif ($variante->seuil_alerte_reserve && $variante->stock_reserve <= $variante->seuil_alerte_reserve) {
                $this->notificationService->notifierStockAlerte($variante, 'reserve');
            }
        }
    }
}