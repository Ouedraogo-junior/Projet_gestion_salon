<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RendezVousRequest;
use App\Models\RendezVous;
use Illuminate\Http\Request;

class RendezVousController extends Controller
{
    /**
     * Liste des rendez-vous avec filtres
     */
    public function index(Request $request)
    {
        try {
            $query = RendezVous::with(['client', 'typePrestation', 'user']);

            // Filtre par statut
            if ($request->has('statut')) {
                $query->where('statut', $request->statut);
            }

            // Filtre par client
            if ($request->has('client_id')) {
                $query->where('client_id', $request->client_id);
            }

            // Filtre par type de prestation
            if ($request->has('type_prestation_id')) {
                $query->where('type_prestation_id', $request->type_prestation_id);
            }

            // Filtre par date
            if ($request->has('date')) {
                $query->whereDate('date_heure', $request->date);
            }

            // Filtre par période (jour, semaine, mois)
            if ($request->has('periode')) {
                switch ($request->periode) {
                    case 'jour':
                        $query->whereDate('date_heure', now());
                        break;
                    case 'semaine':
                        $query->whereBetween('date_heure', [
                            now()->startOfWeek(),
                            now()->endOfWeek()
                        ]);
                        break;
                    case 'mois':
                        $query->whereMonth('date_heure', now()->month)
                              ->whereYear('date_heure', now()->year);
                        break;
                }
            }

            // Filtre par plage de dates
            if ($request->has('date_debut') && $request->has('date_fin')) {
                $query->whereBetween('date_heure', [
                    $request->date_debut,
                    $request->date_fin
                ]);
            }

            $sortBy = $request->get('sort_by', 'date_heure');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            $perPage = $request->get('per_page', 50);
            $rendezVous = $query->paginate($perPage);

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

    /**
     * Créer un nouveau rendez-vous
     */
    public function store(RendezVousRequest $request)
    {
        try {
            // Vérifier disponibilité du créneau
            $existant = RendezVous::where('date_heure', $request->date_heure)
                ->whereIn('statut', ['confirme', 'en_attente'])
                ->exists();

            if ($existant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce créneau horaire est déjà réservé'
                ], 400);
            }

            $rendezVous = RendezVous::create([
                'client_id' => $request->client_id,
                'type_prestation_id' => $request->type_prestation_id,
                'user_id' => auth()->id(),
                'date_heure' => $request->date_heure,
                'duree_estimee' => $request->duree_estimee ?? 60,
                'statut' => $request->statut ?? 'en_attente',
                'notes' => $request->notes,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous créé avec succès',
                'data' => $rendezVous->load(['client', 'typePrestation'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du rendez-vous',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un rendez-vous
     */
    public function show($id)
    {
        try {
            $rendezVous = RendezVous::with(['client', 'typePrestation', 'user'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $rendezVous
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Rendez-vous non trouvé',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Mettre à jour un rendez-vous
     */
    public function update(RendezVousRequest $request, $id)
    {
        try {
            $rendezVous = RendezVous::findOrFail($id);

            // Si modification de date/heure, vérifier disponibilité
            if ($request->has('date_heure') && $request->date_heure != $rendezVous->date_heure) {
                $existant = RendezVous::where('date_heure', $request->date_heure)
                    ->where('id', '!=', $id)
                    ->whereIn('statut', ['confirme', 'en_attente'])
                    ->exists();

                if ($existant) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ce créneau horaire est déjà réservé'
                    ], 400);
                }
            }

            $rendezVous->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous mis à jour avec succès',
                'data' => $rendezVous->load(['client', 'typePrestation'])
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
     * Supprimer un rendez-vous
     */
    public function destroy($id)
    {
        try {
            $rendezVous = RendezVous::findOrFail($id);
            $rendezVous->delete();

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous supprimé avec succès'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirmer un rendez-vous
     */
    public function confirm($id)
    {
        try {
            $rendezVous = RendezVous::findOrFail($id);
            $rendezVous->update(['statut' => 'confirme']);

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous confirmé',
                'data' => $rendezVous
            ], 200);

        } catch (\Exception $e) {
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
    public function cancel($id)
    {
        try {
            $rendezVous = RendezVous::findOrFail($id);
            $rendezVous->update(['statut' => 'annule']);

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous annulé',
                'data' => $rendezVous
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'annulation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marquer comme complété
     */
    public function complete($id)
    {
        try {
            $rendezVous = RendezVous::findOrFail($id);
            $rendezVous->update(['statut' => 'complete']);

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous marqué comme complété',
                'data' => $rendezVous
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créneaux disponibles pour une date
     */
    public function availableSlots(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'duree' => 'integer|min:30|max:300'
        ]);

        try {
            $date = $request->date;
            $duree = $request->get('duree', 60);

            // Heures d'ouverture (à configurer)
            $heureDebut = 8; // 8h
            $heureFin = 19; // 19h

            // Récupérer RDV existants ce jour
            $rdvExistants = RendezVous::whereDate('date_heure', $date)
                ->whereIn('statut', ['confirme', 'en_attente'])
                ->get(['date_heure', 'duree_estimee']);

            $creneauxDisponibles = [];

            // Générer créneaux de 30min
            for ($heure = $heureDebut; $heure < $heureFin; $heure++) {
                for ($minute = 0; $minute < 60; $minute += 30) {
                    $creneau = sprintf('%02d:%02d', $heure, $minute);
                    $dateHeure = "{$date} {$creneau}:00";

                    // Vérifier si créneau libre
                    $occupe = false;
                    foreach ($rdvExistants as $rdv) {
                        $debut = strtotime($rdv->date_heure);
                        $fin = $debut + ($rdv->duree_estimee * 60);
                        $creneauTime = strtotime($dateHeure);

                        if ($creneauTime >= $debut && $creneauTime < $fin) {
                            $occupe = true;
                            break;
                        }
                    }

                    if (!$occupe) {
                        $creneauxDisponibles[] = [
                            'heure' => $creneau,
                            'datetime' => $dateHeure
                        ];
                    }
                }
            }

            return response()->json([
                'success' => true,
                'data' => $creneauxDisponibles
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des créneaux',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}