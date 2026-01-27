<?php

namespace Database\Seeders;

use App\Models\Attribut;
use App\Models\Categorie;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AttributSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $attributs = [
            [
                'nom' => 'Longueur',
                'type_valeur' => 'liste',
                'valeurs_possibles' => ['10"', '12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"', '28"', '30"'],
                'unite' => 'pouces',
                'obligatoire' => false,
                'ordre' => 1,
            ],
            [
                'nom' => 'Qualité',
                'type_valeur' => 'liste',
                'valeurs_possibles' => ['Premium', 'Standard', 'Économique'],
                'unite' => null,
                'obligatoire' => false,
                'ordre' => 2,
            ],
            [
                'nom' => 'Poids',
                'type_valeur' => 'nombre',
                'valeurs_possibles' => null,
                'unite' => 'grammes',
                'obligatoire' => false,
                'ordre' => 3,
            ],
            [
                'nom' => 'Couleur',
                'type_valeur' => 'liste',
                'valeurs_possibles' => ['Noir naturel', 'Brun', 'Châtain', 'Blond', 'Rouge', 'Gris', 'Multicolore'],
                'unite' => null,
                'obligatoire' => false,
                'ordre' => 4,
            ],
        ];

        foreach ($attributs as $attribut) {
            Attribut::create([
                'nom' => $attribut['nom'],
                'slug' => Str::slug($attribut['nom']),
                'type_valeur' => $attribut['type_valeur'],
                'valeurs_possibles' => $attribut['valeurs_possibles'],
                'unite' => $attribut['unite'],
                'obligatoire' => $attribut['obligatoire'],
                'ordre' => $attribut['ordre'],
            ]);
        }

        // Associer les attributs aux catégories
        $this->associerAttributsCategories();
    }

    /**
     * Associe les attributs aux catégories appropriées
     */
    private function associerAttributsCategories(): void
    {
        $meches = Categorie::where('slug', 'meches-et-extensions')->first();
        $locks = Categorie::where('slug', 'locks-et-dreadlocks')->first();

        if ($meches) {
            // Mèches : Longueur, Qualité, Poids, Couleur
            $longueur = Attribut::where('slug', 'longueur')->first();
            $qualite = Attribut::where('slug', 'qualite')->first();
            $poids = Attribut::where('slug', 'poids')->first();
            $couleur = Attribut::where('slug', 'couleur')->first();

            if ($longueur) $meches->associerAttribut($longueur->id, true, 1);
            if ($qualite) $meches->associerAttribut($qualite->id, false, 2);
            if ($poids) $meches->associerAttribut($poids->id, false, 3);
            if ($couleur) $meches->associerAttribut($couleur->id, false, 4);
        }

        if ($locks) {
            // Locks : Longueur, Poids, Couleur
            $longueur = Attribut::where('slug', 'longueur')->first();
            $poids = Attribut::where('slug', 'poids')->first();
            $couleur = Attribut::where('slug', 'couleur')->first();

            if ($longueur) $locks->associerAttribut($longueur->id, false, 1);
            if ($poids) $locks->associerAttribut($poids->id, false, 2);
            if ($couleur) $locks->associerAttribut($couleur->id, false, 3);
        }
    }
}