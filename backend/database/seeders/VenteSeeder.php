<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class VenteSeeder extends Seeder
{
    public function run(): void
    {
        // Vente 1 - Coupe simple avec produits
        $vente1Id = DB::table('ventes')->insertGetId([
            'numero_facture' => 'FAC-' . now()->format('Ymd') . '-001',
            'client_id' => 1,
            'coiffeur_id' => 3,
            'rendez_vous_id' => 1,
            'date_vente' => Carbon::now()->subDays(5)->setTime(10, 45),
            'montant_prestations' => 3000,
            'montant_produits' => 16000,
            'montant_total_ht' => 19000,
            'montant_reduction' => 0,
            'type_reduction' => 'aucune',
            'montant_total_ttc' => 19000,
            'mode_paiement' => 'especes',
            'montant_paye' => 20000,
            'montant_rendu' => 1000,
            'statut_paiement' => 'paye',
            'solde_restant' => 0,
            'recu_imprime' => true,
            'points_gagnes' => 19,
            'points_utilises' => 0,
            'notes' => null,
            'sync_status' => 'synced',
            'created_at' => Carbon::now()->subDays(5),
            'updated_at' => Carbon::now()->subDays(5),
        ]);

        DB::table('ventes_details')->insert([
            [
                'vente_id' => $vente1Id,
                'type_article' => 'prestation',
                'article_nom' => 'Coupe Homme + Dégradé',
                'produit_id' => null,
                'quantite' => 1,
                'prix_unitaire' => 3000,
                'prix_total' => 3000,
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(5),
            ],
            [
                'vente_id' => $vente1Id,
                'type_article' => 'produit',
                'article_nom' => 'Shampooing Hydratant Kerastase',
                'produit_id' => 1,
                'quantite' => 1,
                'prix_unitaire' => 15000,
                'prix_total' => 15000,
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(5),
            ],
            [
                'vente_id' => $vente1Id,
                'type_article' => 'produit',
                'article_nom' => 'Gel Coiffant Extra Fort',
                'produit_id' => 6,
                'quantite' => 1,
                'prix_unitaire' => 4000,
                'prix_total' => 4000,
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(5),
            ],
        ]);

        // Vente 2 - Tresses avec réduction fidélité
        $vente2Id = DB::table('ventes')->insertGetId([
            'numero_facture' => 'FAC-' . now()->subDays(15)->format('Ymd') . '-045',
            'client_id' => 2,
            'coiffeur_id' => 4,
            'rendez_vous_id' => 2,
            'date_vente' => Carbon::now()->subDays(15)->setTime(11, 0),
            'montant_prestations' => 8000,
            'montant_produits' => 0,
            'montant_total_ht' => 8000,
            'montant_reduction' => 800,
            'type_reduction' => 'fidelite',
            'montant_total_ttc' => 7200,
            'mode_paiement' => 'orange_money',
            'montant_paye' => 7200,
            'montant_rendu' => 0,
            'statut_paiement' => 'paye',
            'solde_restant' => 0,
            'recu_imprime' => true,
            'points_gagnes' => 72,
            'points_utilises' => 80,
            'notes' => 'Utilisation points fidélité',
            'sync_status' => 'synced',
            'created_at' => Carbon::now()->subDays(15),
            'updated_at' => Carbon::now()->subDays(15),
        ]);

        DB::table('ventes_details')->insert([
            [
                'vente_id' => $vente2Id,
                'type_article' => 'prestation',
                'article_nom' => 'Tresses Africaines Simples',
                'produit_id' => null,
                'quantite' => 1,
                'prix_unitaire' => 8000,
                'prix_total' => 8000,
                'created_at' => Carbon::now()->subDays(15),
                'updated_at' => Carbon::now()->subDays(15),
            ],
        ]);

        // Vente 3 - Coupe + Barbe VIP
        $vente3Id = DB::table('ventes')->insertGetId([
            'numero_facture' => 'FAC-' . now()->subDays(7)->format('Ymd') . '-023',
            'client_id' => 3,
            'coiffeur_id' => 3,
            'rendez_vous_id' => 3,
            'date_vente' => Carbon::now()->subDays(7)->setTime(9, 20),
            'montant_prestations' => 4000,
            'montant_produits' => 15000,
            'montant_total_ht' => 19000,
            'montant_reduction' => 1900,
            'type_reduction' => 'fidelite',
            'montant_total_ttc' => 17100,
            'mode_paiement' => 'carte',
            'montant_paye' => 17100,
            'montant_rendu' => 0,
            'statut_paiement' => 'paye',
            'solde_restant' => 0,
            'recu_imprime' => true,
            'points_gagnes' => 171,
            'points_utilises' => 190,
            'notes' => 'Client VIP - 10% réduction fidélité',
            'sync_status' => 'synced',
            'created_at' => Carbon::now()->subDays(7),
            'updated_at' => Carbon::now()->subDays(7),
        ]);

        DB::table('ventes_details')->insert([
            [
                'vente_id' => $vente3Id,
                'type_article' => 'prestation',
                'article_nom' => 'Coupe + Barbe',
                'produit_id' => null,
                'quantite' => 1,
                'prix_unitaire' => 4000,
                'prix_total' => 4000,
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subDays(7),
            ],
            [
                'vente_id' => $vente3Id,
                'type_article' => 'produit',
                'article_nom' => 'Huile à Barbe Boisée',
                'produit_id' => 8,
                'quantite' => 1,
                'prix_unitaire' => 7000,
                'prix_total' => 7000,
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subDays(7),
            ],
            [
                'vente_id' => $vente3Id,
                'type_article' => 'produit',
                'article_nom' => 'Huile d\'Argan Pure Bio',
                'produit_id' => 3,
                'quantite' => 1,
                'prix_unitaire' => 12000,
                'prix_total' => 12000,
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subDays(7),
            ],
        ]);

        // Vente 4 - Achat de produits sans rendez-vous
        $vente4Id = DB::table('ventes')->insertGetId([
            'numero_facture' => 'FAC-' . now()->subDays(3)->format('Ymd') . '-067',
            'client_id' => 5,
            'coiffeur_id' => null,
            'rendez_vous_id' => null,
            'date_vente' => Carbon::now()->subDays(3)->setTime(16, 30),
            'montant_prestations' => 0,
            'montant_produits' => 25000,
            'montant_total_ht' => 25000,
            'montant_reduction' => 0,
            'type_reduction' => 'aucune',
            'montant_total_ttc' => 25000,
            'mode_paiement' => 'moov_money',
            'montant_paye' => 25000,
            'montant_rendu' => 0,
            'statut_paiement' => 'paye',
            'solde_restant' => 0,
            'recu_imprime' => true,
            'points_gagnes' => 250,
            'points_utilises' => 0,
            'notes' => 'Achat produits uniquement',
            'sync_status' => 'synced',
            'created_at' => Carbon::now()->subDays(3),
            'updated_at' => Carbon::now()->subDays(3),
        ]);

        DB::table('ventes_details')->insert([
            [
                'vente_id' => $vente4Id,
                'type_article' => 'produit',
                'article_nom' => 'Shampooing Anti-Pelliculaire Head & Shoulders',
                'produit_id' => 2,
                'quantite' => 2,
                'prix_unitaire' => 5000,
                'prix_total' => 10000,
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3),
            ],
            [
                'vente_id' => $vente4Id,
                'type_article' => 'produit',
                'article_nom' => 'Masque Réparateur Intense',
                'produit_id' => 4,
                'quantite' => 1,
                'prix_unitaire' => 13500,
                'prix_total' => 13500,
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3),
            ],
        ]);

        // Vente 5 - Coupe femme en cours (vente ouverte aujourd'hui)
        $vente5Id = DB::table('ventes')->insertGetId([
            'numero_facture' => 'FAC-' . now()->format('Ymd') . '-089',
            'client_id' => 6,
            'coiffeur_id' => 4,
            'rendez_vous_id' => 10,
            'date_vente' => Carbon::now()->subMinutes(30),
            'montant_prestations' => 5000,
            'montant_produits' => 0,
            'montant_total_ht' => 5000,
            'montant_reduction' => 0,
            'type_reduction' => 'aucune',
            'montant_total_ttc' => 5000,
            'mode_paiement' => 'especes',
            'montant_paye' => 0,
            'montant_rendu' => 0,
            'statut_paiement' => 'impaye',
            'solde_restant' => 5000,
            'recu_imprime' => false,
            'points_gagnes' => 0,
            'points_utilises' => 0,
            'notes' => 'Prestation en cours',
            'sync_status' => 'synced',
            'created_at' => Carbon::now()->subMinutes(30),
            'updated_at' => Carbon::now()->subMinutes(30),
        ]);

        DB::table('ventes_details')->insert([
            [
                'vente_id' => $vente5Id,
                'type_article' => 'prestation',
                'article_nom' => 'Coupe Femme Mi-longue',
                'produit_id' => null,
                'quantite' => 1,
                'prix_unitaire' => 5000,
                'prix_total' => 5000,
                'created_at' => Carbon::now()->subMinutes(30),
                'updated_at' => Carbon::now()->subMinutes(30),
            ],
        ]);

        // Vente 6 - Rasage traditionnel
        $vente6Id = DB::table('ventes')->insertGetId([
            'numero_facture' => 'FAC-' . now()->subDays(1)->format('Ymd') . '-078',
            'client_id' => 7,
            'coiffeur_id' => 5,
            'rendez_vous_id' => null,
            'date_vente' => Carbon::now()->subDays(1)->setTime(10, 15),
            'montant_prestations' => 3500,
            'montant_produits' => 5500,
            'montant_total_ht' => 9000,
            'montant_reduction' => 0,
            'type_reduction' => 'aucune',
            'montant_total_ttc' => 9000,
            'mode_paiement' => 'especes',
            'montant_paye' => 10000,
            'montant_rendu' => 1000,
            'statut_paiement' => 'paye',
            'solde_restant' => 0,
            'recu_imprime' => true,
            'points_gagnes' => 90,
            'points_utilises' => 0,
            'notes' => null,
            'sync_status' => 'synced',
            'created_at' => Carbon::now()->subDays(1),
            'updated_at' => Carbon::now()->subDays(1),
        ]);

        DB::table('ventes_details')->insert([
            [
                'vente_id' => $vente6Id,
                'type_article' => 'prestation',
                'article_nom' => 'Rasage Traditionnel',
                'produit_id' => null,
                'quantite' => 1,
                'prix_unitaire' => 3500,
                'prix_total' => 3500,
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            [
                'vente_id' => $vente6Id,
                'type_article' => 'produit',
                'article_nom' => 'Mousse à Raser Premium',
                'produit_id' => 9,
                'quantite' => 1,
                'prix_unitaire' => 5500,
                'prix_total' => 5500,
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
        ]);

        // Vente 7 - Paiement partiel
        $vente7Id = DB::table('ventes')->insertGetId([
            'numero_facture' => 'FAC-' . now()->subDays(10)->format('Ymd') . '-034',
            'client_id' => 11,
            'coiffeur_id' => 4,
            'rendez_vous_id' => null,
            'date_vente' => Carbon::now()->subDays(10)->setTime(14, 0),
            'montant_prestations' => 15000,
            'montant_produits' => 5000,
            'montant_total_ht' => 20000,
            'montant_reduction' => 0,
            'type_reduction' => 'aucune',
            'montant_total_ttc' => 20000,
            'mode_paiement' => 'mixte',
            'montant_paye' => 15000,
            'montant_rendu' => 0,
            'statut_paiement' => 'partiel',
            'solde_restant' => 5000,
            'recu_imprime' => true,
            'points_gagnes' => 150,
            'points_utilises' => 0,
            'notes' => 'Acompte versé, solde à régler',
            'sync_status' => 'synced',
            'created_at' => Carbon::now()->subDays(10),
            'updated_at' => Carbon::now()->subDays(10),
        ]);

        DB::table('ventes_details')->insert([
            [
                'vente_id' => $vente7Id,
                'type_article' => 'prestation',
                'article_nom' => 'Tresses avec Mèches',
                'produit_id' => null,
                'quantite' => 1,
                'prix_unitaire' => 15000,
                'prix_total' => 15000,
                'created_at' => Carbon::now()->subDays(10),
                'updated_at' => Carbon::now()->subDays(10),
            ],
            [
                'vente_id' => $vente7Id,
                'type_article' => 'produit',
                'article_nom' => 'Mèches Synthétiques Colorées',
                'produit_id' => 13,
                'quantite' => 1,
                'prix_unitaire' => 5000,
                'prix_total' => 5000,
                'created_at' => Carbon::now()->subDays(10),
                'updated_at' => Carbon::now()->subDays(10),
            ],
        ]);
    }
}