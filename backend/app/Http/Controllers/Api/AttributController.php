<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAttributRequest;
use App\Http\Requests\UpdateAttributRequest;
use App\Http\Resources\AttributResource;
use App\Models\Attribut;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;


class AttributController extends Controller
{
    /**
     * Liste tous les attributs
     */
    public function index(Request $request): JsonResponse
    {
        $query = Attribut::query();

        // Recherche par nom
        if ($request->filled('search')) {
            $query->where('nom', 'ILIKE', '%' . $request->search . '%');
        }

        // Filtrer par type de valeur
        if ($request->filled('type_valeur')) {
            $query->where('type_valeur', $request->type_valeur);
        }

        // Filtrer par obligatoire
        if ($request->has('obligatoires_only')) {
            $query->obligatoires();
        }

        // Eager loading
        if ($request->has('with_categories')) {
            $query->with('categories');
        }

        $query->withCount('categories');

        // Tri
        $query->ordonnes();

        $attributs = $query->get();

        return response()->json([
            'success' => true,
            'data' => AttributResource::collection($attributs),
            'message' => 'Attributs récupérés avec succès',
        ]);
    }

    /**
     * Crée un nouvel attribut
     */
    public function store(StoreAttributRequest $request): JsonResponse
    {
        $attribut = Attribut::create($request->validated());

        return response()->json([
            'success' => true,
            'data' => new AttributResource($attribut),
            'message' => 'Attribut créé avec succès',
        ], 201);
    }

    /**
     * Affiche un attribut spécifique
     */
    public function show(Attribut $attribut): JsonResponse
    {
        $attribut->loadCount('categories')
                 ->load('categories');

        return response()->json([
            'success' => true,
            'data' => new AttributResource($attribut),
            'message' => 'Attribut récupéré avec succès',
        ]);
    }

    /**
     * Met à jour un attribut
     */
    public function update(UpdateAttributRequest $request, Attribut $attribut): JsonResponse
    {
        $attribut->update($request->validated());

        return response()->json([
            'success' => true,
            'data' => new AttributResource($attribut->fresh()),
            'message' => 'Attribut mis à jour avec succès',
        ]);
    }

    /**
     * Supprime un attribut
     */
    public function destroy(Attribut $attribut): JsonResponse
    {
        // Vérifier si l'attribut est utilisé par des produits
        $produitsCount = DB::table('produit_attribut_valeurs')
            ->where('attribut_id', $attribut->id)
            ->count();

        if ($produitsCount > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer cet attribut car il est utilisé par des produits',
                'produits_count' => $produitsCount,
            ], 422);
        }

        // Dissocier des catégories
        $attribut->categories()->detach();

        // Supprimer
        $attribut->delete();

        return response()->json([
            'success' => true,
            'message' => 'Attribut supprimé avec succès',
        ]);
    }

    /**
     * Ajoute une valeur possible (pour type liste)
     */
    public function ajouterValeurPossible(Request $request, Attribut $attribut): JsonResponse
    {
        $request->validate([
            'valeur' => 'required|string|max:100',
        ]);

        if ($attribut->type_valeur !== 'liste') {
            return response()->json([
                'success' => false,
                'message' => 'Cette action est réservée aux attributs de type liste',
            ], 422);
        }

        $success = $attribut->ajouterValeurPossible($request->valeur);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Cette valeur existe déjà',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => new AttributResource($attribut->fresh()),
            'message' => 'Valeur ajoutée avec succès',
        ]);
    }

    /**
     * Supprime une valeur possible
     */
    public function supprimerValeurPossible(Request $request, Attribut $attribut): JsonResponse
    {
        $request->validate([
            'valeur' => 'required|string',
        ]);

        if ($attribut->type_valeur !== 'liste') {
            return response()->json([
                'success' => false,
                'message' => 'Cette action est réservée aux attributs de type liste',
            ], 422);
        }

        $success = $attribut->supprimerValeurPossible($request->valeur);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Valeur introuvable',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => new AttributResource($attribut->fresh()),
            'message' => 'Valeur supprimée avec succès',
        ]);
    }
}