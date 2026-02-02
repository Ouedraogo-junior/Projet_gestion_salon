<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVenteRequest;
use App\Models\Vente;
use App\Models\VenteDetail;
use App\Models\Produit;
use App\Models\TypePrestation;
use App\Models\Client;
use App\Models\MouvementStock;
use App\Models\VentePaiement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class VenteController extends Controller
{
    /**
     * Liste des ventes
     */
    public function index(Request $request)
    {
        try {
            $query = Vente::with(['client', 'vendeur', 'details']);

            // Recherche par numéro facture ou client
            if ($request->has('search')) {
                $search = $request->search;
                $query->where('numero_facture', 'LIKE', "%{$search}%")
                    ->orWhereHas('client', function($q) use ($search) {
                        $q->where('nom', 'LIKE', "%{$search}%")
                          ->orWhere('prenom', 'LIKE', "%{$search}%");
                    });
            }

            // Filtre par client
            if ($request->has('client_id')) {
                $query->where('client_id', $request->client_id);
            }

            // Filtre par mode paiement
            if ($request->has('mode_paiement')) {
                $query->where('mode_paiement', $request->mode_paiement);
            }

            // Filtre par statut
            if ($request->has('statut_paiement')) {
                $query->where('statut_paiement', $request->statut_paiement);
            }

            // Filtre par date
            if ($request->has('date_debut')) {
                $query->whereDate('date_vente', '>=', $request->date_debut);
            }
            if ($request->has('date_fin')) {
                $query->whereDate('date_vente', '<=', $request->date_fin);
            }

            $sortBy = $request->get('sort_by', 'date_vente');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $perPage = $request->get('per_page', 20);
            $ventes = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $ventes
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des ventes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer une nouvelle vente
     */
    public function store(StoreVenteRequest $request)
    {
        DB::beginTransaction();

        if (!auth()->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            // Vérifier que l'ID existe
            $userId = auth()->id();
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'ID utilisateur introuvable'
                ], 401);
            }


        try {
            // ========================================
            // 1. GESTION DU CLIENT
            // ========================================
            $clientId = null;
            $clientNom = null;
            $clientTelephone = null;

            if ($request->client_id) {
                // Client existant
                $clientId = $request->client_id;
                $client = Client::find($clientId);
                if ($client) {
                    $clientNom = $client->nom . ' ' . $client->prenom;
                    $clientTelephone = $client->telephone;
                }
            } elseif ($request->nouveau_client) {
                // Nouveau client - créer
                $client = Client::create([
                    'nom' => $request->nouveau_client['nom'],
                    'prenom' => $request->nouveau_client['prenom'],
                    'telephone' => $request->nouveau_client['telephone'],
                    'email' => $request->nouveau_client['email'] ?? null,
                    'points_fidelite' => 0,
                ]);
                $clientId = $client->id;
                $clientNom = $client->nom . ' ' . $client->prenom;
                $clientTelephone = $client->telephone;
            } elseif ($request->client_anonyme) {
                // Client anonyme
                $clientNom = $request->client_anonyme['nom'];
                $clientTelephone = $request->client_anonyme['telephone'] ?? null;
            }

            // ========================================
            // 2. CALCULER LES MONTANTS
            // ========================================
            $montantPrestations = 0;
            $montantProduits = 0;
            $montantTotalHT = 0;
            $montantReductionArticles = 0;

            foreach ($request->articles as $article) {
                $sousTotal = $article['prix_unitaire'] * $article['quantite'];
                $reductionArticle = $article['reduction'] ?? 0;
                $sousTotalApresReduction = $sousTotal - $reductionArticle;

                $montantTotalHT += $sousTotalApresReduction;
                $montantReductionArticles += $reductionArticle;

                if ($article['type'] === 'prestation') {
                    $montantPrestations += $sousTotalApresReduction;
                } else {
                    $montantProduits += $sousTotalApresReduction;
                }
            }

            // Réduction globale
            $montantReductionGlobale = 0;
            if ($request->reduction) {
                if ($request->reduction['type'] === 'pourcentage') {
                    $montantReductionGlobale = ($montantTotalHT * $request->reduction['valeur']) / 100;
                } else {
                    $montantReductionGlobale = $request->reduction['valeur'];
                }
            }

            // Réduction points fidélité
            $montantReductionPoints = 0;
            if ($request->points_utilises > 0) {
                $montantReductionPoints = ($request->points_utilises / 100) * 1000; // 100 points = 1000 FCFA
            }

            $montantReductionTotal = $montantReductionArticles + $montantReductionGlobale + $montantReductionPoints;
            $montantTotalTTC = max(0, $montantTotalHT - $montantReductionGlobale - $montantReductionPoints);

            // Paiements
            $montantPaye = array_sum(array_column($request->paiements, 'montant'));
            $montantRendu = max(0, $montantPaye - $montantTotalTTC);
            $soldeRestant = max(0, $montantTotalTTC - $montantPaye);

            // Statut paiement
            if ($soldeRestant == 0) {
                $statutPaiement = 'paye';
            } elseif ($montantPaye > 0) {
                $statutPaiement = 'partiel';
            } else {
                $statutPaiement = 'impaye';
            }

            // Points gagnés
            $pointsGagnes = floor($montantTotalTTC / 1000); // 1 point par 1000 FCFA

            // Déterminer type de vente
            $typeVente = 'mixte';
            if ($montantPrestations > 0 && $montantProduits == 0) {
                $typeVente = 'prestations';
            } elseif ($montantProduits > 0 && $montantPrestations == 0) {
                $typeVente = 'produits';
            }

            // Déterminer mode paiement principal
            $modePaiement = 'mixte';
            if (count($request->paiements) == 1) {
                $modePaiement = $request->paiements[0]['mode'];
            }

            // ========================================
            // 3. GÉNÉRER NUMÉRO FACTURE
            // ========================================
            $numeroFacture = 'VT-' . date('Ymd') . '-' . str_pad(
                Vente::whereDate('created_at', today())->count() + 1,
                4,
                '0',
                STR_PAD_LEFT
            );

            // ========================================
            // 4. CRÉER LA VENTE
            // ========================================
            $vente = Vente::create([
                'numero_facture' => $numeroFacture,
                'client_id' => $clientId,
                'client_nom' => $clientNom,
                'client_telephone' => $clientTelephone,
                'coiffeur_id' => $request->coiffeur_id,
                'vendeur_id' => $userId,
                'rendez_vous_id' => $request->rendez_vous_id,
                'type_vente' => $typeVente,
                'date_vente' => now(),
                'montant_prestations' => $montantPrestations,
                'montant_produits' => $montantProduits,
                'montant_total_ht' => $montantTotalHT,
                'montant_reduction' => $montantReductionTotal,
                'type_reduction' => $request->reduction ? 'manuelle' : ($request->points_utilises > 0 ? 'fidelite' : 'aucune'),
                'montant_total_ttc' => $montantTotalTTC,
                'mode_paiement' => $modePaiement,
                'montant_paye' => $montantPaye,
                'montant_rendu' => $montantRendu,
                'statut_paiement' => $statutPaiement,
                'solde_restant' => $soldeRestant,
                'recu_imprime' => false,
                'points_gagnes' => $pointsGagnes,
                'points_utilises' => $request->points_utilises ?? 0,
                'notes' => $request->notes,
                'sync_status' => 'synced',
            ]);

            // ========================================
            // 5. CRÉER LES DÉTAILS
            // ========================================
            foreach ($request->articles as $article) {
                $articleNom = '';
                $prestationId = null;
                $produitId = null;
                $produitReference = null;

                if ($article['type'] === 'prestation') {
                    $prestation = TypePrestation::find($article['id']);
                    if ($prestation) {
                        $articleNom = $prestation->nom;
                        $prestationId = $prestation->id;
                    }
                } else {
                    $produit = Produit::find($article['id']);
                    if ($produit) {
                        $articleNom = $produit->nom;
                        $produitId = $produit->id;
                        $produitReference = $produit->reference;

                        // Vérifier stock
                        $sourceStock = $article['source_stock'] ?? 'vente';
                        $stockDisponible = $sourceStock === 'vente' ? $produit->stock_vente : $produit->stock_utilisation;

                        if ($stockDisponible < $article['quantite']) {
                            throw new \Exception("Stock insuffisant pour {$produit->nom}. Disponible: {$stockDisponible}");
                        }

                        // Décompter le stock
                        if ($sourceStock === 'vente') {
                            $produit->decrement('stock_vente', $article['quantite']);
                        } else {
                            $produit->decrement('stock_utilisation', $article['quantite']);
                        }

                        // Créer mouvement de stock
                        MouvementStock::create([
                            'produit_id' => $produit->id,
                            'type_stock' => $sourceStock,
                            'type_mouvement' => 'sortie',
                            'quantite' => $article['quantite'],
                            'stock_avant' => $stockDisponible,
                            'stock_apres' => $stockDisponible - $article['quantite'],
                            'motif' => "Vente #{$numeroFacture}",
                            'vente_id' => $vente->id,
                            'user_id' => auth()->id(),
                        ]);
                    }
                }

                // Créer détail vente
                VenteDetail::create([
                    'vente_id' => $vente->id,
                    'type_article' => $article['type'],
                    'article_nom' => $articleNom,
                    'prestation_id' => $prestationId,
                    'produit_id' => $produitId,
                    'produit_reference' => $produitReference,
                    'quantite' => $article['quantite'],
                    'prix_unitaire' => $article['prix_unitaire'],
                    'prix_total' => $article['prix_unitaire'] * $article['quantite'],
                    'reduction' => $article['reduction'] ?? 0,
                ]);
            }

            // ========================================
            // 6. CRÉER LES PAIEMENTS
            // ========================================
            foreach ($request->paiements as $paiement) {
                VentePaiement::create([
                    'vente_id' => $vente->id,
                    'mode_paiement' => $paiement['mode'],
                    'montant' => $paiement['montant'],
                    'reference' => $paiement['reference'] ?? null,
                ]);
            }

            // ========================================
            // 7. METTRE À JOUR POINTS FIDÉLITÉ
            // ========================================
            if ($clientId) {
                $client = Client::find($clientId);
                
                // Retirer points utilisés
                if ($request->points_utilises > 0) {
                    $client->decrement('points_fidelite', $request->points_utilises);
                }
                
                // Ajouter points gagnés
                if ($pointsGagnes > 0) {
                    $client->increment('points_fidelite', $pointsGagnes);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Vente enregistrée avec succès',
                'data' => $vente->load(['details', 'client', 'vendeur', 'paiements'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la vente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher une vente
     */
    public function show($id)
    {
        try {
            $vente = Vente::with(['client', 'vendeur', 'details', 'paiements'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $vente
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Vente non trouvée',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Mettre à jour une vente (notes uniquement)
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'notes' => 'sometimes|string|max:500',
        ]);

        try {
            $vente = Vente::findOrFail($id);
            $vente->update($request->only(['notes']));

            return response()->json([
                'success' => true,
                'message' => 'Vente mise à jour avec succès',
                'data' => $vente->load(['details', 'client'])
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Annuler une vente
     */
    public function cancel($id)
    {
        DB::beginTransaction();

        try {
            $vente = Vente::with('details')->findOrFail($id);

            if ($vente->statut_paiement === 'annulee') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette vente est déjà annulée'
                ], 400);
            }

            // Recréditer le stock pour les produits
            foreach ($vente->details as $detail) {
                if ($detail->type_article === 'produit' && $detail->produit_id) {
                    $produit = Produit::find($detail->produit_id);
                    if ($produit) {
                        // Trouver le mouvement original pour connaître la source
                        $mouvementOriginal = MouvementStock::where('vente_id', $vente->id)
                            ->where('produit_id', $produit->id)
                            ->first();
                        
                        $typeStock = $mouvementOriginal ? $mouvementOriginal->type_stock : 'vente';
                        
                        if ($typeStock === 'vente') {
                            $stockAvant = $produit->stock_vente;
                            $produit->increment('stock_vente', $detail->quantite);
                        } else {
                            $stockAvant = $produit->stock_utilisation;
                            $produit->increment('stock_utilisation', $detail->quantite);
                        }

                        // Créer mouvement de recrédit
                        MouvementStock::create([
                            'produit_id' => $produit->id,
                            'type_stock' => $typeStock,
                            'type_mouvement' => 'entree',
                            'quantite' => $detail->quantite,
                            'stock_avant' => $stockAvant,
                            'stock_apres' => $stockAvant + $detail->quantite,
                            'motif' => "Annulation vente #{$vente->numero_facture}",
                            'vente_id' => $vente->id,
                            'user_id' => auth()->id(),
                        ]);
                    }
                }
            }

            // Recréditer les points fidélité
            if ($vente->client_id) {
                $client = Client::find($vente->client_id);
                if ($client) {
                    // Rendre les points utilisés
                    if ($vente->points_utilises > 0) {
                        $client->increment('points_fidelite', $vente->points_utilises);
                    }
                    // Retirer les points gagnés
                    if ($vente->points_gagnes > 0) {
                        $client->decrement('points_fidelite', $vente->points_gagnes);
                    }
                }
            }

            $vente->update(['statut_paiement' => 'annulee']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Vente annulée avec succès',
                'data' => $vente->fresh()
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'annulation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Générer reçu PDF
     */
    public function generateReceipt($id)
    {
        try {
            $vente = Vente::with(['client', 'vendeur', 'coiffeur', 'details', 'paiements'])
                ->findOrFail($id);
            
            // Récupérer les informations du salon
            $salon = \App\Models\Salon::first();

            // Créer le PDF en format A6 (105x148mm)
            $pdf = Pdf::loadView('receipts.vente', compact('vente', 'salon'))
                ->setPaper([0, 0, 297.64, 419.53], 'portrait'); // A6 en points

            // Marquer le reçu comme imprimé
            $vente->update(['recu_imprime' => true]);

            // Afficher le PDF dans le navigateur (stream) au lieu de le télécharger
            return $pdf->stream("recu_{$vente->numero_facture}.pdf");

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du reçu',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Statistiques ventes
     */
    public function stats(Request $request)
    {
        try {
            $dateDebut = $request->get('date_debut', now()->startOfMonth());
            $dateFin = $request->get('date_fin', now()->endOfMonth());

            $stats = [
                'ca_total' => Vente::whereBetween('date_vente', [$dateDebut, $dateFin])
                    ->where('statut_paiement', '!=', 'annulee')
                    ->sum('montant_total_ttc'),
                
                'ca_prestations' => Vente::whereBetween('date_vente', [$dateDebut, $dateFin])
                    ->where('statut_paiement', '!=', 'annulee')
                    ->sum('montant_prestations'),
                
                'ca_produits' => Vente::whereBetween('date_vente', [$dateDebut, $dateFin])
                    ->where('statut_paiement', '!=', 'annulee')
                    ->sum('montant_produits'),
                
                'nombre_ventes' => Vente::whereBetween('date_vente', [$dateDebut, $dateFin])
                    ->where('statut_paiement', '!=', 'annulee')
                    ->count(),
                
                'panier_moyen' => Vente::whereBetween('date_vente', [$dateDebut, $dateFin])
                    ->where('statut_paiement', '!=', 'annulee')
                    ->avg('montant_total_ttc'),
                
                'par_mode_paiement' => Vente::whereBetween('date_vente', [$dateDebut, $dateFin])
                    ->where('statut_paiement', '!=', 'annulee')
                    ->selectRaw('mode_paiement, SUM(montant_total_ttc) as total, COUNT(*) as nombre')
                    ->groupBy('mode_paiement')
                    ->get(),
                
                'impayes_count' => Vente::whereBetween('date_vente', [$dateDebut, $dateFin])
                    ->where('statut_paiement', 'impaye')
                    ->count(),
                
                'impayes_montant' => Vente::whereBetween('date_vente', [$dateDebut, $dateFin])
                    ->where('statut_paiement', 'impaye')
                    ->sum('solde_restant'),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du calcul des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}