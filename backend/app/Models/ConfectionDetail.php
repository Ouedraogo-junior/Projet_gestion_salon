<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConfectionDetail extends Model
{
    use HasFactory;

    protected $table = 'confection_details';

    protected $fillable = [
        'confection_id',
        'variante_id',
        'quantite_utilisee',
        'prix_unitaire',
        'prix_total',
    ];

    protected $casts = [
        'quantite_utilisee' => 'integer',
        'prix_unitaire'     => 'decimal:2',
        'prix_total'        => 'decimal:2',
        'created_at'        => 'datetime',
        'updated_at'        => 'datetime',
    ];

    // ========================================
    // BOOT
    // ========================================

    protected static function booted(): void
    {
        static::creating(function ($detail) {
            if (!$detail->prix_total) {
                $detail->prix_total = $detail->quantite_utilisee * $detail->prix_unitaire;
            }
        });

        static::updating(function ($detail) {
            if ($detail->isDirty(['quantite_utilisee', 'prix_unitaire'])) {
                $detail->prix_total = $detail->quantite_utilisee * $detail->prix_unitaire;
            }
        });
    }

    // ========================================
    // RELATIONS
    // ========================================

    public function confection(): BelongsTo
    {
        return $this->belongsTo(Confection::class);
    }

    public function variante(): BelongsTo
    {
        return $this->belongsTo(ProduitVariante::class, 'variante_id');
    }

    // ========================================
    // SCOPES
    // ========================================

    public function scopePourConfection($query, int $confectionId)
    {
        return $query->where('confection_id', $confectionId);
    }
}