<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PhotoClient extends Model
{
    use HasFactory;

    protected $table = 'photos_clients';

    protected $fillable = [
        'client_id',
        'vente_id',
        'rendez_vous_id',
        'photo_url',
        'type_photo',
        'description',
        'date_prise',
        'is_public',
    ];

    protected $casts = [
        'date_prise' => 'date',
        'is_public' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relation avec le client
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Relation avec la vente (optionnelle)
     */
    public function vente(): BelongsTo
    {
        return $this->belongsTo(Vente::class);
    }

    /**
     * Relation avec le rendez-vous (optionnel)
     */
    public function rendezVous(): BelongsTo
    {
        return $this->belongsTo(RendezVous::class);
    }

    /**
     * Scope pour les photos avant
     */
    public function scopeAvant($query)
    {
        return $query->where('type_photo', 'avant');
    }

    /**
     * Scope pour les photos après
     */
    public function scopeApres($query)
    {
        return $query->where('type_photo', 'apres');
    }

    /**
     * Scope pour les photos publiques (portfolio)
     */
    public function scopePubliques($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope pour les photos privées
     */
    public function scopePrivees($query)
    {
        return $query->where('is_public', false);
    }

    /**
     * Scope pour un client spécifique
     */
    public function scopePourClient($query, int $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    /**
     * Scope pour une vente spécifique
     */
    public function scopePourVente($query, int $venteId)
    {
        return $query->where('vente_id', $venteId);
    }

    /**
     * Vérifie si c'est une photo avant
     */
    public function isAvant(): bool
    {
        return $this->type_photo === 'avant';
    }

    /**
     * Vérifie si c'est une photo après
     */
    public function isApres(): bool
    {
        return $this->type_photo === 'apres';
    }

    /**
     * Obtient l'URL complète de la photo
     */
    public function getUrlCompleteAttribute(): string
    {
        if (filter_var($this->photo_url, FILTER_VALIDATE_URL)) {
            return $this->photo_url;
        }
        
        return Storage::url($this->photo_url);
    }

    /**
     * Obtient la miniature de la photo
     */
    public function getThumbnailAttribute(): string
    {
        // Si vous avez un système de miniatures
        $pathInfo = pathinfo($this->photo_url);
        $thumbnailPath = $pathInfo['dirname'] . '/thumbnails/' . $pathInfo['basename'];
        
        if (Storage::exists($thumbnailPath)) {
            return Storage::url($thumbnailPath);
        }
        
        return $this->url_complete;
    }

    /**
     * Obtient le libellé du type de photo
     */
    public function getTypePhotoLibelleAttribute(): string
    {
        return match($this->type_photo) {
            'avant' => 'Avant',
            'apres' => 'Après',
            default => 'Inconnu',
        };
    }

    /**
     * Supprime la photo du stockage lors de la suppression du modèle
     */
    protected static function booted()
    {
        static::deleting(function ($photo) {
            // Supprimer le fichier physique
            if (Storage::exists($photo->photo_url)) {
                Storage::delete($photo->photo_url);
            }
            
            // Supprimer aussi la miniature si elle existe
            $pathInfo = pathinfo($photo->photo_url);
            $thumbnailPath = $pathInfo['dirname'] . '/thumbnails/' . $pathInfo['basename'];
            if (Storage::exists($thumbnailPath)) {
                Storage::delete($thumbnailPath);
            }
        });
    }

    /**
     * Rendre une photo publique
     */
    public function rendrePublique(): bool
    {
        return $this->update(['is_public' => true]);
    }

    /**
     * Rendre une photo privée
     */
    public function rendrePrivee(): bool
    {
        return $this->update(['is_public' => false]);
    }

    /**
     * Changer le type de photo
     */
    public function changerType(string $nouveauType): bool
    {
        if (!in_array($nouveauType, ['avant', 'apres'])) {
            return false;
        }
        
        return $this->update(['type_photo' => $nouveauType]);
    }
}