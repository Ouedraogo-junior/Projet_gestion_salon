<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClientRequest;
use App\Models\Client;
use App\Models\PhotoClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ClientController extends Controller
{
    /**
     * Liste des clients avec recherche et pagination
     */
    public function index(Request $request)
    {
        try {
            $query = Client::with(['photos', 'ventes', 'rendezVous']);

            // Recherche par nom, prénom, téléphone ou email
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('nom', 'LIKE', "%{$search}%")
                      ->orWhere('prenom', 'LIKE', "%{$search}%")
                      ->orWhere('telephone', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%");
                });
            }

            // Filtre par statut fidélité
            if ($request->has('fidele')) {
                $query->where('est_fidele', $request->fidele);
            }

            // Tri
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

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
    public function store(ClientRequest $request)
    {
        try {
            $client = Client::create($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Client créé avec succès',
                'data' => $client->load('photos')
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
            $client = Client::with(['photos', 'ventes.details.produit', 'rendezVous'])
                ->findOrFail($id);

            // Calculer statistiques
            $stats = [
                'total_achats' => $client->ventes->sum('montant_total'),
                'nombre_visites' => $client->ventes->count(),
                'points_fidelite' => $client->points_fidelite,
                'dernier_rdv' => $client->rendezVous()->latest()->first()?->date_heure,
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
    public function update(ClientRequest $request, $id)
    {
        try {
            $client = Client::findOrFail($id);
            $client->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Client mis à jour avec succès',
                'data' => $client->load('photos')
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
     * Supprimer un client
     */
    public function destroy($id)
    {
        try {
            $client = Client::findOrFail($id);
            
            // Supprimer les photos associées
            foreach ($client->photos as $photo) {
                Storage::disk('public')->delete($photo->chemin_fichier);
                $photo->delete();
            }

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
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:5120', // Max 5MB
            'description' => 'nullable|string|max:255'
        ]);

        try {
            $client = Client::findOrFail($id);

            if ($request->hasFile('photo')) {
                $file = $request->file('photo');
                $filename = time() . '_' . $client->id . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('photos/clients', $filename, 'public');

                $photo = PhotoClient::create([
                    'client_id' => $client->id,
                    'chemin_fichier' => $path,
                    'description' => $request->description,
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

            Storage::disk('public')->delete($photo->chemin_fichier);
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