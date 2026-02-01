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
        $query = RendezVous::with(['client', 'coiffeur', 'typePrestation']);

        // Filtre par statut
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        // Filtre par coiffeur
        if ($request->has('coiffeur_id')) {
            $query->where('coiffeur_id', $request->coiffeur_id);
        }

        // Filtre par client
        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        // Filtre par date
        if ($request->has('date')) {
            $query->whereDate('date_heure', $request->date);
        }

        // Filtre par période
        if ($request->has('date_debut') && $request->has('date_fin')) {
            $query->whereBetween('date_heure', [
                $request->date_debut,
                $request->date_fin
            ]);
        }

        // Rendez-vous à venir uniquement
        if ($request->has('a_venir') && $request->boolean('a_venir')) {
            $query->where('date_heure', '>=', now());
        }

        // Ordre par date
        $query->orderBy('date_heure', $request->get('order', 'asc'));

        $rendezVous = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $rendezVous
        ]);
    }

    /**
     * Créer un rendez-vous (PUBLIC - sans auth pour les clients)
     */
    public function storePublic(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'nullable|string|max:100',
            'prenom' => 'nullable|string|max:100',
            'telephone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'type_prestation_id' => 'required|exists:types_prestations,id',
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
                // Créer un nouveau client
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

            // 2. Récupérer les infos de la prestation
            $prestation = TypePrestation::findOrFail($request->type_prestation_id);

            // 3. Calculer l'acompte automatiquement depuis la prestation
            $acompteDemande = $prestation->acompte_requis;
            $acompteMontant = null;

            if ($acompteDemande) {
                if ($prestation->acompte_montant) {
                    // Montant fixe défini
                    $acompteMontant = $prestation->acompte_montant;
                } elseif ($prestation->acompte_pourcentage) {
                    // Pourcentage du prix
                    $acompteMontant = $prestation->prix_base * ($prestation->acompte_pourcentage / 100);
                }
            }

            // 4. Créer le rendez-vous
            $rendezVous = RendezVous::create([
                'client_id' => $client->id,
                'type_prestation_id' => $request->type_prestation_id,
                'date_heure' => $request->date_heure,
                'duree_minutes' => $prestation->duree_estimee_minutes,
                'prix_estime' => $prestation->prix_base,
                'statut' => 'en_attente',
                'notes' => $request->notes,
                'acompte_demande' => $acompteDemande,
                'acompte_montant' => $acompteMontant,
                'acompte_paye' => false,
            ]);

            DB::commit();

            // TODO: Envoyer SMS de confirmation
            // $this->envoyerSMSConfirmation($rendezVous);

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous enregistré avec succès. Vous recevrez une confirmation par SMS.',
                'data' => $rendezVous->load(['client', 'typePrestation'])
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
            'type_prestation_id' => 'required|exists:types_prestations,id',
            'date_heure' => 'required|date',
            'duree_minutes' => 'required|integer|min:15',
            'prix_estime' => 'nullable|numeric|min:0',
            'statut' => 'nullable|in:en_attente,confirme,en_cours,termine,annule',
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
            // Vérifier les conflits si coiffeur assigné
            if ($request->coiffeur_id) {
                $conflit = $this->verifierConflit(
                    $request->coiffeur_id,
                    $request->date_heure,
                    $request->duree_minutes
                );

                if ($conflit) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ce créneau est déjà occupé pour ce coiffeur'
                    ], 409);
                }
            }

            // Récupérer la prestation pour calculer l'acompte
            $prestation = TypePrestation::findOrFail($request->type_prestation_id);

            // Calculer l'acompte automatiquement
            $acompteDemande = $prestation->acompte_requis;
            $acompteMontant = null;

            if ($acompteDemande) {
                if ($prestation->acompte_montant) {
                    // Montant fixe défini
                    $acompteMontant = $prestation->acompte_montant;
                } elseif ($prestation->acompte_pourcentage) {
                    // Pourcentage du prix
                    $prixBase = $request->prix_estime ?? $prestation->prix_base;
                    $acompteMontant = $prixBase * ($prestation->acompte_pourcentage / 100);
                }
            }

            // Créer le rendez-vous
            $rendezVous = RendezVous::create([
                'client_id' => $request->client_id,
                'coiffeur_id' => $request->coiffeur_id,
                'type_prestation_id' => $request->type_prestation_id,
                'date_heure' => $request->date_heure,
                'duree_minutes' => $request->duree_minutes,
                'prix_estime' => $request->prix_estime ?? $prestation->prix_base,
                'statut' => $request->statut ?? 'en_attente',
                'notes' => $request->notes,
                'acompte_demande' => $acompteDemande,
                'acompte_montant' => $acompteMontant,
                'acompte_paye' => false,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous créé avec succès',
                'data' => $rendezVous->load(['client', 'coiffeur', 'typePrestation'])
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
        $rendezVous = RendezVous::with(['client', 'coiffeur', 'typePrestation'])
            ->findOrFail($id);

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
            // Vérifier les conflits si changement de coiffeur ou date
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

            $rendezVous->update($request->all());
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous modifié avec succès',
                'data' => $rendezVous->fresh(['client', 'coiffeur', 'typePrestation'])
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
            // Vérifier conflit si coiffeur assigné
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

            // TODO: Envoyer SMS de confirmation
            // $this->envoyerSMSConfirmation($rendezVous);

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous confirmé avec succès',
                'data' => $rendezVous->fresh(['client', 'coiffeur', 'typePrestation'])
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

        // TODO: Envoyer SMS d'annulation
        // $this->envoyerSMSAnnulation($rendezVous);

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
            'type_prestation_id' => 'required|exists:types_prestations,id',
            'coiffeur_id' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $prestation = TypePrestation::findOrFail($request->type_prestation_id);
        $date = Carbon::parse($request->date);
        
        // Horaires du salon (à adapter selon vos besoins)
        $heureOuverture = $date->copy()->setTime(8, 0);
        $heureFermeture = $date->copy()->setTime(18, 0);
        $pauseDebut = $date->copy()->setTime(12, 30);
        $pauseFin = $date->copy()->setTime(14, 0);
        
        $creneaux = [];
        $intervalle = 30; // minutes entre chaque créneau
        $current = $heureOuverture->copy();

        while ($current->lt($heureFermeture)) {
            // Vérifier si c'est pendant la pause
            if ($current->gte($pauseDebut) && $current->lt($pauseFin)) {
                $current->addMinutes($intervalle);
                continue;
            }

            // Vérifier si le créneau est dans le passé
            if ($current->lt(now())) {
                $current->addMinutes($intervalle);
                continue;
            }

            // Vérifier disponibilité
            $disponible = true;
            
            if ($request->coiffeur_id) {
                $disponible = !$this->verifierConflit(
                    $request->coiffeur_id,
                    $current,
                    $prestation->duree_estimee_minutes
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
                  ->orWhere(function ($subQ) use ($heureDebut, $heureFin) {
                      $subQ->where('date_heure', '<=', $heureDebut)
                           ->whereRaw('DATE_ADD(date_heure, INTERVAL duree_minutes MINUTE) > ?', [$heureDebut]);
                  });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }


    /**
     * Récupérer les rendez-vous d'un client par son téléphone (PUBLIC)
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

        // Nettoyer le numéro de téléphone (enlever espaces, tirets, etc.)
        $telephone = preg_replace('/[^0-9+]/', '', $request->telephone);

        // Trouver le client par téléphone
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

        // Récupérer tous les rendez-vous du client
        $rendezVous = RendezVous::with(['typePrestation', 'coiffeur'])
            ->where('client_id', $client->id)
            ->orderBy('date_heure', 'desc')
            ->get()
            ->map(function ($rdv) {
                $deuxHeuresAvant = Carbon::parse($rdv->date_heure)->subHours(2);
                $peutAnnuler = $rdv->peutEtreAnnule() && now()->lte($deuxHeuresAvant);
                
                return [
                    'id' => $rdv->id,
                    'type_prestation' => $rdv->typePrestation,
                    'coiffeur' => $rdv->coiffeur ? [
                        'nom' => $rdv->coiffeur->nom,
                        'prenom' => $rdv->coiffeur->prenom,
                    ] : null,
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
                    'token_annulation' => $rdv->token_annulation, // Pour l'annulation
                ];
            });

        // Séparer les RDV à venir et passés
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
     * Annuler un rendez-vous (PUBLIC - avec téléphone + vérification)
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

        // Nettoyer le téléphone
        $telephone = preg_replace('/[^0-9+]/', '', $request->telephone);

        // Trouver le rendez-vous avec vérification du client
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

        // Vérifier le délai de 2h
        $deuxHeuresAvant = Carbon::parse($rendezVous->date_heure)->subHours(2);
        if (now()->gt($deuxHeuresAvant)) {
            return response()->json([
                'success' => false,
                'message' => 'Les annulations doivent être effectuées au moins 2 heures avant le rendez-vous. Veuillez contacter le salon au XXX XX XX XX.'
            ], 403);
        }

        $motif = $request->motif_annulation ?? 'Annulation client via interface publique';
        $rendezVous->annuler($motif);

        // TODO: Envoyer SMS de confirmation d'annulation
        // $this->envoyerSMSAnnulation($rendezVous);

        return response()->json([
            'success' => true,
            'message' => 'Votre rendez-vous a été annulé avec succès. Vous recevrez une confirmation par SMS.'
        ]);
    }

   /**
     * Marquer l'acompte comme payé
     */
    public function marquerAcomptePaye($id)
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

        $rendezVous->update(['acompte_paye' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Acompte marqué comme payé',
            'data' => $rendezVous->fresh(['client', 'coiffeur', 'typePrestation'])
        ]);
    }
}