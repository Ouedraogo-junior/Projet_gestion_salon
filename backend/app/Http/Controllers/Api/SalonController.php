<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Salon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class SalonController extends Controller
{
    /**
     * Récupérer les informations du salon
     */
    public function show()
    {
        $salon = Salon::first();

        if (!$salon) {
            return response()->json([
                'success' => false,
                'message' => 'Aucune information de salon trouvée'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $salon
        ]);
    }

    /**
     * Mettre à jour les informations du salon (gérant uniquement)
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:100',
            'adresse' => 'required|string|max:255',
            'telephone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'horaires' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $salon = Salon::first();

        if (!$salon) {
            // Créer si n'existe pas
            $salon = Salon::create($validator->validated());
        } else {
            $salon->update($validator->validated());
        }

        return response()->json([
            'success' => true,
            'message' => 'Informations du salon mises à jour avec succès',
            'data' => $salon
        ]);
    }

    /**
     * Upload du logo du salon (gérant uniquement)
     */
    public function uploadLogo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $salon = Salon::first();

        if (!$salon) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun salon trouvé'
            ], 404);
        }

        // Supprimer l'ancien logo si existe
        if ($salon->logo_url && Storage::disk('public')->exists($salon->logo_url)) {
            Storage::disk('public')->delete($salon->logo_url);
        }

        // Uploader le nouveau logo
        $path = $request->file('logo')->store('logos', 'public');

        $salon->update(['logo_url' => $path]);

        return response()->json([
            'success' => true,
            'message' => 'Logo uploadé avec succès',
            'data' => [
                'logo_url' => $path,
                'logo_full_url' => Storage::url($path)
            ]
        ]);
    }

    /**
     * Supprimer le logo du salon (gérant uniquement)
     */
    public function deleteLogo()
    {
        $salon = Salon::first();

        if (!$salon) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun salon trouvé'
            ], 404);
        }

        if ($salon->logo_url && Storage::disk('public')->exists($salon->logo_url)) {
            Storage::disk('public')->delete($salon->logo_url);
        }

        $salon->update(['logo_url' => null]);

        return response()->json([
            'success' => true,
            'message' => 'Logo supprimé avec succès'
        ]);
    }
}