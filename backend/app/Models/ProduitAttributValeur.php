<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProduitAttributValeur extends Model
{
    use HasFactory;

    protected $table = 'produit_attribut_valeurs';

    protected $fillable = [
        'variante_id',
        'attribut_id',
        'valeur',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ========================================
    // RELATIONS
    // ========================================

    public function variante(): BelongsTo
    {
        return $this->belongsTo(ProduitVariante::class, 'variante_id');
    }

    public function attribut(): BelongsTo
    {
        return $this->belongsTo(Attribut::class);
    }

    // ========================================
    // SCOPES
    // ========================================

    public function scopePourVariante($query, int $varianteId)
    {
        return $query->where('variante_id', $varianteId);
    }

    public function scopePourAttribut($query, int $attributId)
    {
        return $query->where('attribut_id', $attributId);
    }

    // ========================================
    // ACCESSEURS
    // ========================================

    public function getValeurFormateeAttribute(): string
    {
        return $this->attribut ? $this->attribut->formaterValeur($this->valeur) : $this->valeur;
    }

    // ========================================
    // MÉTHODES STATIQUES
    // ========================================

    public static function definirValeur(int $varianteId, int $attributId, $valeur): self
    {
        return self::updateOrCreate(
            [
                'variante_id' => $varianteId,
                'attribut_id' => $attributId,
            ],
            [
                'valeur' => $valeur,
            ]
        );
    }

    public static function supprimerPourVariante(int $varianteId): int
    {
        return self::where('variante_id', $varianteId)->delete();
    }

    public static function getValeursVariante(int $varianteId): array
    {
        return self::with('attribut')
            ->where('variante_id', $varianteId)
            ->get()
            ->mapWithKeys(function ($valeur) {
                return [$valeur->attribut->slug => $valeur->valeur];
            })
            ->toArray();
    }
}