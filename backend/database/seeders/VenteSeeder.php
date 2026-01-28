<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class VenteSeeder extends Seeder
{
    public function run(): void
    {
        // IDs existants (doivent exister dans la DB)
        $vendeurId = DB::table('users')->value('id');

        $now = Carbon::now();

        /**
         * ============================
         * VENTE 1 — MIXTE
         * ============================
         */
        $vente1Id = DB::table('ventes')->insertGetId([
            'numero_facture' => 'FAC-' . $now->format('Ymd') . '-001',

            'client_id' => 1,
            'coiffeur_id' => 2,
            'vendeur_id' => $vendeurId,
            'rendez_vous_id' => 1,

            'type_vente' => 'mixte',
            'date_vente' => $now->copy()->subDays(2),

            'montant_prestations' => 5000,
            'montant_produits' => 12000,
            'montant_total_ht' => 17000,

            'montant_reduction' => 0,
            'type_reduction' => 'aucune',

            'montant_total_ttc' => 17000,

            'mode_paiement' => 'especes',
            'montant_paye' => 20000,
            'montant_rendu' => 3000,

            'statut_paiement' => 'paye',
            'solde_restant' => 0,

            'recu_imprime' => true,
            'points_gagnes' => 17,
            'points_utilises' => 0,

            'sync_status' => 'synced',

            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('ventes_details')->insert([
            [
                'vente_id' => $vente1Id,
                'type_article' => 'prestation',
                'article_nom' => 'Coupe + Brushing',
                'prestation_id' => 1,
                'produit_id' => null,
                'quantite' => 1,
                'prix_unitaire' => 5000,
                'prix_total' => 5000,
                'reduction' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'vente_id' => $vente1Id,
                'type_article' => 'produit',
                'article_nom' => 'Shampooing Pro',
                'prestation_id' => null,
                'produit_id' => 1,
                'quantite' => 2,
                'prix_unitaire' => 6000,
                'prix_total' => 12000,
                'reduction' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        /**
         * ============================
         * VENTE 2 — PRESTATION
         * ============================
         */
        $vente2Id = DB::table('ventes')->insertGetId([
            'numero_facture' => 'FAC-' . $now->copy()->subDay()->format('Ymd') . '-002',

            'client_id' => 2,
            'coiffeur_id' => 3,
            'vendeur_id' => $vendeurId,
            'rendez_vous_id' => 2,

            'type_vente' => 'prestations',
            'date_vente' => $now->copy()->subDay(),

            'montant_prestations' => 8000,
            'montant_produits' => 0,
            'montant_total_ht' => 8000,

            'montant_reduction' => 500,
            'type_reduction' => 'promo',

            'montant_total_ttc' => 7500,

            'mode_paiement' => 'orange_money',
            'montant_paye' => 7500,
            'montant_rendu' => 0,

            'statut_paiement' => 'paye',
            'solde_restant' => 0,

            'recu_imprime' => true,
            'points_gagnes' => 8,
            'points_utilises' => 0,

            'sync_status' => 'synced',

            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('ventes_details')->insert([
            [
                'vente_id' => $vente2Id,
                'type_article' => 'prestation',
                'article_nom' => 'Tresses Complètes',
                'prestation_id' => 2,
                'produit_id' => null,
                'quantite' => 1,
                'prix_unitaire' => 8000,
                'prix_total' => 8000,
                'reduction' => 500,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        /**
         * ============================
         * VENTE 3 — PRODUITS
         * ============================
         */
        $vente3Id = DB::table('ventes')->insertGetId([
            'numero_facture' => 'FAC-' . $now->copy()->subDays(3)->format('Ymd') . '-003',

            'client_id' => 3,
            'coiffeur_id' => null,
            'vendeur_id' => $vendeurId,
            'rendez_vous_id' => null,

            'type_vente' => 'produits',
            'date_vente' => $now->copy()->subDays(3),

            'montant_prestations' => 0,
            'montant_produits' => 25000,
            'montant_total_ht' => 25000,

            'montant_reduction' => 0,
            'type_reduction' => 'aucune',

            'montant_total_ttc' => 25000,

            'mode_paiement' => 'carte',
            'montant_paye' => 25000,
            'montant_rendu' => 0,

            'statut_paiement' => 'paye',
            'solde_restant' => 0,

            'recu_imprime' => true,
            'points_gagnes' => 25,
            'points_utilises' => 0,

            'sync_status' => 'synced',

            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('ventes_details')->insert([
            [
                'vente_id' => $vente3Id,
                'type_article' => 'produit',
                'article_nom' => 'Huile Capillaire',
                'prestation_id' => null,
                'produit_id' => 2,
                'quantite' => 2,
                'prix_unitaire' => 12500,
                'prix_total' => 25000,
                'reduction' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
