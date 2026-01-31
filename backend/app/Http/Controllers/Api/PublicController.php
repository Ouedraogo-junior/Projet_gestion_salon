<?php
// app/Http/Controllers/Api/PublicController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Salon;
use App\Models\Produit;
use App\Models\TypePrestation;
use Illuminate\Http\Request;

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
                $produit->prix_actuel = $this->getPrixActuel($produit);
                $produit->en_promo = $this->estEnPromo($produit);
                return $produit;
            });

        return response()->json([
            'success' => true,
            'data' => $produits
        ]);
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
}