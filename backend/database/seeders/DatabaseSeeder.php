<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CategorieSeeder::class,
            ProduitSeeder::class,
            AttributSeeder::class,
            ClientSeeder::class,
            TypePrestationSeeder::class,
            RendezVousSeeder::class,
            VenteSeeder::class,
            MouvementStockSeeder::class,
            PhotoClientSeeder::class,
        ]);
    }
}