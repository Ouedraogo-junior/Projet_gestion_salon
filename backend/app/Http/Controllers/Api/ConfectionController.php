<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreConfectionRequest;
use App\Models\Confection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ConfectionController extends Controller
{
    /**
     * Liste des confections avec filtres
     */
    public function index(Request $request)
    {
        try {
            $query = Confection::with(['user', 'categorie', 'produit']);

            // Filtres
            if ($request->filled('statut')) {
                $query->where('statut', $request->statut);
            }

            if ($request->filled('destination')) {
                $query->where('destination', $request->destination);
            }

            if ($request->filled('user_id')) {
                $query->pourUser($request->user_id);
            }

            if ($request->filled('date_debut') && $request->filled('date_fin')) {
                $query->periode($request->date_debut, $request->date_fin);
            }

            if ($request->filled('search')) {
                $query->where(function($q) use ($request) {
                    $q->where('numero_confection', 'like', "%{$request->search}%")
                      ->orWhere('nom_produit', 'like', "%{$request->search}%");
                });
            }

            // Tri
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $confections = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $confections
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des confections',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher une confection spécifique
     */
    public function show($id)
    {
        try {
            $confection = Confection::with([
                'user',
                'categorie',
                'produit',
                'details.produit',
                'attributs.attribut',
                'mouvements'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $confection
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Confection introuvable',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Créer une nouvelle confection
     */
    public function store(StoreConfectionRequest $request)
    {
        DB::beginTransaction();
        try {
            // Créer la confection
            $confection = Confection::create([
                'user_id' => $request->user_id,
                'categorie_id' => $request->categorie_id,
                'nom_produit' => $request->nom_produit,
                'quantite_produite' => $request->quantite_produite,
                'destination' => $request->destination,
                'description' => $request->description,
                'date_confection' => $request->date_confection,
                'cout_main_oeuvre' => $request->cout_main_oeuvre ?? 0,
                'prix_vente_unitaire' => $request->prix_vente_unitaire,
                'statut' => 'en_cours',
            ]);

            // Ajouter les détails (matières premières)
            foreach ($request->details as $detail) {
                $prixTotal = $detail['quantite_utilisee'] * $detail['prix_unitaire'];
                
                $confection->details()->create([
                    'produit_id' => $detail['produit_id'],
                    'quantite_utilisee' => $detail['quantite_utilisee'],
                    'prix_unitaire' => $detail['prix_unitaire'],
                    'prix_total' => $prixTotal,
                ]);
            }

            // Ajouter les attributs si présents
            if ($request->has('attributs')) {
                foreach ($request->attributs as $attribut) {
                    $confection->attributs()->create([
                        'attribut_id' => $attribut['attribut_id'],
                        'valeur' => $attribut['valeur'],
                    ]);
                }
            }

            // Calculer et mettre à jour les coûts
            $confection->update([
                'cout_matiere_premiere' => $confection->details()->sum('prix_total'),
                'cout_total' => $confection->calculerCoutTotal(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Confection créée avec succès',
                'data' => $confection->load(['details.produit', 'attributs'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la confection',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour une confection (uniquement si en_cours)
     */
    public function update(Request $request, $id)
    {
        try {
            $confection = Confection::findOrFail($id);

            if (!$confection->isEnCours()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seules les confections en cours peuvent être modifiées'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'nom_produit' => 'sometimes|string|max:255',
                'quantite_produite' => 'sometimes|integer|min:1',
                'destination' => 'sometimes|in:vente,utilisation,mixte',
                'description' => 'nullable|string',
                'cout_main_oeuvre' => 'nullable|numeric|min:0',
                'prix_vente_unitaire' => 'nullable|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            $confection->update($request->only([
                'nom_produit',
                'quantite_produite',
                'destination',
                'description',
                'cout_main_oeuvre',
                'prix_vente_unitaire',
            ]));

            // Recalculer les coûts
            $confection->update([
                'cout_total' => $confection->calculerCoutTotal(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Confection mise à jour avec succès',
                'data' => $confection
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Terminer une confection
     */
    public function terminer($id)
    {
        try {
            $confection = Confection::findOrFail($id);

            if (!$confection->isEnCours()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette confection n\'est pas en cours'
                ], 403);
            }

            $success = $confection->terminer();

            if ($success) {
                return response()->json([
                    'success' => true,
                    'message' => 'Confection terminée avec succès',
                    'data' => $confection->load('produit')
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la finalisation de la confection'
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la finalisation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Annuler une confection
     */
    public function annuler(Request $request, $id)
    {
        try {
            $confection = Confection::findOrFail($id);

            if (!$confection->isEnCours()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seules les confections en cours peuvent être annulées'
                ], 403);
            }

            $motif = $request->input('motif', 'Annulation manuelle');
            $success = $confection->annuler($motif);

            if ($success) {
                return response()->json([
                    'success' => true,
                    'message' => 'Confection annulée avec succès',
                    'data' => $confection
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'annulation'
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'annulation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer une confection (soft delete ou hard selon le statut)
     */
    public function destroy($id)
    {
        try {
            $confection = Confection::findOrFail($id);

            if ($confection->isTerminee()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Les confections terminées ne peuvent pas être supprimées'
                ], 403);
            }

            $confection->delete();

            return response()->json([
                'success' => true,
                'message' => 'Confection supprimée avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Statistiques des confections
     */
    public function statistiques(Request $request)
    {
        try {
            $dateDebut = $request->get('date_debut', now()->startOfMonth());
            $dateFin = $request->get('date_fin', now()->endOfMonth());

            $stats = [
                'total_confections' => Confection::periode($dateDebut, $dateFin)->count(),
                'en_cours' => Confection::periode($dateDebut, $dateFin)->enCours()->count(),
                'terminees' => Confection::periode($dateDebut, $dateFin)->terminees()->count(),
                'annulees' => Confection::periode($dateDebut, $dateFin)->annulees()->count(),
                
                'par_destination' => [
                    'vente' => Confection::periode($dateDebut, $dateFin)->terminees()->pourDestination('vente')->count(),
                    'utilisation' => Confection::periode($dateDebut, $dateFin)->terminees()->pourDestination('utilisation')->count(),
                    'mixte' => Confection::periode($dateDebut, $dateFin)->terminees()->pourDestination('mixte')->count(),
                ],
                
                'quantite_totale_produite' => Confection::periode($dateDebut, $dateFin)
                    ->terminees()
                    ->sum('quantite_produite'),
                
                'cout_total' => Confection::periode($dateDebut, $dateFin)
                    ->terminees()
                    ->sum('cout_total'),
                
                'valeur_potentielle' => DB::table('confections')
                    ->whereBetween('date_confection', [$dateDebut, $dateFin])
                    ->where('statut', 'terminee')
                    ->selectRaw('SUM(quantite_produite * prix_vente_unitaire) as total')
                    ->value('total') ?? 0,
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du calcul des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}