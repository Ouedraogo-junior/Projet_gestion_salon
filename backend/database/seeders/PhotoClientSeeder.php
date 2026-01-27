<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PhotoClientSeeder extends Seeder
{
    public function run(): void
    {
        $photos = [
            // Photos de la vente 1 (Client 1 - Jean-Baptiste)
            [
                'client_id' => 1,
                'vente_id' => 1,
                'rendez_vous_id' => 1,
                'photo_url' => 'storage/photos/clients/2025/01/client_1_avant_20250118.jpg',
                'type_photo' => 'avant',
                'description' => 'Coupe homme dégradé - avant',
                'date_prise' => Carbon::now()->subDays(5),
                'is_public' => false,
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(5),
            ],
            [
                'client_id' => 1,
                'vente_id' => 1,
                'rendez_vous_id' => 1,
                'photo_url' => 'storage/photos/clients/2025/01/client_1_apres_20250118.jpg',
                'type_photo' => 'apres',
                'description' => 'Coupe homme dégradé - résultat final',
                'date_prise' => Carbon::now()->subDays(5),
                'is_public' => true,
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(5),
            ],
            
            // Photos de la vente 2 (Client 2 - Marie)
            [
                'client_id' => 2,
                'vente_id' => 2,
                'rendez_vous_id' => 2,
                'photo_url' => 'storage/photos/clients/2025/01/client_2_avant_20250108.jpg',
                'type_photo' => 'avant',
                'description' => 'Tresses africaines - avant',
                'date_prise' => Carbon::now()->subDays(15),
                'is_public' => false,
                'created_at' => Carbon::now()->subDays(15),
                'updated_at' => Carbon::now()->subDays(15),
            ],
            [
                'client_id' => 2,
                'vente_id' => 2,
                'rendez_vous_id' => 2,
                'photo_url' => 'storage/photos/clients/2025/01/client_2_apres_20250108.jpg',
                'type_photo' => 'apres',
                'description' => 'Tresses africaines simples - réalisé par Fatima',
                'date_prise' => Carbon::now()->subDays(15),
                'is_public' => true,
                'created_at' => Carbon::now()->subDays(15),
                'updated_at' => Carbon::now()->subDays(15),
            ],
            
            // Photos de la vente 3 (Client 3 - Paul)
            [
                'client_id' => 3,
                'vente_id' => 3,
                'rendez_vous_id' => 3,
                'photo_url' => 'storage/photos/clients/2025/01/client_3_avant_20250116.jpg',
                'type_photo' => 'avant',
                'description' => 'Service complet coupe et barbe - avant',
                'date_prise' => Carbon::now()->subDays(7),
                'is_public' => false,
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subDays(7),
            ],
            [
                'client_id' => 3,
                'vente_id' => 3,
                'rendez_vous_id' => 3,
                'photo_url' => 'storage/photos/clients/2025/01/client_3_apres_20250116.jpg',
                'type_photo' => 'apres',
                'description' => 'Coupe et taille de barbe professionnelle par Ibrahim',
                'date_prise' => Carbon::now()->subDays(7),
                'is_public' => true,
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subDays(7),
            ],
            
            // Photos client 6 (vente en cours)
            [
                'client_id' => 6,
                'vente_id' => 5,
                'rendez_vous_id' => 10,
                'photo_url' => 'storage/photos/clients/2025/01/client_6_avant_20250123.jpg',
                'type_photo' => 'avant',
                'description' => 'Coupe femme mi-longue - photo avant',
                'date_prise' => Carbon::now()->subMinutes(30),
                'is_public' => false,
                'created_at' => Carbon::now()->subMinutes(30),
                'updated_at' => Carbon::now()->subMinutes(30),
            ],
            
            // Photos client 7 (rasage traditionnel)
            [
                'client_id' => 7,
                'vente_id' => 6,
                'rendez_vous_id' => null,
                'photo_url' => 'storage/photos/clients/2025/01/client_7_avant_20250122.jpg',
                'type_photo' => 'avant',
                'description' => 'Rasage traditionnel - avant',
                'date_prise' => Carbon::now()->subDays(1),
                'is_public' => false,
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            [
                'client_id' => 7,
                'vente_id' => 6,
                'rendez_vous_id' => null,
                'photo_url' => 'storage/photos/clients/2025/01/client_7_apres_20250122.jpg',
                'type_photo' => 'apres',
                'description' => 'Rasage traditionnel au rasoir - résultat impeccable',
                'date_prise' => Carbon::now()->subDays(1),
                'is_public' => true,
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            
            // Photos pour portfolio (client 11 - tresses avec mèches)
            [
                'client_id' => 11,
                'vente_id' => 7,
                'rendez_vous_id' => null,
                'photo_url' => 'storage/photos/clients/2025/01/client_11_avant_20250113.jpg',
                'type_photo' => 'avant',
                'description' => 'Tresses avec mèches colorées - état initial',
                'date_prise' => Carbon::now()->subDays(10),
                'is_public' => false,
                'created_at' => Carbon::now()->subDays(10),
                'updated_at' => Carbon::now()->subDays(10),
            ],
            [
                'client_id' => 11,
                'vente_id' => 7,
                'rendez_vous_id' => null,
                'photo_url' => 'storage/photos/clients/2025/01/client_11_apres_20250113.jpg',
                'type_photo' => 'apres',
                'description' => 'Tresses avec mèches synthétiques colorées - style moderne',
                'date_prise' => Carbon::now()->subDays(10),
                'is_public' => true,
                'created_at' => Carbon::now()->subDays(10),
                'updated_at' => Carbon::now()->subDays(10),
            ],
            
            // Photos anciennes pour portfolio (sans vente associée)
            [
                'client_id' => 5,
                'vente_id' => null,
                'rendez_vous_id' => null,
                'photo_url' => 'storage/photos/clients/2024/12/portfolio_coupe_homme_1.jpg',
                'type_photo' => 'apres',
                'description' => 'Exemple de coupe dégradé moderne pour portfolio',
                'date_prise' => Carbon::now()->subMonths(1),
                'is_public' => true,
                'created_at' => Carbon::now()->subMonths(1),
                'updated_at' => Carbon::now()->subMonths(1),
            ],
            [
                'client_id' => 9,
                'vente_id' => null,
                'rendez_vous_id' => null,
                'photo_url' => 'storage/photos/clients/2024/12/portfolio_tresses_1.jpg',
                'type_photo' => 'apres',
                'description' => 'Style de tresses pour portfolio public',
                'date_prise' => Carbon::now()->subMonths(2),
                'is_public' => true,
                'created_at' => Carbon::now()->subMonths(2),
                'updated_at' => Carbon::now()->subMonths(2),
            ],
        ];

        DB::table('photos_clients')->insert($photos);
    }
}