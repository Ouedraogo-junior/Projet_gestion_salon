<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

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
            'role' => ['required', Rule::in(['gerant', 'coiffeur', 'gestionnaire'])],
            'specialite' => 'nullable|string|max:100',
            'salaire_mensuel' => 'nullable|numeric|min:0|max:99999999.99',
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
            'salaire_mensuel' => 'nullable|numeric|min:0|max:99999999.99',
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
        ], [
            'current_password.required' => 'Le mot de passe actuel est obligatoire.',
            'password.required' => 'Le nouveau mot de passe est obligatoire.',
            'password.min' => 'Le mot de passe doit contenir au moins 6 caractères.',
            'password.confirmed' => 'Les mots de passe ne correspondent pas.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Le mot de passe actuel est incorrect'
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->password)
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

    /**
     * Mettre à jour le salaire d'un utilisateur (gérant uniquement)
     */
    public function updateSalaire(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'salaire_mensuel' => 'required|numeric|min:0|max:99999999.99',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::findOrFail($id);
            
            $user->salaire_mensuel = $request->salaire_mensuel;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Salaire mis à jour avec succès',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du salaire: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer tous les salaires pour la comptabilité (gérant uniquement)
     */
    public function getSalaires()
    {
        try {
            $users = User::where('is_active', true)
                ->whereNotNull('salaire_mensuel')
                ->select('id', 'nom', 'prenom', 'role', 'salaire_mensuel')
                ->orderBy('nom')
                ->get();

            $totalSalaires = $users->sum('salaire_mensuel');
            $totalAnnuel = $totalSalaires * 12;

            return response()->json([
                'success' => true,
                'data' => [
                    'employes' => $users,
                    'total_mensuel' => $totalSalaires,
                    'total_annuel' => $totalAnnuel,
                    'nombre_employes' => $users->count()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des salaires: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les coiffeurs/employés (pour les ventes)
     */
    public function getCoiffeurs()
    {
        try {
            $coiffeurs = User::where('is_active', true)
                ->whereIn('role', ['coiffeur', 'gerant'])
                ->select('id', 'nom', 'prenom', 'telephone', 'email', 'role', 'specialite', 'photo_url')
                ->orderBy('prenom')
                ->orderBy('nom')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $coiffeurs
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des coiffeurs: ' . $e->getMessage()
            ], 500);
        }
    }


    /**
     * Mettre à jour son propre profil
     */
    public function updateProfil(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|string|max:100',
            'prenom' => 'sometimes|string|max:100',
            'telephone' => [
                'sometimes',
                'string',
                'max:20',
                Rule::unique('users')->ignore($user->id)
            ],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id)
            ],
            'specialite' => 'nullable|string|max:100',
        ], [
            'nom.max' => 'Le nom ne peut pas dépasser 100 caractères.',
            'prenom.max' => 'Le prénom ne peut pas dépasser 100 caractères.',
            'telephone.unique' => 'Ce numéro de téléphone est déjà utilisé.',
            'email.email' => 'L\'email doit être valide.',
            'email.unique' => 'Cet email est déjà utilisé.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user->update($request->only(['nom', 'prenom', 'telephone', 'email', 'specialite']));

            return response()->json([
                'success' => true,
                'data' => $user->fresh(),
                'message' => 'Profil mis à jour avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour : ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Uploader sa photo de profil
     */
    public function uploadPhoto(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'photo' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // 5MB max
        ], [
            'photo.required' => 'Veuillez sélectionner une photo.',
            'photo.image' => 'Le fichier doit être une image.',
            'photo.mimes' => 'Format accepté : jpeg, png, jpg, webp.',
            'photo.max' => 'L\'image ne doit pas dépasser 5 MB.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            // Supprimer l'ancienne photo si elle existe
            if ($user->photo_url && Storage::disk('public')->exists($user->photo_url)) {
                Storage::disk('public')->delete($user->photo_url);
            }

            $file = $request->file('photo');
            
            // Nom de fichier sécurisé
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $safeName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $originalName);
            $filename = 'user_' . $user->id . '_' . time() . '_' . $safeName . '.' . $extension;
            
            // Stocker dans public/storage/photos/users
            $path = $file->storeAs('photos/users', $filename, 'public');

            // Mettre à jour l'utilisateur
            $user->update(['photo_url' => $path]);

            return response()->json([
                'success' => true,
                'message' => 'Photo de profil mise à jour avec succès',
                'data' => $user->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload : ' . $e->getMessage()
            ], 500);
        }
    }


    /**
     * Supprimer sa photo de profil
     */
    public function deletePhoto(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->photo_url) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucune photo à supprimer'
                ], 404);
            }

            // Supprimer le fichier physique
            if (Storage::disk('public')->exists($user->photo_url)) {
                Storage::disk('public')->delete($user->photo_url);
            }
            
            // Mettre à jour l'utilisateur
            $user->update(['photo_url' => null]);

            return response()->json([
                'success' => true,
                'message' => 'Photo de profil supprimée avec succès',
                'data' => $user->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression : ' . $e->getMessage()
            ], 500);
        }
    }

}