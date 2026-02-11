<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RendezVous;
use App\Models\Client;
use App\Models\TypePrestation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class RendezVousController extends Controller
{
    /**
     * Liste des rendez-vous avec filtres
     */
    public function index(Request $request)
    {
        $query = RendezVous::with(['client', 'coiffeur', 'prestations', 'coiffeurs', 'paiements']);

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->has('coiffeur_id')) {
            $query->where('coiffeur_id', $request->coiffeur_id);
        }

        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        if ($request->has('date')) {
            $query->whereDate('date_heure', $request->date);
        }

        if ($request->has('date_debut') && $request->has('date_fin')) {
            $query->whereBetween('date_heure', [
                $request->date_debut,
                $request->date_fin
            ]);
        }

        if ($request->has('a_venir') && $request->boolean('a_venir')) {
            $query->where('date_heure', '>=', now());
        }

        $query->orderBy('date_heure', $request->get('order', 'asc'));

        $rendezVous = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $rendezVous
        ]);
    }

    /**
     * Créer un rendez-vous (PUBLIC - sans auth)
     */
    public function storePublic(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'nullable|string|max:100',
            'prenom' => 'nullable|string|max:100',
            'telephone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'type_prestation_ids' => 'required|array|min:1',
            'type_prestation_ids.*' => 'exists:types_prestations,id',
            'date_heure' => 'required|date|after:now',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // 1. Trouver ou créer le client
            $client = Client::where('telephone', $request->telephone)->first();

            if (!$client) {
                $client = Client::create([
                    'nom' => $request->nom ?? 'Client',
                    'prenom' => $request->prenom ?? '',
                    'telephone' => $request->telephone,
                    'email' => $request->email,
                    'source' => 'reservation_en_ligne',
                    'points_fidelite' => 0,
                    'historique_visites' => 0,
                ]);
            }

            // 2. Récupérer les prestations
            $prestations = TypePrestation::whereIn('id', $request->type_prestation_ids)->get();

            // 3. Calculer totaux
            $prixTotal = $prestations->sum('prix_base');
            $dureeTotal = $prestations->sum('duree_estimee_minutes');

            // 4. Calculer acompte (si au moins 1 prestation le demande)
            $acompteDemande = $prestations->where('acompte_requis', true)->isNotEmpty();
            $acompteMontant = null;

            if ($acompteDemande) {
                // Calculer la somme des acomptes
                $acompteMontant = $prestations->sum(function ($p) {
                    if (!$p->acompte_requis) return 0;
                    if ($p->acompte_montant) return $p->acompte_montant;
                    if ($p->acompte_pourcentage) {
                        return round($p->prix_base * ($p->acompte_pourcentage / 100));
                    }
                    return 0;
                });
            }

            // 5. Créer le rendez-vous
            $rendezVous = RendezVous::create([
                'client_id' => $client->id,
                'date_heure' => $request->date_heure,
                'duree_minutes' => $dureeTotal,
                'prix_estime' => $prixTotal,
                'statut' => 'en_attente',
                'notes' => $request->notes,
                'acompte_demande' => $acompteDemande,
                'acompte_montant' => $acompteMontant,
                'acompte_paye' => false,
            ]);

            // 6. Attacher les prestations
            $rendezVous->prestations()->attach(
                collect($request->type_prestation_ids)->mapWithKeys(function ($id, $index) {
                    return [$id => ['ordre' => $index + 1]];
                })
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous enregistré avec succès. Vous recevrez une confirmation par SMS.',
                'data' => $rendezVous->load(['client', 'prestations'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du rendez-vous',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un rendez-vous (GÉRANT - avec auth)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'client_id' => 'required|exists:clients,id',
            'coiffeur_id' => 'nullable|exists:users,id',
            'coiffeur_ids' => 'nullable|array',
            'coiffeur_ids.*' => 'exists:users,id',
            'type_prestation_ids' => 'required|array|min:1',
            'type_prestation_ids.*' => 'exists:types_prestations,id',
            'date_heure' => 'required|date',
            'duree_minutes' => 'nullable|integer|min:15',
            'prix_estime' => 'nullable|numeric|min:0',
            'statut' => 'nullable|in:en_attente,confirme,en_cours,termine,annule',
            'notes' => 'nullable|string',
            'acompte_demande' => 'nullable|boolean',
            'acompte_montant' => 'nullable|numeric|min:0',
            'acompte_paye' => 'nullable|boolean',
            'mode_paiement' => 'required_if:acompte_paye,true|nullable|in:especes,orange_money,moov_money,carte',
            'reference_transaction' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Vérifier conflits coiffeur unique
            if ($request->coiffeur_id) {
                $duree = $request->duree_minutes ?? 60;
                $conflit = $this->verifierConflit(
                    $request->coiffeur_id,
                    $request->date_heure,
                    $duree
                );

                if ($conflit) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ce créneau est déjà occupé pour ce coiffeur'
                    ], 409);
                }
            }

            // Vérifier conflits coiffeurs multiples
            if ($request->has('coiffeur_ids') && is_array($request->coiffeur_ids)) {
                $duree = $request->duree_minutes ?? 60;
                foreach ($request->coiffeur_ids as $coiffeurId) {
                    $conflit = $this->verifierConflit(
                        $coiffeurId,
                        $request->date_heure,
                        $duree
                    );

                    if ($conflit) {
                        $coiffeur = User::find($coiffeurId);
                        return response()->json([
                            'success' => false,
                            'message' => "Ce créneau est déjà occupé pour {$coiffeur->prenom} {$coiffeur->nom}"
                        ], 409);
                    }
                }
            }

            // Récupérer les prestations
            $prestations = TypePrestation::whereIn('id', $request->type_prestation_ids)->get();

            // Calculer totaux si non fournis
            $prixEstime = $request->prix_estime ?? $prestations->sum('prix_base');
            $dureeMinutes = $request->duree_minutes ?? $prestations->sum('duree_estimee_minutes');

            // Gérer acompte
            $acompteDemande = $request->has('acompte_demande')
                ? $request->boolean('acompte_demande')
                : $prestations->where('acompte_requis', true)->isNotEmpty();

            $acompteMontant = null;

            if ($request->has('acompte_montant')) {
                $acompteMontant = $request->acompte_montant;
            } elseif ($acompteDemande) {
                // Calculer la somme des acomptes
                $acompteMontant = $prestations->sum(function ($p) use ($prixEstime, $prestations) {
                    if (!$p->acompte_requis) return 0;
                    if ($p->acompte_montant) return $p->acompte_montant;
                    if ($p->acompte_pourcentage) {
                        return round($p->prix_base * ($p->acompte_pourcentage / 100));
                    }
                    return 0;
                });
            }

            // Créer le rendez-vous
            $rendezVous = RendezVous::create([
                'client_id' => $request->client_id,
                'coiffeur_id' => $request->coiffeur_id,
                'date_heure' => $request->date_heure,
                'duree_minutes' => $dureeMinutes,
                'prix_estime' => $prixEstime,
                'statut' => $request->statut ?? 'en_attente',
                'notes' => $request->notes,
                'acompte_demande' => $acompteDemande,
                'acompte_montant' => $acompteMontant,
                'acompte_paye' => $request->boolean('acompte_paye', false),
            ]);

            // Attacher les prestations avec ordre
            $rendezVous->prestations()->attach(
                collect($request->type_prestation_ids)->mapWithKeys(function ($id, $index) {
                    return [$id => ['ordre' => $index + 1]];
                })
            );

            // Attacher les coiffeurs multiples
            if ($request->has('coiffeur_ids') && is_array($request->coiffeur_ids) && count($request->coiffeur_ids) > 0) {
                $rendezVous->coiffeurs()->attach($request->coiffeur_ids);
            }

            // Créer le paiement si acompte payé
            if ($rendezVous->acompte_paye && $rendezVous->acompte_montant) {
                \App\Models\RendezVousPaiement::create([
                    'rendez_vous_id' => $rendezVous->id,
                    'type_paiement' => 'acompte',
                    'montant' => $rendezVous->acompte_montant,
                    'mode_paiement' => $request->mode_paiement,
                    'reference_transaction' => $request->reference_transaction,
                    'date_paiement' => now(),
                    'user_id' => auth()->id(),
                    'notes' => 'Acompte payé lors de la création du rendez-vous',
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous créé avec succès',
                'data' => $rendezVous->load(['client', 'coiffeur', 'coiffeurs', 'prestations'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Détails d'un rendez-vous
     */
    public function show($id)
    {
        $rendezVous = RendezVous::with([
            'client', 
            'coiffeur', 
            'prestations', 
            'coiffeurs', 
            'paiements',
            'vente.details' // ← Ajoute la relation vente
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $rendezVous
        ]);
    }

    /**
     * Modifier un rendez-vous
     */
    public function update(Request $request, $id)
    {
        $rendezVous = RendezVous::findOrFail($id);

        if (!$rendezVous->estModifiable()) {
            return response()->json([
                'success' => false,
                'message' => 'Ce rendez-vous ne peut plus être modifié'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'coiffeur_id' => 'nullable|exists:users,id',
            'type_prestation_ids' => 'nullable|array|min:1',
            'type_prestation_ids.*' => 'exists:types_prestations,id',
            'date_heure' => 'nullable|date',
            'duree_minutes' => 'nullable|integer|min:15',
            'prix_estime' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'acompte_demande' => 'boolean',
            'acompte_montant' => 'nullable|numeric|min:0',
            'acompte_paye' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Vérifier conflits si changement de coiffeur ou date
            if (($request->has('coiffeur_id') || $request->has('date_heure'))
                && $request->coiffeur_id) {

                $conflit = $this->verifierConflit(
                    $request->coiffeur_id ?? $rendezVous->coiffeur_id,
                    $request->date_heure ?? $rendezVous->date_heure,
                    $request->duree_minutes ?? $rendezVous->duree_minutes,
                    $id
                );

                if ($conflit) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ce créneau est déjà occupé'
                    ], 409);
                }
            }

            // Mettre à jour les champs basiques
            $rendezVous->update($request->only([
                'coiffeur_id',
                'date_heure',
                'duree_minutes',
                'prix_estime',
                'notes',
                'acompte_demande',
                'acompte_montant',
                'acompte_paye'
            ]));

            // Mettre à jour les prestations si fournies
            if ($request->has('type_prestation_ids')) {
                $rendezVous->prestations()->sync(
                    collect($request->type_prestation_ids)->mapWithKeys(function ($id, $index) {
                        return [$id => ['ordre' => $index + 1]];
                    })
                );
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous modifié avec succès',
                'data' => $rendezVous->fresh(['client', 'coiffeur', 'prestations'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la modification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un rendez-vous
     */
    public function destroy($id)
    {
        $rendezVous = RendezVous::findOrFail($id);

        if (!$rendezVous->peutEtreAnnule()) {
            return response()->json([
                'success' => false,
                'message' => 'Ce rendez-vous ne peut pas être supprimé'
            ], 403);
        }

        $rendezVous->delete();

        return response()->json([
            'success' => true,
            'message' => 'Rendez-vous supprimé avec succès'
        ]);
    }

    /**
     * Confirmer un rendez-vous
     */
    public function confirm(Request $request, $id)
    {
        $rendezVous = RendezVous::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'coiffeur_id' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            if ($request->coiffeur_id) {
                $conflit = $this->verifierConflit(
                    $request->coiffeur_id,
                    $rendezVous->date_heure,
                    $rendezVous->duree_minutes,
                    $id
                );

                if ($conflit) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ce créneau est déjà occupé pour ce coiffeur'
                    ], 409);
                }
            }

            $rendezVous->update([
                'statut' => 'confirme',
                'coiffeur_id' => $request->coiffeur_id ?? $rendezVous->coiffeur_id,
                'notes' => $request->notes ?? $rendezVous->notes,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous confirmé avec succès',
                'data' => $rendezVous->fresh(['client', 'coiffeur', 'prestations'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la confirmation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Annuler un rendez-vous
     */
    public function cancel(Request $request, $id)
    {
        $rendezVous = RendezVous::findOrFail($id);

        if (!$rendezVous->peutEtreAnnule()) {
            return response()->json([
                'success' => false,
                'message' => 'Ce rendez-vous ne peut pas être annulé'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'motif_annulation' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $rendezVous->annuler($request->motif_annulation);

        return response()->json([
            'success' => true,
            'message' => 'Rendez-vous annulé avec succès',
            'data' => $rendezVous->fresh()
        ]);
    }

    /**
     * Marquer comme terminé
     */
    public function complete($id)
    {
        $rendezVous = RendezVous::findOrFail($id);

        if (!in_array($rendezVous->statut, ['confirme', 'en_cours'])) {
            return response()->json([
                'success' => false,
                'message' => 'Ce rendez-vous ne peut pas être marqué comme terminé'
            ], 403);
        }

        $rendezVous->terminer();

        return response()->json([
            'success' => true,
            'message' => 'Rendez-vous marqué comme terminé',
            'data' => $rendezVous->fresh()
        ]);
    }

    /**
     * Récupérer les créneaux disponibles
     */
    public function availableSlots(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date|after_or_equal:today',
            'type_prestation_ids' => 'required|array|min:1',
            'type_prestation_ids.*' => 'exists:types_prestations,id',
            'coiffeur_id' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $prestations = TypePrestation::whereIn('id', $request->type_prestation_ids)->get();
        $dureeTotal = $prestations->sum('duree_estimee_minutes');

        $date = Carbon::parse($request->date);

        $heureOuverture = $date->copy()->setTime(8, 0);
        $heureFermeture = $date->copy()->setTime(18, 0);
        $pauseDebut = $date->copy()->setTime(12, 30);
        $pauseFin = $date->copy()->setTime(14, 0);

        $creneaux = [];
        $intervalle = 30;
        $current = $heureOuverture->copy();

        while ($current->lt($heureFermeture)) {
            if ($current->gte($pauseDebut) && $current->lt($pauseFin)) {
                $current->addMinutes($intervalle);
                continue;
            }

            if ($current->lt(now())) {
                $current->addMinutes($intervalle);
                continue;
            }

            $disponible = true;

            if ($request->coiffeur_id) {
                $disponible = !$this->verifierConflit(
                    $request->coiffeur_id,
                    $current,
                    $dureeTotal
                );
            }

            $creneaux[] = [
                'heure' => $current->format('H:i'),
                'datetime' => $current->toIso8601String(),
                'disponible' => $disponible,
            ];

            $current->addMinutes($intervalle);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'date' => $date->format('Y-m-d'),
                'creneaux' => $creneaux,
            ]
        ]);
    }

    /**
     * Vérifier les conflits de rendez-vous
     */
    private function verifierConflit($coiffeurId, $dateHeure, $dureeMinutes, $excludeId = null)
    {
        $dateHeure = Carbon::parse($dateHeure);
        $heureDebut = $dateHeure;
        $heureFin = $dateHeure->copy()->addMinutes($dureeMinutes);

        $query = RendezVous::where('coiffeur_id', $coiffeurId)
            ->whereIn('statut', ['en_attente', 'confirme', 'en_cours'])
            ->where(function ($q) use ($heureDebut, $heureFin) {
                $q->whereBetween('date_heure', [$heureDebut, $heureFin])
                ->orWhere(function ($subQ) use ($heureDebut) {
                    $subQ->where('date_heure', '<=', $heureDebut)
                        ->whereRaw("date_heure + (duree_minutes || ' minutes')::INTERVAL > ?", [$heureDebut]);
                });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    /**
     * Récupérer les rendez-vous d'un client (PUBLIC)
     */
    public function mesRendezVous(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'telephone' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Numéro de téléphone requis',
                'errors' => $validator->errors()
            ], 422);
        }

        $telephone = preg_replace('/[^0-9+]/', '', $request->telephone);

        $client = Client::where('telephone', $telephone)->first();

        if (!$client) {
            return response()->json([
                'success' => true,
                'message' => 'Aucun rendez-vous trouvé pour ce numéro',
                'data' => [
                    'rendez_vous' => [],
                    'client' => null,
                ]
            ]);
        }

        $rendezVous = RendezVous::with(['prestations', 'coiffeur', 'coiffeurs'])
            ->where('client_id', $client->id)
            ->orderBy('date_heure', 'desc')
            ->get()
            ->map(function ($rdv) {
                $deuxHeuresAvant = Carbon::parse($rdv->date_heure)->subHours(2);
                $peutAnnuler = $rdv->peutEtreAnnule() && now()->lte($deuxHeuresAvant);

                return [
                    'id' => $rdv->id,
                    'prestations' => $rdv->prestations,
                    'coiffeur' => $rdv->coiffeur ? [
                        'nom' => $rdv->coiffeur->nom,
                        'prenom' => $rdv->coiffeur->prenom,
                    ] : null,
                    'coiffeurs' => $rdv->coiffeurs->map(fn($c) => [
                        'id' => $c->id,
                        'nom' => $c->nom,
                        'prenom' => $c->prenom,
                    ]),
                    'date_heure' => $rdv->date_heure,
                    'date_formattee' => $rdv->date_heure->format('d/m/Y'),
                    'heure_formattee' => $rdv->date_heure->format('H:i'),
                    'duree_minutes' => $rdv->duree_minutes,
                    'prix_estime' => $rdv->prix_estime,
                    'statut' => $rdv->statut,
                    'statut_formate' => $rdv->statut_formate,
                    'statut_couleur' => $rdv->statut_couleur,
                    'notes' => $rdv->notes,
                    'acompte_demande' => $rdv->acompte_demande,
                    'acompte_montant' => $rdv->acompte_montant,
                    'acompte_paye' => $rdv->acompte_paye,
                    'peut_annuler' => $peutAnnuler,
                    'heures_avant_rdv' => now()->diffInHours($rdv->date_heure, false),
                    'est_passe' => $rdv->date_heure->isPast(),
                    'token_annulation' => $rdv->token_annulation,
                ];
            });

        $aVenir = $rendezVous->filter(fn($rdv) => !$rdv['est_passe'])->values();
        $passes = $rendezVous->filter(fn($rdv) => $rdv['est_passe'])->values();

        return response()->json([
            'success' => true,
            'data' => [
                'client' => [
                    'nom' => $client->nom,
                    'prenom' => $client->prenom,
                    'telephone' => $client->telephone,
                    'points_fidelite' => $client->points_fidelite,
                ],
                'rendez_vous' => [
                    'a_venir' => $aVenir,
                    'passes' => $passes,
                    'total' => $rendezVous->count(),
                ],
            ]
        ]);
    }

    /**
     * Annuler un rendez-vous (PUBLIC)
     */
    public function cancelPublic(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'telephone' => 'required|string',
            'motif_annulation' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], 422);
        }

        $telephone = preg_replace('/[^0-9+]/', '', $request->telephone);

        $rendezVous = RendezVous::with('client')
            ->where('id', $id)
            ->whereHas('client', function($query) use ($telephone) {
                $query->where('telephone', $telephone);
            })
            ->first();

        if (!$rendezVous) {
            return response()->json([
                'success' => false,
                'message' => 'Rendez-vous introuvable ou numéro de téléphone incorrect'
            ], 404);
        }

        if (!$rendezVous->peutEtreAnnule()) {
            return response()->json([
                'success' => false,
                'message' => 'Ce rendez-vous ne peut plus être annulé (statut: ' . $rendezVous->statut_formate . ')'
            ], 403);
        }

        $deuxHeuresAvant = Carbon::parse($rendezVous->date_heure)->subHours(2);
        if (now()->gt($deuxHeuresAvant)) {
            return response()->json([
                'success' => false,
                'message' => 'Les annulations doivent être effectuées au moins 2 heures avant le rendez-vous. Veuillez contacter le salon au XXX XX XX XX.'
            ], 403);
        }

        $motif = $request->motif_annulation ?? 'Annulation client via interface publique';
        $rendezVous->annuler($motif);

        return response()->json([
            'success' => true,
            'message' => 'Votre rendez-vous a été annulé avec succès. Vous recevrez une confirmation par SMS.'
        ]);
    }

    /**
     * Marquer l'acompte comme payé
     */
    public function marquerAcomptePaye(Request $request, $id)
    {
        $rendezVous = RendezVous::findOrFail($id);

        if (!$rendezVous->acompte_demande) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun acompte n\'a été demandé pour ce rendez-vous'
            ], 400);
        }

        if ($rendezVous->acompte_paye) {
            return response()->json([
                'success' => false,
                'message' => 'L\'acompte a déjà été payé'
            ], 400);
        }

        DB::beginTransaction();
        try {
            \App\Models\RendezVousPaiement::create([
                'rendez_vous_id' => $rendezVous->id,
                'type_paiement' => 'acompte',
                'montant' => $rendezVous->acompte_montant,
                'mode_paiement' => $request->mode_paiement ?? 'especes',
                'reference_transaction' => $request->reference_transaction ?? null,
                'date_paiement' => now(),
                'user_id' => auth()->id(),
                'notes' => $request->notes ?? 'Acompte marqué comme payé',
            ]);

            $rendezVous->update(['acompte_paye' => true]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Acompte marqué comme payé',
                'data' => $rendezVous->fresh(['client', 'coiffeur', 'prestations', 'paiements'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateAcompte(Request $request, $id)
    {
        $request->validate([
            'acompte_montant' => 'required|numeric|min:0'
        ]);

        $rdv = RendezVous::findOrFail($id);
        $rdv->acompte_montant = $request->acompte_montant;
        $rdv->save();

        return response()->json([
            'success' => true,
            'data' => $rdv
        ]);
    }
}