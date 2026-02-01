<?php
// app/Http/Controllers/Api/PublicController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Salon;
use App\Models\Produit;
use App\Models\TypePrestation;
use Illuminate\Http\Request;
use App\Models\PhotoClient;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PublicController extends Controller
{
    // Méthode pour obtenir le salon par défaut (le premier actif)
    public function getSalonDefaut()
    {
        $salon = Salon::where('is_active', true)
            ->orderBy('id')
            ->first();

        if (!$salon) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun salon actif trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $salon->id,
                'nom' => $salon->nom,
                'slug' => $salon->slug,
                'telephone' => $salon->telephone,
                'adresse' => $salon->adresse,
                'description' => $salon->description ?? null,
                'horaires' => $salon->horaires ?? null,
                'photo_url' => $salon->photo_url ?? null,
            ]
        ]);
    }

    public function prestations($slug = null)
    {
        $salon = $slug 
            ? Salon::where('slug', $slug)->firstOrFail()
            : Salon::where('is_active', true)->orderBy('id')->firstOrFail();
        
        $prestations = TypePrestation::where('salon_id', $salon->id)
            ->where('actif', true)
            ->select('id', 'nom', 'description', 'duree_estimee_minutes', 'prix_base', 'ordre')
            ->orderBy('ordre')
            ->orderBy('nom')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $prestations
        ]);
    }

    public function produits($slug = null)
    {
        $salon = $slug 
            ? Salon::where('slug', $slug)->firstOrFail()
            : Salon::where('is_active', true)->orderBy('id')->firstOrFail();
        
        $produits = Produit::where('salon_id', $salon->id)
            ->where('is_active', true)
            ->where('visible_public', true)
            ->whereIn('type_stock_principal', ['vente', 'mixte'])
            ->where('stock_vente', '>', 0)
            ->select(
                'id', 
                'nom', 
                'description', 
                'marque',
                'prix_vente', 
                'prix_promo',
                'date_debut_promo',
                'date_fin_promo',
                'photo_url',
                'stock_vente'
            )
            ->get()
            ->map(function ($produit) {
                // Traiter l'URL de la photo
                if ($produit->photo_url) {
                    $cleanPath = preg_replace('/^storage\//', '', $produit->photo_url);
                    $produit->photo_url = url('storage/' . $cleanPath);
                }
                
                $produit->prix_actuel = $this->getPrixActuel($produit);
                $produit->en_promo = $this->estEnPromo($produit);
                return $produit;
            });

        return response()->json([
            'success' => true,
            'data' => $produits
        ]);
    }

    /**
     * ✅ NOUVELLE MÉTHODE - Détails d'un produit public avec attributs
     */
     public function produitDetails($id)
{
    try {
        // ✅ Charger le produit avec toutes ses relations en une seule fois
        $produit = Produit::with([
            'categorie:id,nom,couleur',
            'valeursAttributs.attribut:id,nom,type_valeur,unite'
        ])
        ->where('id', $id)
        ->where('is_active', true)
        ->where('visible_public', true)
        ->first();

        if (!$produit) {
            return response()->json([
                'success' => false,
                'message' => 'Produit non trouvé'
            ], 404);
        }

        // Traiter l'URL de la photo
        if ($produit->photo_url) {
            $cleanPath = preg_replace('/^storage\//', '', $produit->photo_url);
            $produit->photo_url = url('storage/' . $cleanPath);
        }

        // ✅ Préparer les données avec les valeurs d'attributs
        $data = [
            'id' => $produit->id,
            'nom' => $produit->nom,
            'description' => $produit->description,
            'marque' => $produit->marque,
            'prix_vente' => (float) $produit->prix_vente,
            'prix_promo' => $produit->prix_promo ? (float) $produit->prix_promo : null,
            'date_debut_promo' => $produit->date_debut_promo,
            'date_fin_promo' => $produit->date_fin_promo,
            'photo_url' => $produit->photo_url,
            'stock_vente' => (int) $produit->stock_vente,
            'prix_actuel' => (float) $this->getPrixActuel($produit),
            'en_promo' => $this->estEnPromo($produit),
            'categorie' => $produit->categorie ? [
                'id' => $produit->categorie->id,
                'nom' => $produit->categorie->nom,
                'couleur' => $produit->categorie->couleur,
            ] : null,
            'valeurs_attributs' => $produit->valeursAttributs->map(function($va) {
                return [
                    'id' => $va->id,
                    'attribut_id' => $va->attribut_id,
                    'valeur' => $va->valeur,
                    'attribut' => [
                        'id' => $va->attribut->id,
                        'nom' => $va->attribut->nom,
                        'type_valeur' => $va->attribut->type_valeur,
                        'unite' => $va->attribut->unite ?? null,
                    ]
                ];
            })->toArray()
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);

    } catch (\Exception $e) {
        \Log::error('❌ Erreur détails produit public: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors du chargement du produit',
            'error' => config('app.debug') ? $e->getMessage() : 'Erreur serveur'
        ], 500);
    }
}

    public function salonInfo($slug = null)
    {
        $salon = $slug 
            ? Salon::where('slug', $slug)->firstOrFail()
            : Salon::where('is_active', true)->orderBy('id')->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $salon->id,
                'nom' => $salon->nom,
                'telephone' => $salon->telephone,
                'adresse' => $salon->adresse,
                'description' => $salon->description ?? null,
                'horaires' => $salon->horaires ?? null,
                'photo_url' => $salon->photo_url ?? null,
                'logo_url' => $salon->logo_url ?? null,
            ]
        ]);
    }

    private function getPrixActuel($produit)
    {
        if ($this->estEnPromo($produit)) {
            return $produit->prix_promo;
        }
        return $produit->prix_vente;
    }

    private function estEnPromo($produit)
    {
        if (!$produit->prix_promo || !$produit->date_debut_promo || !$produit->date_fin_promo) {
            return false;
        }

        $maintenant = now();
        return $maintenant->between($produit->date_debut_promo, $produit->date_fin_promo);
    }

    
    public function photosPubliques($slug = null)
    {
        try {
            if ($slug) {
                $salon = Salon::where('slug', $slug)->first();
            } else {
                $salon = Salon::orderBy('id')->first();
            }

            if (!$salon) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun salon trouvé'
                ], 404);
            }
            
            $photos = PhotoClient::where('is_public', true)
                ->where('type_photo', 'apres')
                ->select('id', 'photo_url', 'description', 'date_prise')
                ->orderBy('date_prise', 'desc')
                ->limit(12)
                ->get()
                ->map(function ($photo) {
                    // Enlever "storage/" si présent au début
                    $cleanPath = preg_replace('/^storage\//', '', $photo->photo_url);
                    // Construire l'URL complète
                    $photo->photo_url = url('storage/' . $cleanPath);
                    return $photo;
                });

            return response()->json([
                'success' => true,
                'data' => $photos
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur photos publiques: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}