<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Depense;

class DepenseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Depense::with('user')->orderBy('date_depense', 'desc');

        if ($request->has('mois') && $request->has('annee')) {
            $query->whereMonth('date_depense', $request->mois)
                  ->whereYear('date_depense', $request->annee);
        }

        if ($request->has('categorie')) {
            $query->where('categorie', $request->categorie);
        }

        return $query->paginate(15);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'libelle' => 'required|string|max:255',
            'montant' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'categorie' => 'required|string',
            'date_depense' => 'required|date'
        ]);

        $validated['user_id'] = auth()->id();

        $depense = Depense::create($validated);
        
        return response()->json($depense->load('user'), 201);
    }

    public function show(Depense $depense)
    {
        return $depense->load('user');
    }

    public function update(Request $request, Depense $depense)
    {
        $validated = $request->validate([
            'libelle' => 'sometimes|string|max:255',
            'montant' => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
            'categorie' => 'sometimes|string',
            'date_depense' => 'sometimes|date'
        ]);

        $depense->update($validated);
        
        return response()->json($depense->load('user'));
    }

    public function destroy(Depense $depense)
    {
        $depense->delete();
        return response()->json(null, 204);
    }

    public function totalMois(Request $request)
    {
        $mois = $request->input('mois', now()->month);
        $annee = $request->input('annee', now()->year);

        $total = Depense::whereMonth('date_depense', $mois)
                        ->whereYear('date_depense', $annee)
                        ->sum('montant');

        return response()->json(['total' => $total]);
    }

    public function parCategorie(Request $request)
    {
        $mois = $request->input('mois', now()->month);
        $annee = $request->input('annee', now()->year);

        $stats = Depense::whereMonth('date_depense', $mois)
                        ->whereYear('date_depense', $annee)
                        ->selectRaw('categorie, SUM(montant) as total')
                        ->groupBy('categorie')
                        ->get();

        return response()->json($stats);
    }
}
