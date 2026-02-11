<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RendezVous;
use App\Models\RendezVousPaiement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class RendezVousPaiementController extends Controller
{
    /**
     * Enregistrer le paiement d'acompte
     */
    public function payerAcompte(Request $request, $rendezVousId)
    {
        $request->validate([
            'montant' => 'required|numeric|min:0',
            'mode_paiement' => 'required|in:especes,orange_money,moov_money,carte',
            'reference_transaction' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();

        try {
            $rendezVous = RendezVous::with(['client', 'typePrestation'])->findOrFail($rendezVousId);

            // Vérifications
            if ($rendezVous->acompte_paye) {
                return response()->json([
                    'success' => false,
                    'message' => 'L\'acompte a déjà été payé pour ce rendez-vous'
                ], 400);
            }

            if (!$rendezVous->acompte_demande) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun acompte n\'est demandé pour ce rendez-vous'
                ], 400);
            }

            // Créer le paiement
            $paiement = RendezVousPaiement::create([
                'rendez_vous_id' => $rendezVous->id,
                'type_paiement' => 'acompte',
                'montant' => $request->montant,
                'mode_paiement' => $request->mode_paiement,
                'reference_transaction' => $request->reference_transaction,
                'date_paiement' => now(),
                'user_id' => auth()->id(),
                'notes' => $request->notes,
            ]);

            // Mettre à jour le rendez-vous
            $rendezVous->update([
                'acompte_paye' => true,
                'statut' => 'confirme',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Acompte enregistré avec succès',
                'data' => [
                    'paiement' => $paiement,
                    'rendez_vous' => $rendezVous->fresh(['client', 'typePrestation', 'paiements'])
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'enregistrement du paiement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Finaliser un rendez-vous avec paiement du solde
     * (Cette méthode sera appelée après la création de la vente)
     */
    public function payerSolde(Request $request, $rendezVousId)
    {
        $request->validate([
            'vente_id' => 'required|exists:ventes,id',
            'montant' => 'required|numeric|min:0',
            'mode_paiement' => 'required|in:especes,orange_money,moov_money,carte',
            'reference_transaction' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();

        try {
            $rendezVous = RendezVous::findOrFail($rendezVousId);

            // Vérifier que le rendez-vous est en cours
            if ($rendezVous->statut !== 'en_cours') {
                return response()->json([
                    'success' => false,
                    'message' => 'Le rendez-vous doit être en cours pour finaliser le paiement'
                ], 400);
            }

            // Créer le paiement du solde
            $paiement = RendezVousPaiement::create([
                'rendez_vous_id' => $rendezVous->id,
                'type_paiement' => 'solde',
                'montant' => $request->montant,
                'mode_paiement' => $request->mode_paiement,
                'reference_transaction' => $request->reference_transaction,
                'date_paiement' => now(),
                'user_id' => auth()->id(),
                'notes' => $request->notes,
            ]);

            // Mettre à jour le statut du rendez-vous
            $rendezVous->update([
                'statut' => 'termine',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Paiement final enregistré avec succès',
                'data' => [
                    'paiement' => $paiement,
                    'rendez_vous' => $rendezVous->fresh(['client', 'typePrestation', 'paiements'])
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'enregistrement du paiement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marquer le rendez-vous comme en cours (client arrivé)
     */
    public function marquerEnCours($rendezVousId)
    {
        try {
            $rendezVous = RendezVous::findOrFail($rendezVousId);

            if (!in_array($rendezVous->statut, ['en_attente', 'confirme'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce rendez-vous ne peut pas être marqué comme en cours'
                ], 400);
            }

            $rendezVous->update(['statut' => 'en_cours']);

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous marqué comme en cours',
                'data' => $rendezVous->fresh(['client', 'typePrestation', 'paiements'])
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
 * Générer le reçu d'acompte
 */
public function genererRecuAcompte($rendezVousId)
{
    try {
        $rendezVous = RendezVous::with([
            'client',
            'typePrestation',
            'coiffeur',
            'paiements' => function($query) {
                $query->where('type_paiement', 'acompte')
                      ->with('user'); // Charger aussi l'utilisateur
            }
        ])->findOrFail($rendezVousId);

        if (!$rendezVous->acompte_paye) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun acompte payé pour ce rendez-vous'
            ], 400);
        }

        $paiementAcompte = $rendezVous->paiements->first();

        // Vérification supplémentaire
        if (!$paiementAcompte) {
            return response()->json([
                'success' => false,
                'message' => 'Paiement d\'acompte introuvable'
            ], 400);
        }

        $salon = \App\Models\Salon::first();

        // Générer le PDF
        $pdf = Pdf::loadView('receipts.rendez_vous_acompte', compact('rendezVous', 'paiementAcompte', 'salon'))
            ->setPaper([0, 0, 297.64, 419.53], 'portrait'); // A6

        return $pdf->stream("recu_acompte_RDV_{$rendezVous->id}.pdf");
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la génération du reçu',
            'error' => $e->getMessage()
        ], 500);
    }
}
    /**
     * Générer le reçu final (après prestation terminée)
     */
    public function genererRecuFinal($rendezVousId)
    {
        try {
            $rendezVous = RendezVous::with([
                'client',
                'typePrestation',
                'coiffeur',
                'paiements',
                'vente' => function($query) {
                    $query->with(['details', 'paiements']);
                }
            ])->findOrFail($rendezVousId);

            if ($rendezVous->statut !== 'termine') {
                return response()->json([
                    'success' => false,
                    'message' => 'Le rendez-vous doit être terminé pour générer le reçu final'
                ], 400);
            }

            $vente = $rendezVous->vente->first();
            if (!$vente) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucune vente associée à ce rendez-vous'
                ], 400);
            }

            $salon = \App\Models\Salon::first();

            // Générer le PDF
            $pdf = Pdf::loadView('receipts.rendez_vous_final', compact('rendezVous', 'vente', 'salon'))
                ->setPaper([0, 0, 297.64, 419.53], 'portrait'); // A6

            return $pdf->stream("recu_final_RDV_{$rendezVous->id}.pdf");

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du reçu',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Historique des paiements d'un rendez-vous
     */
    public function historiquePaiements($rendezVousId)
    {
        try {
            $paiements = RendezVousPaiement::where('rendez_vous_id', $rendezVousId)
                ->with('user')
                ->orderBy('date_paiement', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $paiements
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'historique',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Liste des rendez-vous avec infos de paiement (NOUVELLE MÉTHODE)
     */
    public function listeAvecPaiements(Request $request)
    {
        try {
            $query = RendezVous::with([
                'client',
                'coiffeur',
                'typePrestation',
                'paiements'
            ]);

            // Recherche par nom client ou téléphone
            if ($request->has('search')) {
                $search = $request->search;
                $query->whereHas('client', function($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                    ->orWhere('prenom', 'like', "%{$search}%")
                    ->orWhere('telephone', 'like', "%{$search}%");
                });
            }

            // Filtre par date
            if ($request->has('date_debut')) {
                $query->whereDate('date_heure', '>=', $request->date_debut);
            }
            if ($request->has('date_fin')) {
                $query->whereDate('date_heure', '<=', $request->date_fin);
            }

            $rendezVous = $query->orderBy('date_heure', 'desc')
                ->paginate(20);

            // Ajouter le montant total payé pour chaque RDV
            $rendezVous->getCollection()->transform(function($rdv) {
                $rdv->total_paye = $rdv->paiements->sum('montant');
                return $rdv;
            });

            return response()->json([
                'success' => true,
                'data' => $rendezVous
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des rendez-vous',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}