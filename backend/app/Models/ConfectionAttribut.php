<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConfectionAttribut extends Model
{
    use HasFactory;

    protected $table = 'confection_attributs';

    protected $fillable = [
        'confection_id',
        'attribut_id',
        'valeur',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relation avec la confection
     */
    public function confection(): BelongsTo
    {
        return $this->belongsTo(Confection::class);
    }

    /**
     * Relation avec l'attribut
     */
    public function attribut(): BelongsTo
    {
        return $this->belongsTo(Attribut::class);
    }

    /**
     * Obtient la valeur formatée avec l'unité
     */
    public function getValeurFormateeAttribute(): string
    {
        return $this->attribut ? $this->attribut->formaterValeur($this->valeur) : $this->valeur;
    }

    /**
     * Scope pour une confection spécifique
     */
    public function scopePourConfection($query, int $confectionId)
    {
        return $query->where('confection_id', $confectionId);
    }
}