<?php
// app/Http/Controllers/Api/RealisationController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Realisation;
use App\Models\PhotoClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class RealisationController extends Controller
{
    // ── Liste avec médias ────────────────────────────────────────────────
    public function index(Request $request)
    {
        $query = Realisation::with(['medias', 'client:id,nom,prenom']);

        if ($request->boolean('public_only')) {
            $query->publiques();
        }
        if ($request->filled('client_id')) {
            $query->pourClient($request->client_id);
        }
        if ($request->filled('search')) {
            $query->where('nom_coiffure', 'like', '%' . $request->search . '%');
        }

        $realisations = $query->latest()->paginate($request->get('per_page', 12));

        return response()->json(['success' => true, 'data' => $realisations]);
    }

    // ── Détail ───────────────────────────────────────────────────────────
    public function show(int $id)
    {
        $realisation = Realisation::with(['medias', 'client:id,nom,prenom'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $realisation]);
    }

    // ── Créer réalisation + uploader médias ──────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'nom_coiffure'      => 'nullable|string|max:255',
            'montant_coiffure'  => 'nullable|numeric|min:0',
            'description'       => 'nullable|string',
            'date_prise'        => 'nullable|date',
            'is_public'         => 'boolean',
            'client_id'         => 'nullable|exists:clients,id',
            'medias'            => 'required|array|min:1',
            'medias.*'          => 'required|file|mimes:jpeg,jpg,png,gif,mp4,mov,avi,webm|max:102400',
            'types_photo'       => 'required|array|min:1',
            'types_photo.*'     => 'required|in:avant,apres',
            'types_media'       => 'required|array|min:1',
            'types_media.*'     => 'required|in:photo,video',
        ]);

        DB::beginTransaction();
        try {
            $realisation = Realisation::create([
                'client_id'         => $request->client_id,
                'nom_coiffure'      => $request->nom_coiffure,
                'montant_coiffure'  => $request->montant_coiffure,
                'description'       => $request->description,
                'date_prise'        => $request->date_prise ?? now()->toDateString(),
                'is_public'         => $request->boolean('is_public', true),
            ]);

            foreach ($request->file('medias') as $index => $file) {
                $typeMedia = $request->types_media[$index] ?? 'photo';
                $folder    = $typeMedia === 'video' ? 'realisations/videos' : 'realisations/photos';
                $path      = $file->store($folder, 'public');

                PhotoClient::create([
                    'realisation_id' => $realisation->id,
                    'client_id'      => $request->client_id,
                    'media_url'      => $path,
                    'type_photo'     => $request->types_photo[$index] ?? 'apres',
                    'type_media'     => $typeMedia,
                    'date_prise'     => $realisation->date_prise,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Réalisation créée avec succès',
                'data'    => $realisation->load('medias'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // ── Modifier infos réalisation ────────────────────────────────────────
    public function update(Request $request, int $id)
    {
        $realisation = Realisation::findOrFail($id);

        $request->validate([
            'nom_coiffure'     => 'nullable|string|max:255',
            'montant_coiffure' => 'nullable|numeric|min:0',
            'description'      => 'nullable|string',
            'date_prise'       => 'nullable|date',
            'is_public'        => 'boolean',
            'client_id'        => 'nullable|exists:clients,id',
        ]);

        $realisation->update($request->only([
            'nom_coiffure', 'montant_coiffure', 'description',
            'date_prise', 'is_public', 'client_id',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Réalisation mise à jour',
            'data'    => $realisation->load('medias'),
        ]);
    }

    // ── Ajouter des médias à une réalisation existante ───────────────────
    public function addMedias(Request $request, int $id)
    {
        $realisation = Realisation::findOrFail($id);

        $request->validate([
            'medias'       => 'required|array|min:1',
            'medias.*'     => 'required|file|mimes:jpeg,jpg,png,gif,mp4,mov,avi,webm|max:102400',
            'types_photo'  => 'required|array|min:1',
            'types_photo.*'=> 'required|in:avant,apres',
            'types_media'  => 'required|array|min:1',
            'types_media.*'=> 'required|in:photo,video',
        ]);

        $added = [];
        foreach ($request->file('medias') as $index => $file) {
            $typeMedia = $request->types_media[$index] ?? 'photo';
            $folder    = $typeMedia === 'video' ? 'realisations/videos' : 'realisations/photos';
            $path      = $file->store($folder, 'public');

            $media = PhotoClient::create([
                'realisation_id' => $realisation->id,
                'client_id'      => $realisation->client_id,
                'media_url'      => $path,
                'type_photo'     => $request->types_photo[$index] ?? 'apres',
                'type_media'     => $typeMedia,
                'date_prise'     => $realisation->date_prise,
            ]);
            $added[] = $media;
        }

        return response()->json([
            'success' => true,
            'message' => count($added) . ' média(s) ajouté(s)',
            'data'    => $added,
        ]);
    }

    // ── Supprimer un média ────────────────────────────────────────────────
    public function deleteMedia(int $realisationId, int $mediaId)
    {
        $media = PhotoClient::where('realisation_id', $realisationId)->findOrFail($mediaId);
        // Le booted() du modèle gère la suppression du fichier
        $media->delete();

        return response()->json(['success' => true, 'message' => 'Média supprimé']);
    }

    // ── Supprimer toute la réalisation + ses médias ───────────────────────
    public function destroy(int $id)
    {
        $realisation = Realisation::with('medias')->findOrFail($id);
        // Le booted() de PhotoClient supprime les fichiers
        $realisation->medias->each->delete();
        $realisation->delete();

        return response()->json(['success' => true, 'message' => 'Réalisation supprimée']);
    }

    // ── Toggle is_public ──────────────────────────────────────────────────
    public function togglePublic(int $id)
    {
        $realisation = Realisation::findOrFail($id);
        $realisation->update(['is_public' => !$realisation->is_public]);

        return response()->json([
            'success'   => true,
            'is_public' => $realisation->is_public,
        ]);
    }
}