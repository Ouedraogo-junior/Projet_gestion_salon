<?php

namespace Database\Seeders;

use App\Models\Categorie;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorieSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'nom' => 'Mèches et Extensions',
                'description' => 'Mèches brésiliennes, péruviennes, extensions',
                'icone' => 'scissors',
                'couleur' => '#FF6B6B',
                'ordre' => 1,
            ],
            [
                'nom' => 'Locks et Dreadlocks',
                'description' => 'Locks naturelles, dreadlocks, accessoires locks',
                'icone' => 'lock',
                'couleur' => '#4ECDC4',
                'ordre' => 2,
            ],
            [
                'nom' => 'Produits Capillaires',
                'description' => 'Shampoings, après-shampoings, gels, crèmes',
                'icone' => 'droplet',
                'couleur' => '#95E1D3',
                'ordre' => 3,
            ],
            [
                'nom' => 'Accessoires',
                'description' => 'Élastiques, pinces, bonnets, filets',
                'icone' => 'star',
                'couleur' => '#F38181',
                'ordre' => 4,
            ],
        ];

        foreach ($categories as $categorie) {
            Categorie::create([
                'nom' => $categorie['nom'],
                'slug' => Str::slug($categorie['nom']),
                'description' => $categorie['description'],
                'icone' => $categorie['icone'],
                'couleur' => $categorie['couleur'],
                'is_active' => true,
                'ordre' => $categorie['ordre'],
            ]);
        }
    }
}