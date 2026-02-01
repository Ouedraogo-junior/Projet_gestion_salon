<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\PhotoClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ClientController extends Controller
{
    /**
     * Liste des clients avec recherche et pagination
     */
    /**
 * Liste des clients avec recherche et pagination
 */
public function index(Request $request)
{
    try {
        $query = Client::with('photos'); // ← AJOUTER with('photos') ICI

        // Recherche par nom, prénom, téléphone ou email
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nom', 'LIKE', "%{$search}%")
                  ->orWhere('prenom', 'LIKE', "%{$search}%")
                  ->orWhere('telephone', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        // Filtre par statut actif
        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->is_active);
        }

        // Filtre par points de fidélité minimum
        if ($request->has('min_points') && $request->min_points !== '') {
            $query->where('points_fidelite', '>=', $request->min_points);
        }

        // Filtre par date de dernière visite
        if ($request->has('date_debut') && !empty($request->date_debut)) {
            $query->whereDate('date_derniere_visite', '>=', $request->date_debut);
        }

        if ($request->has('date_fin') && !empty($request->date_fin)) {
            $query->whereDate('date_derniere_visite', '<=', $request->date_fin);
        }

        // Tri
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        // Validation du champ de tri
        $allowedSorts = ['nom', 'prenom', 'created_at', 'date_derniere_visite', 'points_fidelite', 'montant_total_depense'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $clients = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $clients
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération des clients',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Créer un nouveau client
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'telephone' => 'required|string|max:20|unique:clients,telephone',
            'email' => 'nullable|email|max:255',
            'date_naissance' => 'nullable|date',
            'adresse' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $validator->validated();
            $data['date_premiere_visite'] = now()->toDateString();
            
            $client = Client::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Client créé avec succès',
                'data' => $client
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du client',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un client spécifique
     */
    public function show($id)
    {
        try {
            $client = Client::with(['photos'])->findOrFail($id);

            // Calculer statistiques depuis les ventes si relation existe
            $stats = [
                'points_fidelite' => $client->points_fidelite,
                'montant_total_depense' => $client->montant_total_depense,
                'date_premiere_visite' => $client->date_premiere_visite,
                'date_derniere_visite' => $client->date_derniere_visite,
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'client' => $client,
                    'statistiques' => $stats
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Client non trouvé',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Mettre à jour un client
     */
    public function update(Request $request, $id)
    {
        try {
            $client = Client::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'nom' => 'sometimes|required|string|max:100',
                'prenom' => 'sometimes|required|string|max:100',
                'telephone' => 'sometimes|required|string|max:20|unique:clients,telephone,' . $id,
                'email' => 'nullable|email|max:255',
                'date_naissance' => 'nullable|date',
                'adresse' => 'nullable|string',
                'notes' => 'nullable|string',
                'is_active' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            $client->update($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Client mis à jour avec succès',
                'data' => $client
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du client',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un client (soft delete)
     */
    public function destroy($id)
    {
        try {
            $client = Client::findOrFail($id);
            
            // Soft delete (si softDeletes activé dans le model)
            $client->delete();

            return response()->json([
                'success' => true,
                'message' => 'Client supprimé avec succès'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du client',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload photo client
     */
   public function uploadPhoto(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:5120',
            'type_photo' => 'required|in:avant,apres',
            'description' => 'nullable|string|max:255',
            'vente_id' => 'nullable|exists:ventes,id',
            'rendez_vous_id' => 'nullable|exists:rendez_vous,id',
            'is_public' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $client = Client::findOrFail($id);

            if ($request->hasFile('photo')) {
                $file = $request->file('photo');
                
                // Nom de fichier sécurisé (sans espaces ni caractères spéciaux)
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $file->getClientOriginalExtension();
                $safeName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $originalName);
                $filename = time() . '_' . $client->id . '_' . $safeName . '.' . $extension;
                
                // Stocker dans public/storage/photos/clients
                $path = $file->storeAs('photos/clients', $filename, 'public');

                $photo = PhotoClient::create([
                    'client_id' => $client->id,
                    'photo_url' => $path, // Sera "photos/clients/xxx.jpg"
                    'type_photo' => $request->type_photo,
                    'description' => $request->description,
                    'vente_id' => $request->vente_id,
                    'rendez_vous_id' => $request->rendez_vous_id,
                    'is_public' => $request->is_public ?? false,
                    'date_prise' => now()->toDateString(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Photo uploadée avec succès',
                    'data' => $photo
                ], 201);
            }

            return response()->json([
                'success' => false,
                'message' => 'Aucun fichier fourni'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload de la photo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer une photo
     */
    public function deletePhoto($clientId, $photoId)
    {
        try {
            $photo = PhotoClient::where('client_id', $clientId)
                ->findOrFail($photoId);

            // Supprimer le fichier physique
            if (Storage::disk('public')->exists($photo->photo_url)) {
                Storage::disk('public')->delete($photo->photo_url);
            }
            
            $photo->delete();

            return response()->json([
                'success' => true,
                'message' => 'Photo supprimée avec succès'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la photo',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}