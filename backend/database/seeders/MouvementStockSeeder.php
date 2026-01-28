<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MouvementStockSeeder extends Seeder
{
    public function run(): void
    {
        $mouvements = [
            // =========================
            // STOCK INITIAL (INVENTAIRE)
            // =========================
            [
                'produit_id' => 1,
                'type_mouvement' => 'inventaire',
                'quantite' => 25,
                'stock_avant' => 0,
                'stock_apres' => 25,
                'motif' => 'Stock initial - inventaire de démarrage',
                'vente_id' => null,
                'user_id' => 1,
                'created_at' => Carbon::now()->subMonths(2),
                'updated_at' => Carbon::now()->subMonths(2),
            ],
            [
                'produit_id' => 3,
                'type_mouvement' => 'inventaire',
                'quantite' => 18,
                'stock_avant' => 0,
                'stock_apres' => 18,
                'motif' => 'Stock initial - inventaire de démarrage',
                'vente_id' => null,
                'user_id' => 1,
                'created_at' => Carbon::now()->subMonths(2),
                'updated_at' => Carbon::now()->subMonths(2),
            ],
            [
                'produit_id' => 6,
                'type_mouvement' => 'inventaire',
                'quantite' => 50,
                'stock_avant' => 0,
                'stock_apres' => 50,
                'motif' => 'Stock initial - inventaire de démarrage',
                'vente_id' => null,
                'user_id' => 1,
                'created_at' => Carbon::now()->subMonths(2),
                'updated_at' => Carbon::now()->subMonths(2),
            ],

            // =========================
            // SORTIES LIÉES AUX VENTES
            // =========================
            [
                'produit_id' => 1,
                'type_mouvement' => 'sortie',
                'quantite' => -1,
                'stock_avant' => 25,
                'stock_apres' => 24,
                'motif' => 'Vente à Jean-Baptiste Dipama',
                'vente_id' => 1, // correspond à Vente 1
                'user_id' => 3,
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(5),
            ],
            [
                'produit_id' => 6,
                'type_mouvement' => 'sortie',
                'quantite' => -1,
                'stock_avant' => 50,
                'stock_apres' => 49,
                'motif' => 'Vente à Jean-Baptiste Dipama',
                'vente_id' => 1, // correspond à Vente 1
                'user_id' => 3,
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(5),
            ],
            [
                'produit_id' => 3,
                'type_mouvement' => 'sortie',
                'quantite' => -1,
                'stock_avant' => 18,
                'stock_apres' => 17,
                'motif' => 'Vente à Paul Yameogo',
                'vente_id' => 3, // correspond à Vente 3
                'user_id' => 3,
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subDays(7),
            ],

            // =========================
            // RÉAPPROVISIONNEMENT
            // =========================
            [
                'produit_id' => 1,
                'type_mouvement' => 'entree',
                'quantite' => 6,
                'stock_avant' => 24,
                'stock_apres' => 30,
                'motif' => 'Réapprovisionnement fournisseur Beauty Supplies BF',
                'vente_id' => null,
                'user_id' => 1,
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            [
                'produit_id' => 6,
                'type_mouvement' => 'entree',
                'quantite' => 20,
                'stock_avant' => 49,
                'stock_apres' => 69,
                'motif' => 'Réapprovisionnement fournisseur Beauty Supplies BF',
                'vente_id' => null,
                'user_id' => 1,
                'created_at' => Carbon::now()->subDays(4),
                'updated_at' => Carbon::now()->subDays(4),
            ],

            // =========================
            // AJUSTEMENTS
            // =========================
            [
                'produit_id' => 3,
                'type_mouvement' => 'ajustement',
                'quantite' => -1,
                'stock_avant' => 17,
                'stock_apres' => 16,
                'motif' => 'Bouteille cassée lors de la manipulation',
                'vente_id' => null,
                'user_id' => 2,
                'created_at' => Carbon::now()->subDays(6),
                'updated_at' => Carbon::now()->subDays(6),
            ],
        ];

        DB::table('mouvements_stock')->insert($mouvements);
    }
}
