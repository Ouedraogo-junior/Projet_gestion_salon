<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pointage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PointageController extends Controller
{
    /**
     * Liste des pointages avec filtres
     */
    public function index(Request $request)
    {
        $query = Pointage::with(['user', 'pointeur']);

        // Filtre par employé
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filtre par date
        if ($request->has('date')) {
            $query->whereDate('date_pointage', $request->date);
        }

        // Filtre par période
        if ($request->has('date_debut') && $request->has('date_fin')) {
            $query->whereBetween('date_pointage', [
                $request->date_debut,
                $request->date_fin
            ]);
        }

        // Filtre par mois
        if ($request->has('mois') && $request->has('annee')) {
            $query->whereMonth('date_pointage', $request->mois)
                  ->whereYear('date_pointage', $request->annee);
        }

        // Filtre par statut
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        // Pointages du jour
        if ($request->boolean('aujourdhui')) {
            $query->whereDate('date_pointage', today());
        }

        // Ordre
        $query->orderBy('date_pointage', 'desc')
              ->orderBy('heure_arrivee', 'desc');

        $pointages = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $pointages
        ]);
    }

    /**
     * Enregistrer un pointage (arrivée)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'date_pointage' => 'nullable|date',
            'heure_arrivee' => 'nullable|date_format:H:i',
            'statut' => 'nullable|in:present,retard,absent,conge',
            'commentaire' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], 422);
        }

        $date = $request->date_pointage ?? today()->toDateString();
        $heure = $request->heure_arrivee ?? now()->format('H:i');

        // Vérifier si déjà pointé ce jour
        $dejaPointe = Pointage::where('user_id', $request->user_id)
            ->whereDate('date_pointage', $date)
            ->exists();

        if ($dejaPointe) {
            return response()->json([
                'success' => false,
                'message' => 'Cet employé a déjà pointé aujourd\'hui'
            ], 409);
        }

        DB::beginTransaction();
        try {
            // Déterminer le statut automatiquement si non fourni
            $statut = $request->statut ?? Pointage::determinerStatut($heure);

            $pointage = Pointage::create([
                'user_id' => $request->user_id,
                'pointeur_id' => auth()->id(),
                'date_pointage' => $date,
                'heure_arrivee' => $heure,
                'statut' => $statut,
                'type_pointage' => 'manuel',
                'commentaire' => $request->commentaire,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pointage enregistré avec succès',
                'data' => $pointage->load(['user', 'pointeur'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'enregistrement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Modifier un pointage
     */
    public function update(Request $request, $id)
    {
        $pointage = Pointage::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'heure_arrivee' => 'nullable|date_format:H:i',
            'heure_depart' => 'nullable|date_format:H:i',
            'statut' => 'nullable|in:present,retard,absent,conge',
            'commentaire' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $data = $request->only(['heure_arrivee', 'heure_depart', 'statut', 'commentaire']);

            // Recalculer minutes si heure_arrivee ou heure_depart modifiés
            if (isset($data['heure_arrivee']) || isset($data['heure_depart'])) {
                $arrivee = $data['heure_arrivee'] ?? $pointage->heure_arrivee;
                $depart = $data['heure_depart'] ?? $pointage->heure_depart;

                if ($arrivee && $depart) {
                    $minutes = Carbon::parse($arrivee)->diffInMinutes(Carbon::parse($depart));
                    $data['minutes_travailles'] = $minutes;
                }
            }

            $pointage->update($data);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pointage modifié avec succès',
                'data' => $pointage->fresh(['user', 'pointeur'])
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
     * Enregistrer l'heure de départ
     */
    public function marquerDepart(Request $request, $id)
    {
        $pointage = Pointage::findOrFail($id);

        if ($pointage->heure_depart) {
            return response()->json([
                'success' => false,
                'message' => 'Le départ a déjà été enregistré'
            ], 409);
        }

        $validator = Validator::make($request->all(), [
            'heure_depart' => 'nullable|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $heureDepart = $request->heure_depart ?? now()->format('H:i');
        $pointage->enregistrerDepart($heureDepart);

        return response()->json([
            'success' => true,
            'message' => 'Départ enregistré avec succès',
            'data' => $pointage->fresh(['user', 'pointeur'])
        ]);
    }

    /**
     * Supprimer un pointage
     */
    public function destroy($id)
    {
        $pointage = Pointage::findOrFail($id);
        $pointage->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pointage supprimé avec succès'
        ]);
    }

    /**
     * Statistiques des pointages
     */
    public function stats(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'user_id' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Pointage::query()
            ->whereBetween('date_pointage', [$request->date_debut, $request->date_fin]);

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $pointages = $query->get();

        $stats = [
            'total_jours' => $pointages->count(),
            'presents' => $pointages->where('statut', 'present')->count(),
            'retards' => $pointages->where('statut', 'retard')->count(),
            'absents' => $pointages->where('statut', 'absent')->count(),
            'conges' => $pointages->where('statut', 'conge')->count(),
            'total_minutes' => $pointages->sum('minutes_travailles'),
            'total_heures' => round($pointages->sum('minutes_travailles') / 60, 2),
        ];

        // Stats par employé si non filtré
        if (!$request->has('user_id')) {
            $statsParEmploye = Pointage::with('user')
                ->whereBetween('date_pointage', [$request->date_debut, $request->date_fin])
                ->get()
                ->groupBy('user_id')
                ->map(function ($pointagesUser) {
                    return [
                        'user' => $pointagesUser->first()->user,
                        'total_jours' => $pointagesUser->count(),
                        'presents' => $pointagesUser->where('statut', 'present')->count(),
                        'retards' => $pointagesUser->where('statut', 'retard')->count(),
                        'absents' => $pointagesUser->where('statut', 'absent')->count(),
                        'conges' => $pointagesUser->where('statut', 'conge')->count(),
                        'total_heures' => round($pointagesUser->sum('minutes_travailles') / 60, 2),
                    ];
                })->values();

            $stats['par_employe'] = $statsParEmploye;
        }

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Liste des employés avec leur pointage du jour
     */
    public function employeesAujourdhui()
    {
        $employees = User::where('role', '!=', 'gerant')
            ->where('is_active', true)
            ->get()
            ->map(function ($user) {
                $pointage = $user->getPointageAujourdhui();
                
                return [
                    'id' => $user->id,
                    'nom_complet' => $user->nom_complet,
                    'role' => $user->role,
                    'a_pointe' => $pointage !== null,
                    'pointage' => $pointage,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $employees
        ]);
    }
}