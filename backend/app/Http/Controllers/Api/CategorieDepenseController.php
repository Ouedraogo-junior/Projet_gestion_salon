<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CategorieDepense;

class CategorieDepenseController extends Controller
{
    public function index()
    {
        return response()->json(
            CategorieDepense::active()->ordered()->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'     => 'required|string|max:100|unique:categories_depenses,nom',
            'couleur' => 'nullable|string|max:20',
            'icone'   => 'nullable|string|max:50',
            'ordre'   => 'nullable|integer',
        ]);

        $categorie = CategorieDepense::create($validated);

        return response()->json($categorie, 201);
    }

    public function update(Request $request, CategorieDepense $categorieDepense)
    {
        $validated = $request->validate([
            'nom'       => "required|string|max:100|unique:categories_depenses,nom,{$categorieDepense->id}",
            'couleur'   => 'nullable|string|max:20',
            'icone'     => 'nullable|string|max:50',
            'ordre'     => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $categorieDepense->update($validated);

        return response()->json($categorieDepense);
    }

    public function destroy(CategorieDepense $categorieDepense)
    {
        $count = $categorieDepense->depenses()->count();

        if ($count > 0) {
            return response()->json([
                'message' => "Impossible : {$count} dépense(s) utilisent cette catégorie."
            ], 422);
        }

        $categorieDepense->delete();

        return response()->json(null, 204);
    }
}