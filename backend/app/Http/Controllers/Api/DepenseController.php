<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Depense;
use App\Models\CategorieDepense;

class DepenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Depense::with(['user', 'categorieDepense'])->orderBy('date_depense', 'desc');

        if ($request->has('mois') && $request->has('annee')) {
            $query->whereMonth('date_depense', $request->mois)
                  ->whereYear('date_depense', $request->annee);
        }

        if ($request->has('categorie_depense_id')) {
            $query->where('categorie_depense_id', $request->categorie_depense_id);
        }

        return $query->paginate(15);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'libelle'              => 'required|string|max:255',
            'montant'              => 'required|numeric|min:0',
            'description'          => 'nullable|string',
            'categorie_depense_id' => 'required|exists:categories_depenses,id',
            'date_depense'         => 'required|date',
        ]);

        $validated['user_id'] = auth()->id();

        $depense = Depense::create($validated);

        return response()->json($depense->load(['user', 'categorieDepense']), 201);
    }

    public function show(Depense $depense)
    {
        return $depense->load(['user', 'categorieDepense']);
    }

    public function update(Request $request, Depense $depense)
    {
        $validated = $request->validate([
            'libelle'              => 'sometimes|string|max:255',
            'montant'              => 'sometimes|numeric|min:0',
            'description'          => 'nullable|string',
            'categorie_depense_id' => 'sometimes|exists:categories_depenses,id',
            'date_depense'         => 'sometimes|date',
        ]);

        $depense->update($validated);

        return response()->json($depense->load(['user', 'categorieDepense']));
    }

    public function destroy(Depense $depense)
    {
        $depense->delete();

        return response()->json(null, 204);
    }

    public function totalMois(Request $request)
    {
        $mois  = $request->input('mois', now()->month);
        $annee = $request->input('annee', now()->year);

        $total = Depense::whereMonth('date_depense', $mois)
                        ->whereYear('date_depense', $annee)
                        ->sum('montant');

        return response()->json(['total' => $total]);
    }

    public function parCategorie(Request $request)
    {
        $mois  = $request->input('mois', now()->month);
        $annee = $request->input('annee', now()->year);

        $stats = Depense::whereMonth('date_depense', $mois)
                        ->whereYear('date_depense', $annee)
                        ->with('categorieDepense:id,nom,couleur,icone')
                        ->selectRaw('categorie_depense_id, SUM(montant) as total')
                        ->groupBy('categorie_depense_id')
                        ->get()
                        ->map(fn($d) => [
                            'categorie'  => $d->categorieDepense,
                            'total'      => $d->total,
                        ]);

        return response()->json($stats);
    }
}