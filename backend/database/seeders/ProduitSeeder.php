<?php

namespace Database\Seeders;

use App\Models\Produit;
use App\Models\Categorie;
use App\Models\Attribut;
use App\Models\ProduitAttributValeur;
use Illuminate\Database\Seeder;

class ProduitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $meches = Categorie::where('slug', 'meches-et-extensions')->first();
        $locks = Categorie::where('slug', 'locks-et-dreadlocks')->first();
        $capillaires = Categorie::where('slug', 'produits-capillaires')->first();
        $accessoires = Categorie::where('slug', 'accessoires')->first();

        // MÈCHES (4 produits)
        if ($meches) {
            $this->creerMeche($meches->id, 'Mèches Brésiliennes Premium 18"', 15000, 25000, 50, 30, '18"', 'Premium', 150, 'Noir naturel');
            $this->creerMeche($meches->id, 'Mèches Péruviennes 24"', 18000, 30000, 30, 20, '24"', 'Standard', 180, 'Brun');
            $this->creerMeche($meches->id, 'Extensions Courtes 14"', 8000, 15000, 80, 50, '14"', 'Économique', 100, 'Noir naturel');
            $this->creerMeche($meches->id, 'Mèches Colorées 20"', 12000, 22000, 25, 15, '20"', 'Standard', 140, 'Multicolore');
        }

        // LOCKS (4 produits)
        if ($locks) {
            $this->creerLock($locks->id, 'Locks Naturelles 30cm', 500, 1200, 100, 80, '30cm', 200, 'Noir naturel');
            $this->creerLock($locks->id, 'Dreadlocks Synthétiques 40cm', 600, 1500, 60, 40, '40cm', 150, 'Brun');
            $this->creerLock($locks->id, 'Mini Locks 15cm', 300, 800, 150, 100, '15cm', 100, 'Noir naturel');
            $this->creerLock($locks->id, 'Locks Fines Premium', 700, 1800, 40, 30, '35cm', 180, 'Châtain');
        }

        // PRODUITS CAPILLAIRES (4 produits)
        if ($capillaires) {
            $this->creerProduitCapillaire($capillaires->id, 'Shampoing Locks & Dreads', 2500, 5000, 40, 20);
            $this->creerProduitCapillaire($capillaires->id, 'Gel Coiffant Extra Fort', 1800, 3500, 60, 30);
            $this->creerProduitCapillaire($capillaires->id, 'Crème Hydratante Cheveux', 3000, 6000, 35, 15);
            $this->creerProduitCapillaire($capillaires->id, 'Huile de Coco Naturelle', 2200, 4500, 50, 25);
        }

        // ACCESSOIRES (4 produits)
        if ($accessoires) {
            $this->creerAccessoire($accessoires->id, 'Élastiques Professionnels (x100)', 1000, 2000, 200, 150);
            $this->creerAccessoire($accessoires->id, 'Pinces à Cheveux (x50)', 1500, 3000, 100, 50);
            $this->creerAccessoire($accessoires->id, 'Bonnet Satin Premium', 800, 1500, 80, 40);
            $this->creerAccessoire($accessoires->id, 'Filet à Locks (x10)', 500, 1200, 120, 60);
        }
    }

    /**
     * Crée une mèche avec attributs
     */
    private function creerMeche(int $categorieId, string $nom, int $prixAchat, int $prixVente, int $stockVente, int $stockUtilisation, string $longueur, string $qualite, int $poids, string $couleur): void
    {
        $produit = Produit::create([
            'nom' => $nom,
            'reference' => 'MEC-' . strtoupper(substr(md5($nom), 0, 6)),
            'description' => "Mèches de qualité {$qualite}, longueur {$longueur}",
            'categorie_id' => $categorieId,
            'marque' => 'Premium Hair',
            'fournisseur' => 'Import Brésil',
            'prix_achat' => $prixAchat,
            'prix_vente' => $prixVente,
            'stock_vente' => $stockVente,
            'stock_utilisation' => $stockUtilisation,
            'seuil_alerte' => 20,
            'seuil_critique' => 10,
            'seuil_alerte_utilisation' => 15,
            'seuil_critique_utilisation' => 5,
            'type_stock_principal' => 'mixte',
            'is_active' => true,
        ]);

        // Ajouter attributs
        $this->ajouterAttribut($produit->id, 'longueur', $longueur);
        $this->ajouterAttribut($produit->id, 'qualite', $qualite);
        $this->ajouterAttribut($produit->id, 'poids', $poids);
        $this->ajouterAttribut($produit->id, 'couleur', $couleur);
    }

    /**
     * Crée un lock avec attributs
     */
    private function creerLock(int $categorieId, string $nom, int $prixAchat, int $prixVente, int $stockVente, int $stockUtilisation, string $longueur, int $poids, string $couleur): void
    {
        $produit = Produit::create([
            'nom' => $nom,
            'reference' => 'LOCK-' . strtoupper(substr(md5($nom), 0, 6)),
            'description' => "Locks professionnelles, longueur {$longueur}",
            'categorie_id' => $categorieId,
            'marque' => 'DreadLock Pro',
            'fournisseur' => 'Atelier Local',
            'prix_achat' => $prixAchat,
            'prix_vente' => $prixVente,
            'stock_vente' => $stockVente,
            'stock_utilisation' => $stockUtilisation,
            'seuil_alerte' => 30,
            'seuil_critique' => 15,
            'seuil_alerte_utilisation' => 20,
            'seuil_critique_utilisation' => 10,
            'type_stock_principal' => 'mixte',
            'is_active' => true,
        ]);

        // Ajouter attributs
        $this->ajouterAttribut($produit->id, 'longueur', $longueur);
        $this->ajouterAttribut($produit->id, 'poids', $poids);
        $this->ajouterAttribut($produit->id, 'couleur', $couleur);
    }

    /**
     * Crée un produit capillaire
     */
    private function creerProduitCapillaire(int $categorieId, string $nom, int $prixAchat, int $prixVente, int $stockVente, int $stockUtilisation): void
    {
        Produit::create([
            'nom' => $nom,
            'reference' => 'CAP-' . strtoupper(substr(md5($nom), 0, 6)),
            'description' => 'Produit capillaire professionnel',
            'categorie_id' => $categorieId,
            'marque' => 'AfroBeauty',
            'fournisseur' => 'Cosmétiques Afrique',
            'prix_achat' => $prixAchat,
            'prix_vente' => $prixVente,
            'stock_vente' => $stockVente,
            'stock_utilisation' => $stockUtilisation,
            'seuil_alerte' => 15,
            'seuil_critique' => 5,
            'seuil_alerte_utilisation' => 10,
            'seuil_critique_utilisation' => 3,
            'type_stock_principal' => 'mixte',
            'is_active' => true,
        ]);
    }

    /**
     * Crée un accessoire
     */
    private function creerAccessoire(int $categorieId, string $nom, int $prixAchat, int $prixVente, int $stockVente, int $stockUtilisation): void
    {
        Produit::create([
            'nom' => $nom,
            'reference' => 'ACC-' . strtoupper(substr(md5($nom), 0, 6)),
            'description' => 'Accessoire de coiffure professionnel',
            'categorie_id' => $categorieId,
            'marque' => 'SalonPro',
            'fournisseur' => 'Import Chine',
            'prix_achat' => $prixAchat,
            'prix_vente' => $prixVente,
            'stock_vente' => $stockVente,
            'stock_utilisation' => $stockUtilisation,
            'seuil_alerte' => 40,
            'seuil_critique' => 20,
            'seuil_alerte_utilisation' => 25,
            'seuil_critique_utilisation' => 10,
            'type_stock_principal' => 'vente',
            'is_active' => true,
        ]);
    }

    /**
     * Ajoute un attribut à un produit
     */
    private function ajouterAttribut(int $produitId, string $attributSlug, $valeur): void
    {
        $attribut = Attribut::where('slug', $attributSlug)->first();
        
        if ($attribut) {
            ProduitAttributValeur::create([
                'produit_id' => $produitId,
                'attribut_id' => $attribut->id,
                'valeur' => $valeur,
            ]);
        }
    }
}