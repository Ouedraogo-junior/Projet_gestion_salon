<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Liste des utilisateurs avec filtres
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Filtre par rôle
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Filtre par statut actif
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Par défaut, uniquement les actifs
        if (!$request->has('is_active')) {
            $query->where('is_active', true);
        }

        // Recherche par nom/prénom/téléphone
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('prenom', 'like', "%{$search}%")
                  ->orWhere('telephone', 'like', "%{$search}%");
            });
        }

        // Ordre par défaut
        $query->orderBy('prenom')->orderBy('nom');

        $users = $query->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Détails d'un utilisateur
     */
    public function show($id)
    {
        $user = User::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Créer un utilisateur (gérant uniquement)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'telephone' => 'required|string|max:20|unique:users,telephone',
            'email' => 'nullable|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => ['required', Rule::in(['gerant', 'coiffeur', 'receptionniste'])],
            'specialite' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur créé avec succès',
            'data' => $user
        ], 201);
    }

    /**
     * Mettre à jour un utilisateur (gérant uniquement)
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|required|string|max:100',
            'prenom' => 'sometimes|required|string|max:100',
            'telephone' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('users', 'telephone')->ignore($user->id)
            ],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id)
            ],
            'role' => ['sometimes', 'required', Rule::in(['gerant', 'coiffeur', 'receptionniste'])],
            'specialite' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur mis à jour avec succès',
            'data' => $user
        ]);
    }

    /**
     * Réinitialiser le mot de passe (gérant uniquement)
     */
    public function resetPassword(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::findOrFail($id);
        $user->update([
            'password' => $request->password
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe réinitialisé avec succès'
        ]);
    }

    /**
     * Changer son propre mot de passe
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Mot de passe actuel incorrect'
            ], 422);
        }

        $user->update([
            'password' => $request->password
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe changé avec succès'
        ]);
    }

    /**
     * Supprimer un utilisateur - soft delete (gérant uniquement)
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Empêcher la suppression de soi-même
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez pas supprimer votre propre compte'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    }

    /**
     * Activer/Désactiver un utilisateur (gérant uniquement)
     */
    public function toggleActive($id)
    {
        $user = User::findOrFail($id);

        // Empêcher la désactivation de soi-même
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez pas désactiver votre propre compte'
            ], 403);
        }

        $user->update([
            'is_active' => !$user->is_active
        ]);

        return response()->json([
            'success' => true,
            'message' => $user->is_active ? 'Utilisateur activé' : 'Utilisateur désactivé',
            'data' => $user
        ]);
    }
}