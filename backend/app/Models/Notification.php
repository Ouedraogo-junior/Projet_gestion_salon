<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'titre',
        'message',
        'data',
        'priorite',
        'lu',
        'lu_at',
        'lien',
    ];

    protected $casts = [
        'data' => 'array',
        'lu' => 'boolean',
        'lu_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    /**
     * Relation avec l'utilisateur
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Marquer comme lu
     */
    public function marquerCommeLu(): void
    {
        if (!$this->lu) {
            $this->update([
                'lu' => true,
                'lu_at' => now(),
            ]);
        }
    }

    /**
     * Scope pour les notifications non lues
     */
    public function scopeNonLues($query)
    {
        return $query->where('lu', false);
    }

    /**
     * Scope pour un type spécifique
     */
    public function scopeType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope pour une priorité spécifique
     */
    public function scopePriorite($query, string $priorite)
    {
        return $query->where('priorite', $priorite);
    }

    /**
     * Scope pour les notifications récentes (7 derniers jours)
     */
    public function scopeRecentes($query)
    {
        return $query->where('created_at', '>=', now()->subDays(7));
    }
}