<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RendezVousSeeder extends Seeder
{
    public function run(): void
    {
        $rendezVous = [
            // Rendez-vous passés (terminés)
            [
                'client_id' => 1,
                'coiffeur_id' => 3, // Ibrahim
                'type_prestation_id' => 2, // Coupe Homme + Dégradé
                'date_heure' => Carbon::now()->subDays(5)->setTime(10, 0),
                'duree_minutes' => 45,
                'prix_estime' => 3000,
                'statut' => 'termine',
                'notes' => 'Client satisfait du service',
                'acompte_demande' => false,
                'acompte_montant' => null,
                'acompte_paye' => false,
                'sms_confirmation_envoye' => true,
                'sms_rappel_24h_envoye' => true,
                'sms_rappel_2h_envoye' => true,
                'motif_annulation' => null,
                'date_annulation' => null,
                'sync_status' => 'synced',
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subDays(5),
            ],
            [
                'client_id' => 2,
                'coiffeur_id' => 4, // Fatima
                'type_prestation_id' => 8, // Tresses Africaines Simples
                'date_heure' => Carbon::now()->subDays(15)->setTime(9, 0),
                'duree_minutes' => 120,
                'prix_estime' => 8000,
                'statut' => 'termine',
                'notes' => null,
                'acompte_demande' => false,
                'acompte_montant' => null,
                'acompte_paye' => false,
                'sms_confirmation_envoye' => true,
                'sms_rappel_24h_envoye' => true,
                'sms_rappel_2h_envoye' => true,
                'motif_annulation' => null,
                'date_annulation' => null,
                'sync_status' => 'synced',
                'created_at' => Carbon::now()->subDays(18),
                'updated_at' => Carbon::now()->subDays(15),
            ],
            [
                'client_id' => 3,
                'coiffeur_id' => 3, // Ibrahim (client préfère Ibrahim)
                'type_prestation_id' => 4, // Coupe + Barbe
                'date_heure' => Carbon::now()->subDays(7)->setTime(8, 30),
                'duree_minutes' => 50,
                'prix_estime' => 4000,
                'statut' => 'termine',
                'notes' => 'Client régulier VIP',
                'acompte_demande' => false,
                'acompte_montant' => null,
                'acompte_paye' => false,
                'sms_confirmation_envoye' => true,
                'sms_rappel_24h_envoye' => true,
                'sms_rappel_2h_envoye' => false,
                'motif_annulation' => null,
                'date_annulation' => null,
                'sync_status' => 'synced',
                'created_at' => Carbon::now()->subDays(10),
                'updated_at' => Carbon::now()->subDays(7),
            ],
            
            // Rendez-vous annulés
            [
                'client_id' => 10,
                'coiffeur_id' => 5, // Abdoul
                'type_prestation_id' => 1, // Coupe Homme Simple
                'date_heure' => Carbon::now()->subDays(25)->setTime(14, 0),
                'duree_minutes' => 30,
                'prix_estime' => 2000,
                'statut' => 'annule',
                'notes' => null,
                'acompte_demande' => false,
                'acompte_montant' => null,
                'acompte_paye' => false,
                'sms_confirmation_envoye' => true,
                'sms_rappel_24h_envoye' => false,
                'sms_rappel_2h_envoye' => false,
                'motif_annulation' => 'Empêchement de dernière minute',
                'date_annulation' => Carbon::now()->subDays(25)->setTime(13, 30),
                'sync_status' => 'synced',
                'created_at' => Carbon::now()->subDays(28),
                'updated_at' => Carbon::now()->subDays(25),
            ],
            
            // Rendez-vous confirmés (à venir)
            [
                'client_id' => 4,
                'coiffeur_id' => 6, // Aminata (spécialiste extensions)
                'type_prestation_id' => 12, // Pose d'Extensions
                'date_heure' => Carbon::now()->addDays(2)->setTime(10, 0),
                'duree_minutes' => 240,
                'prix_estime' => 35000,
                'statut' => 'confirme',
                'notes' => 'Extensions brésiliennes 50cm demandées',
                'acompte_demande' => true,
                'acompte_montant' => 10000,
                'acompte_paye' => true,
                'sms_confirmation_envoye' => true,
                'sms_rappel_24h_envoye' => false,
                'sms_rappel_2h_envoye' => false,
                'motif_annulation' => null,
                'date_annulation' => null,
                'sync_status' => 'synced',
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(4),
            ],
            [
                'client_id' => 7,
                'coiffeur_id' => 5, // Abdoul (spécialiste barbe)
                'type_prestation_id' => 5, // Rasage Traditionnel
                'date_heure' => Carbon::now()->addHours(3),
                'duree_minutes' => 40,
                'prix_estime' => 3500,
                'statut' => 'confirme',
                'notes' => 'Client fidèle, vient régulièrement',
                'acompte_demande' => false,
                'acompte_montant' => null,
                'acompte_paye' => false,
                'sms_confirmation_envoye' => true,
                'sms_rappel_24h_envoye' => true,
                'sms_rappel_2h_envoye' => true,
                'motif_annulation' => null,
                'date_annulation' => null,
                'sync_status' => 'synced',
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now(),
            ],
            [
                'client_id' => 5,
                'coiffeur_id' => 3, // Ibrahim
                'type_prestation_id' => 2, // Coupe Homme + Dégradé
                'date_heure' => Carbon::now()->addDays(1)->setTime(15, 30),
                'duree_minutes' => 45,
                'prix_estime' => 3000,
                'statut' => 'confirme',
                'notes' => null,
                'acompte_demande' => false,
                'acompte_montant' => null,
                'acompte_paye' => false,
                'sms_confirmation_envoye' => true,
                'sms_rappel_24h_envoye' => false,
                'sms_rappel_2h_envoye' => false,
                'motif_annulation' => null,
                'date_annulation' => null,
                'sync_status' => 'synced',
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3),
            ],
            
            // Rendez-vous en attente
            [
                'client_id' => 11,
                'coiffeur_id' => 4, // Fatima
                'type_prestation_id' => 13, // Tissage Complet
                'date_heure' => Carbon::now()->addDays(5)->setTime(9, 0),
                'duree_minutes' => 180,
                'prix_estime' => 25000,
                'statut' => 'en_attente',
                'notes' => 'Premier tissage, cliente un peu anxieuse',
                'acompte_demande' => true,
                'acompte_montant' => 8000,
                'acompte_paye' => false,
                'sms_confirmation_envoye' => true,
                'sms_rappel_24h_envoye' => false,
                'sms_rappel_2h_envoye' => false,
                'motif_annulation' => null,
                'date_annulation' => null,
                'sync_status' => 'synced',
                'created_at' => Carbon::now()->subHours(5),
                'updated_at' => Carbon::now()->subHours(5),
            ],
            [
                'client_id' => 9,
                'coiffeur_id' => null, // Pas encore assigné
                'type_prestation_id' => 11, // Coloration Cheveux
                'date_heure' => Carbon::now()->addDays(7)->setTime(14, 0),
                'duree_minutes' => 120,
                'prix_estime' => 18000,
                'statut' => 'en_attente',
                'notes' => 'Veut une couleur châtain',
                'acompte_demande' => false,
                'acompte_montant' => null,
                'acompte_paye' => false,
                'sms_confirmation_envoye' => false,
                'sms_rappel_24h_envoye' => false,
                'sms_rappel_2h_envoye' => false,
                'motif_annulation' => null,
                'date_annulation' => null,
                'sync_status' => 'synced',
                'created_at' => Carbon::now()->subHours(2),
                'updated_at' => Carbon::now()->subHours(2),
            ],
            
            // Rendez-vous aujourd'hui (en cours)
            [
                'client_id' => 6,
                'coiffeur_id' => 4, // Fatima
                'type_prestation_id' => 7, // Coupe Femme Mi-longue
                'date_heure' => Carbon::now()->subMinutes(30),
                'duree_minutes' => 60,
                'prix_estime' => 5000,
                'statut' => 'en_cours',
                'notes' => null,
                'acompte_demande' => false,
                'acompte_montant' => null,
                'acompte_paye' => false,
                'sms_confirmation_envoye' => true,
                'sms_rappel_24h_envoye' => true,
                'sms_rappel_2h_envoye' => true,
                'motif_annulation' => null,
                'date_annulation' => null,
                'sync_status' => 'synced',
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subMinutes(30),
            ],
            
            // No show
            [
                'client_id' => 12,
                'coiffeur_id' => 3, // Ibrahim
                'type_prestation_id' => 1, // Coupe Homme Simple
                'date_heure' => Carbon::now()->subDays(30)->setTime(11, 0),
                'duree_minutes' => 30,
                'prix_estime' => 2000,
                'statut' => 'no_show',
                'notes' => 'Client ne s\'est pas présenté',
                'acompte_demande' => false,
                'acompte_montant' => null,
                'acompte_paye' => false,
                'sms_confirmation_envoye' => true,
                'sms_rappel_24h_envoye' => true,
                'sms_rappel_2h_envoye' => true,
                'motif_annulation' => null,
                'date_annulation' => null,
                'sync_status' => 'synced',
                'created_at' => Carbon::now()->subDays(32),
                'updated_at' => Carbon::now()->subDays(30),
            ],
        ];

        DB::table('rendez_vous')->insert($rendezVous);
    }
}