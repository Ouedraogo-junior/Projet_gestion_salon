<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\VenteRequest;
use App\Models\Vente;
use App\Models\VenteDetail;
use App\Models\Produit;
use App\Models\Client;
use App\Models\MouvementStock;
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
            $query = Vente::with(['client', 'user', 'details.produit']);

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
            if ($request->has('statut')) {
                $query->where('statut', $request->statut);
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
    public function store(VenteRequest $request)
    {
        DB::beginTransaction();

        try {
            // Générer numéro de facture
            $numeroFacture = 'VT-' . date('Ymd') . '-' . str_pad(Vente::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);

            // Créer la vente
            $vente = Vente::create([
                'numero_facture' => $numeroFacture,
                'client_id' => $request->client_id,
                'user_id' => auth()->id(),
                'date_vente' => now(),
                'montant_total' => 0, // Calculé après
                'mode_paiement' => $request->mode_paiement,
                'statut' => $request->statut ?? 'completee',
                'notes' => $request->notes,
            ]);

            $montantTotal = 0;

            // Créer les détails de vente
            foreach ($request->items as $item) {
                $produit = Produit::findOrFail($item['produit_id']);

                // Vérifier stock pour les produits
                if ($produit->type === 'produit' && $produit->quantite_stock < $item['quantite']) {
                    throw new \Exception("Stock insuffisant pour {$produit->nom}");
                }

                $prixUnitaire = $item['prix_unitaire'] ?? $produit->prix_vente;
                $sousTotal = $prixUnitaire * $item['quantite'];

                // Créer détail vente
                VenteDetail::create([
                    'vente_id' => $vente->id,
                    'produit_id' => $produit->id,
                    'quantite' => $item['quantite'],
                    'prix_unitaire' => $prixUnitaire,
                    'sous_total' => $sousTotal,
                ]);

                $montantTotal += $sousTotal;

                // Décompter le stock pour les produits
                if ($produit->type === 'produit') {
                    $produit->decrement('quantite_stock', $item['quantite']);

                    // Créer mouvement de stock
                    MouvementStock::create([
                        'produit_id' => $produit->id,
                        'type_mouvement' => 'sortie',
                        'quantite' => $item['quantite'],
                        'motif' => "Vente #{$numeroFacture}",
                        'user_id' => auth()->id(),
                    ]);
                }
            }

            // Mettre à jour montant total
            $vente->update(['montant_total' => $montantTotal]);

            // Mettre à jour points fidélité client
            if ($vente->client_id) {
                $client = Client::find($vente->client_id);
                $pointsGagnes = floor($montantTotal / 1000); // 1 point par 1000 FCFA
                $client->increment('points_fidelite', $pointsGagnes);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Vente enregistrée avec succès',
                'data' => $vente->load(['details.produit', 'client'])
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
            $vente = Vente::with(['client', 'user', 'details.produit'])
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
     * Mettre à jour une vente (modification limitée)
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'statut' => 'sometimes|in:en_attente,completee,annulee',
            'notes' => 'sometimes|string|max:500',
        ]);

        try {
            $vente = Vente::findOrFail($id);

            // Seules certaines modifications sont autorisées
            $vente->update($request->only(['statut', 'notes']));

            return response()->json([
                'success' => true,
                'message' => 'Vente mise à jour avec succès',
                'data' => $vente->load(['details.produit', 'client'])
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
     * Annuler une vente (recréditer le stock)
     */
    public function cancel($id)
    {
        DB::beginTransaction();

        try {
            $vente = Vente::with('details.produit')->findOrFail($id);

            if ($vente->statut === 'annulee') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette vente est déjà annulée'
                ], 400);
            }

            // Recréditer le stock
            foreach ($vente->details as $detail) {
                if ($detail->produit->type === 'produit') {
                    $detail->produit->increment('quantite_stock', $detail->quantite);

                    // Créer mouvement de stock
                    MouvementStock::create([
                        'produit_id' => $detail->produit_id,
                        'type_mouvement' => 'entree',
                        'quantite' => $detail->quantite,
                        'motif' => "Annulation vente #{$vente->numero_facture}",
                        'user_id' => auth()->id(),
                    ]);
                }
            }

            // Retirer points fidélité
            if ($vente->client_id) {
                $client = Client::find($vente->client_id);
                $pointsRetires = floor($vente->montant_total / 1000);
                $client->decrement('points_fidelite', $pointsRetires);
            }

            $vente->update(['statut' => 'annulee']);

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
            $vente = Vente::with(['client', 'user', 'details.produit'])
                ->findOrFail($id);

            $pdf = Pdf::loadView('receipts.vente', compact('vente'));

            return $pdf->download("recu_{$vente->numero_facture}.pdf");

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
                'total_ventes' => Vente::whereBetween('date_vente', [$dateDebut, $dateFin])
                    ->where('statut', 'completee')
                    ->sum('montant_total'),
                
                'nombre_ventes' => Vente::whereBetween('date_vente', [$dateDebut, $dateFin])
                    ->where('statut', 'completee')
                    ->count(),
                
                'panier_moyen' => Vente::whereBetween('date_vente', [$dateDebut, $dateFin])
                    ->where('statut', 'completee')
                    ->avg('montant_total'),
                
                'par_mode_paiement' => Vente::whereBetween('date_vente', [$dateDebut, $dateFin])
                    ->where('statut', 'completee')
                    ->selectRaw('mode_paiement, SUM(montant_total) as total, COUNT(*) as nombre')
                    ->groupBy('mode_paiement')
                    ->get(),
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