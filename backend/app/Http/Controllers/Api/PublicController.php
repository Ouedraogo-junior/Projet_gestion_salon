<?php
// app/Http/Controllers/Api/PublicController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Salon;
use App\Models\Produit;
use App\Models\TypePrestation;
use Illuminate\Http\Request;
use App\Models\PhotoClient;
use App\Models\Realisation;
use Illuminate\Support\Facades\Log;

class PublicController extends Controller
{
    public function getSalonDefaut()
    {
        $salon = Salon::where('is_active', true)->orderBy('id')->first();

        if (!$salon) {
            return response()->json(['success' => false, 'message' => 'Aucun salon actif trouvé'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id'          => $salon->id,
                'nom'         => $salon->nom,
                'slug'        => $salon->slug,
                'telephone'   => $salon->telephone,
                'adresse'     => $salon->adresse,
                'description' => $salon->description ?? null,
                'horaires'    => $salon->horaires ?? null,
                'photo_url'   => $salon->photo_url ?? null,
            ]
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
                'id'          => $salon->id,
                'nom'         => $salon->nom,
                'telephone'   => $salon->telephone,
                'adresse'     => $salon->adresse,
                'description' => $salon->description ?? null,
                'horaires'    => $salon->horaires ?? null,
                'photo_url'   => $salon->photo_url ?? null,
                'logo_url'    => $salon->logo_url ?? null,
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

        return response()->json(['success' => true, 'data' => $prestations]);
    }

    public function produits($slug = null)
    {
        $salon = $slug
            ? Salon::where('slug', $slug)->firstOrFail()
            : Salon::where('is_active', true)->orderBy('id')->firstOrFail();

        // On charge les produits avec leurs variantes actives et validées
        $produits = Produit::where('salon_id', $salon->id)
            ->where('is_active', true)
            ->where('visible_public', true)
            ->with(['variantes' => function ($q) {
                $q->where('is_active', true)
                  ->where('statut_validation', 'valide')
                  ->whereIn('type_stock_principal', ['vente', 'mixte'])
                  ->where('stock_vente', '>', 0);
            }])
            ->get()
            ->filter(fn($p) => $p->variantes->isNotEmpty()) // exclure produits sans variante dispo
            ->map(function ($produit) {
                // On prend la variante la moins chère disponible comme représentante
                $variante = $produit->variantes->sortBy('prix_vente')->first();

                if ($produit->photo_url) {
                    $cleanPath = preg_replace('/^storage\//', '', $produit->photo_url);
                    $produit->photo_url = url('storage/' . $cleanPath);
                }

                return [
                    'id'              => $produit->id,
                    'nom'             => $produit->nom,
                    'description'     => $produit->description,
                    'marque'          => $produit->marque,
                    'photo_url'       => $produit->photo_url,
                    'prix_vente'      => (float) $variante->prix_vente,
                    'prix_promo'      => $variante->prix_promo ? (float) $variante->prix_promo : null,
                    'date_debut_promo' => $variante->date_debut_promo,
                    'date_fin_promo'  => $variante->date_fin_promo,
                    'stock_vente'     => (int) $variante->stock_vente,
                    'prix_actuel'     => (float) $this->getPrixActuel($variante),
                    'en_promo'        => $this->estEnPromo($variante),
                    'variantes_count' => $produit->variantes->count(),
                ];
            })
            ->values();

        return response()->json(['success' => true, 'data' => $produits]);
    }

    public function produitDetails($id)
    {
        try {
            $produit = Produit::with([
                'categorie:id,nom,couleur',
                'variantes' => function ($q) {
                    $q->where('is_active', true)
                      ->where('statut_validation', 'valide')
                      ->with(['valeursAttributs.attribut:id,nom,type_valeur,unite']);
                }
            ])
            ->where('id', $id)
            ->where('is_active', true)
            ->where('visible_public', true)
            ->first();

            if (!$produit) {
                return response()->json(['success' => false, 'message' => 'Produit non trouvé'], 404);
            }

            if ($produit->photo_url) {
                $cleanPath = preg_replace('/^storage\//', '', $produit->photo_url);
                $produit->photo_url = url('storage/' . $cleanPath);
            }

            $variantes = $produit->variantes->map(function ($v) {
                return [
                    'id'                   => $v->id,
                    'reference'            => $v->reference,
                    'prix_vente'           => (float) $v->prix_vente,
                    'prix_promo'           => $v->prix_promo ? (float) $v->prix_promo : null,
                    'date_debut_promo'     => $v->date_debut_promo,
                    'date_fin_promo'       => $v->date_fin_promo,
                    'stock_vente'          => (int) $v->stock_vente,
                    'type_stock_principal' => $v->type_stock_principal,
                    'prix_actuel'          => (float) $this->getPrixActuel($v),
                    'en_promo'             => $this->estEnPromo($v),
                    'valeurs_attributs'    => $v->valeursAttributs->map(fn($va) => [
                        'id'         => $va->id,
                        'attribut_id' => $va->attribut_id,
                        'valeur'     => $va->valeur,
                        'attribut'   => [
                            'id'          => $va->attribut->id,
                            'nom'         => $va->attribut->nom,
                            'type_valeur' => $va->attribut->type_valeur,
                            'unite'       => $va->attribut->unite ?? null,
                        ]
                    ])->toArray()
                ];
            });

            $data = [
                'id'          => $produit->id,
                'nom'         => $produit->nom,
                'description' => $produit->description,
                'marque'      => $produit->marque,
                'photo_url'   => $produit->photo_url,
                'categorie'   => $produit->categorie ? [
                    'id'      => $produit->categorie->id,
                    'nom'     => $produit->categorie->nom,
                    'couleur' => $produit->categorie->couleur,
                ] : null,
                'variantes'   => $variantes,
            ];

            return response()->json(['success' => true, 'data' => $data]);

        } catch (\Exception $e) {
            Log::error('Erreur détails produit public: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement du produit',
                'error'   => config('app.debug') ? $e->getMessage() : 'Erreur serveur'
            ], 500);
        }
    }

    public function photosPubliques($slug = null)
    {
        try {
            $salon = $slug
                ? Salon::where('slug', $slug)->first()
                : Salon::orderBy('id')->first();

            if (!$salon) {
                return response()->json(['success' => false, 'message' => 'Aucun salon trouvé'], 404);
            }

            // Retourner les réalisations publiques avec leurs médias
            $realisations = Realisation::with(['medias' => function ($q) {
                    $q->select('id', 'realisation_id', 'media_url', 'type_media', 'type_photo', 'date_prise');
                }])
                ->where('is_public', true)
                ->select('id', 'nom_coiffure', 'montant_coiffure', 'description', 'date_prise')
                ->orderBy('date_prise', 'desc')
                ->limit(12)
                ->get()
                ->map(function ($realisation) {
                    $realisation->medias->transform(function ($media) {
                        $cleanPath = preg_replace('/^storage\//', '', $media->media_url);
                        $media->media_url = url('storage/' . $cleanPath);
                        return $media;
                    });
                    return $realisation;
                });

            return response()->json(['success' => true, 'data' => $realisations]);

        } catch (\Exception $e) {
            Log::error('Erreur médias publics: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function realisations($slug = null)
    {
        try {
            $salon = $slug
                ? Salon::where('slug', $slug)->first()
                : Salon::orderBy('id')->first();

            if (!$salon) {
                return response()->json(['success' => false, 'message' => 'Aucun salon trouvé'], 404);
            }

            $realisations = Realisation::with(['medias' => function ($q) {
                    $q->select('id', 'realisation_id', 'media_url', 'type_media', 'type_photo', 'date_prise');
                }])
                ->where('is_public', true)
                ->select('id', 'nom_coiffure', 'montant_coiffure', 'description', 'date_prise')
                ->orderBy('date_prise', 'desc')
                ->get()
                ->map(function ($realisation) {
                    $realisation->medias->transform(function ($media) {
                        $cleanPath = preg_replace('/^storage\//', '', $media->media_url);
                        $media->media_url = url('storage/' . $cleanPath);
                        return $media;
                    });
                    return $realisation;
                });

            return response()->json(['success' => true, 'data' => $realisations]);

        } catch (\Exception $e) {
            Log::error('Erreur réalisations publiques: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function getPrixActuel($variante)
    {
        return $this->estEnPromo($variante) ? $variante->prix_promo : $variante->prix_vente;
    }

    private function estEnPromo($variante)
    {
        if (!$variante->prix_promo || !$variante->date_debut_promo || !$variante->date_fin_promo) {
            return false;
        }
        return now()->between($variante->date_debut_promo, $variante->date_fin_promo);
    }
}