<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategorieRequest;
use App\Http\Requests\UpdateCategorieRequest;
use App\Http\Resources\CategorieResource;
use App\Http\Resources\AttributResource;
use App\Models\Categorie;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CategorieController extends Controller
{
    /**
     * Liste toutes les catégories
     */
    public function index(Request $request): JsonResponse
    {
        $query = Categorie::query();

        // Filtrer par statut actif
        if ($request->has('actives_only')) {
            $query->where('is_active', true);
        }

        // Recherche par nom
        if ($request->filled('search')) {
            $query->where('nom', 'ILIKE', '%' . $request->search . '%');
        }

        // Eager loading
        $query->withCount(['produits', 'attributs']);

        if ($request->has('with_produits')) {
            $query->with('produits');
        }

        if ($request->has('with_attributs')) {
            $query->with('attributs');
        }

        // Tri
        $query->ordered();

        $categories = $query->get();

        return response()->json([
            'success' => true,
            'data' => CategorieResource::collection($categories),
            'message' => 'Catégories récupérées avec succès',
        ]);
    }

    /**
     * Crée une nouvelle catégorie
     */
    public function store(StoreCategorieRequest $request): JsonResponse
    {
        $categorie = Categorie::create($request->validated());

        return response()->json([
            'success' => true,
            'data' => new CategorieResource($categorie),
            'message' => 'Catégorie créée avec succès',
        ], 201);
    }

    /**
     * Affiche une catégorie spécifique
     */
    public function show(Categorie $categorie): JsonResponse
    {
        $categorie->loadCount(['produits', 'attributs'])
                  ->load(['attributs', 'produits']);

        return response()->json([
            'success' => true,
            'data' => new CategorieResource($categorie),
            'message' => 'Catégorie récupérée avec succès',
        ]);
    }

    /**
     * Met à jour une catégorie
     */
    public function update(UpdateCategorieRequest $request, Categorie $categorie): JsonResponse
    {
        $categorie->update($request->validated());

        return response()->json([
            'success' => true,
            'data' => new CategorieResource($categorie->fresh()),
            'message' => 'Catégorie mise à jour avec succès',
        ]);
    }

    /**
     * Supprime une catégorie
     */
    public function destroy(Categorie $categorie): JsonResponse
    {
        // Vérifier si la catégorie a des produits
        if ($categorie->produits()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer cette catégorie car elle contient des produits',
                'produits_count' => $categorie->produits()->count(),
            ], 422);
        }

        $categorie->delete();

        return response()->json([
            'success' => true,
            'message' => 'Catégorie supprimée avec succès',
        ]);
    }

    /**
     * Récupère les attributs d'une catégorie
     */
    public function attributs(Categorie $categorie): JsonResponse
    {
        $attributs = $categorie->attributs()
                              ->orderByPivot('ordre')
                              ->get();

        return response()->json([
            'success' => true,
            'data' => AttributResource::collection($attributs),
            'message' => 'Attributs de la catégorie récupérés avec succès',
        ]);
    }

    /**
     * Associe un attribut à une catégorie
     */
    public function associerAttribut(Request $request, Categorie $categorie): JsonResponse
    {
        $request->validate([
            'attribut_id' => 'required|exists:attributs,id',
            'obligatoire' => 'boolean',
            'ordre' => 'integer|min:0',
        ]);

        // Vérifier si l'attribut n'est pas déjà associé
        if ($categorie->attributs()->where('attribut_id', $request->attribut_id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cet attribut est déjà associé à cette catégorie',
            ], 422);
        }

        $categorie->associerAttribut(
            $request->attribut_id,
            $request->boolean('obligatoire', false),
            $request->input('ordre', 0)
        );

        return response()->json([
            'success' => true,
            'message' => 'Attribut associé à la catégorie avec succès',
            'data' => new CategorieResource($categorie->load('attributs')),
        ]);
    }

    /**
     * Dissocie un attribut d'une catégorie
     */
    public function dissocierAttribut(Request $request, Categorie $categorie): JsonResponse
    {
        $request->validate([
            'attribut_id' => 'required|exists:attributs,id',
        ]);

        $categorie->dissocierAttribut($request->attribut_id);

        return response()->json([
            'success' => true,
            'message' => 'Attribut dissocié de la catégorie avec succès',
            'data' => new CategorieResource($categorie->load('attributs')),
        ]);
    }

    /**
     * Active/désactive une catégorie
     */
    public function toggleActive(Categorie $categorie): JsonResponse
    {
        $categorie->update([
            'is_active' => !$categorie->is_active
        ]);

        return response()->json([
            'success' => true,
            'data' => new CategorieResource($categorie),
            'message' => $categorie->is_active 
                ? 'Catégorie activée avec succès' 
                : 'Catégorie désactivée avec succès',
        ]);
    }
}