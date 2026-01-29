<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TypePrestation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class TypePrestationController extends Controller
{
    /**
     * Liste des types de prestations
     */
    public function index(Request $request)
    {
        try {
            $query = TypePrestation::query();

            // Filtre par statut actif
            if ($request->has('actif')) {
                $query->where('actif', $request->boolean('actif'));
            }

            // Recherche par nom
            if ($request->has('search')) {
                $query->where('nom', 'LIKE', "%{$request->search}%");
            }

            // Tri
            $sortBy = $request->get('sort_by', 'ordre');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination ou tout
            if ($request->boolean('all')) {
                $prestations = $query->get();
            } else {
                $perPage = $request->get('per_page', 20);
                $prestations = $query->paginate($perPage);
            }

            return response()->json([
                'success' => true,
                'data' => $prestations
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des prestations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un type de prestation
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255|unique:types_prestations,nom',
            'description' => 'nullable|string',
            'duree_estimee_minutes' => 'nullable|integer|min:1|max:1440',
            'prix_base' => 'required|numeric|min:0',
            'actif' => 'boolean',
            'ordre' => 'nullable|integer|min:0',
        ], [
            'nom.required' => 'Le nom de la prestation est obligatoire',
            'nom.unique' => 'Cette prestation existe déjà',
            'prix_base.required' => 'Le prix de base est obligatoire',
            'prix_base.min' => 'Le prix ne peut pas être négatif',
            'duree_estimee_minutes.max' => 'La durée ne peut pas dépasser 24 heures',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Calculer l'ordre automatiquement si non fourni
            $ordre = $request->ordre ?? TypePrestation::max('ordre') + 1;

            $prestation = TypePrestation::create([
                'nom' => $request->nom,
                'description' => $request->description,
                'duree_estimee_minutes' => $request->duree_estimee_minutes,
                'prix_base' => $request->prix_base,
                'actif' => $request->actif ?? true,
                'ordre' => $ordre,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Prestation créée avec succès',
                'data' => $prestation
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un type de prestation
     */
    public function show($id)
    {
        try {
            $prestation = TypePrestation::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $prestation
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Prestation non trouvée',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Mettre à jour un type de prestation
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255|unique:types_prestations,nom,' . $id,
            'description' => 'nullable|string',
            'duree_estimee_minutes' => 'nullable|integer|min:1|max:1440',
            'prix_base' => 'required|numeric|min:0',
            'actif' => 'boolean',
            'ordre' => 'nullable|integer|min:0',
        ], [
            'nom.required' => 'Le nom de la prestation est obligatoire',
            'nom.unique' => 'Cette prestation existe déjà',
            'prix_base.required' => 'Le prix de base est obligatoire',
            'prix_base.min' => 'Le prix ne peut pas être négatif',
            'duree_estimee_minutes.max' => 'La durée ne peut pas dépasser 24 heures',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $prestation = TypePrestation::findOrFail($id);

            $prestation->update([
                'nom' => $request->nom,
                'description' => $request->description,
                'duree_estimee_minutes' => $request->duree_estimee_minutes,
                'prix_base' => $request->prix_base,
                'actif' => $request->actif ?? $prestation->actif,
                'ordre' => $request->ordre ?? $prestation->ordre,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Prestation mise à jour avec succès',
                'data' => $prestation->fresh()
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
     * Supprimer un type de prestation
     */
    public function destroy($id)
    {
        try {
            $prestation = TypePrestation::findOrFail($id);

            // Vérifier si utilisé dans des ventes
            $utiliseDansVentes = DB::table('ventes_details')
                ->where('prestation_id', $id)
                ->exists();

            if ($utiliseDansVentes) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de supprimer : cette prestation est utilisée dans des ventes'
                ], 400);
            }

            $prestation->delete();

            return response()->json([
                'success' => true,
                'message' => 'Prestation supprimée avec succès'
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
     * Activer/Désactiver une prestation
     */
    public function toggleActif($id)
    {
        try {
            $prestation = TypePrestation::findOrFail($id);
            $prestation->update(['actif' => !$prestation->actif]);

            return response()->json([
                'success' => true,
                'message' => $prestation->actif ? 'Prestation activée' : 'Prestation désactivée',
                'data' => $prestation
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'opération',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Réorganiser l'ordre des prestations
     */
    public function reorder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ordres' => 'required|array',
            'ordres.*.id' => 'required|exists:types_prestations,id',
            'ordres.*.ordre' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            foreach ($request->ordres as $item) {
                TypePrestation::where('id', $item['id'])
                    ->update(['ordre' => $item['ordre']]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Ordre mis à jour avec succès'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la réorganisation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Statistiques des prestations
     */
    public function stats(Request $request)
    {
        try {
            $dateDebut = $request->get('date_debut', now()->startOfMonth());
            $dateFin = $request->get('date_fin', now()->endOfMonth());

            $stats = TypePrestation::withCount(['venteDetails' => function($query) use ($dateDebut, $dateFin) {
                $query->whereHas('vente', function($q) use ($dateDebut, $dateFin) {
                    $q->whereBetween('date_vente', [$dateDebut, $dateFin])
                      ->where('statut_paiement', '!=', 'annulee');
                });
            }])
            ->withSum(['venteDetails as montant_total' => function($query) use ($dateDebut, $dateFin) {
                $query->whereHas('vente', function($q) use ($dateDebut, $dateFin) {
                    $q->whereBetween('date_vente', [$dateDebut, $dateFin])
                      ->where('statut_paiement', '!=', 'annulee');
                });
            }], 'prix_total')
            ->get()
            ->map(function($prestation) {
                return [
                    'id' => $prestation->id,
                    'nom' => $prestation->nom,
                    'nombre_ventes' => $prestation->vente_details_count ?? 0,
                    'montant_total' => $prestation->montant_total ?? 0,
                ];
            });

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

    public function indexPublic()
    {
        $prestations = TypePrestation::where('actif', true)
            ->orderBy('ordre')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $prestations
        ]);
    }

}