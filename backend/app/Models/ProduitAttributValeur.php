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
        'produit_id',
        'attribut_id',
        'valeur',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relation avec le produit
     */
    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }

    /**
     * Relation avec l'attribut
     */
    public function attribut(): BelongsTo
    {
        return $this->belongsTo(Attribut::class);
    }

    /**
     * Scope pour un produit spécifique
     */
    public function scopePourProduit($query, int $produitId)
    {
        return $query->where('produit_id', $produitId);
    }

    /**
     * Scope pour un attribut spécifique
     */
    public function scopePourAttribut($query, int $attributId)
    {
        return $query->where('attribut_id', $attributId);
    }

    /**
     * Obtient la valeur formatée avec l'unité
     */
    public function getValeurFormateeAttribute(): string
    {
        return $this->attribut ? $this->attribut->formaterValeur($this->valeur) : $this->valeur;
    }

    /**
     * Définit ou met à jour une valeur d'attribut pour un produit
     */
    public static function definirValeur(int $produitId, int $attributId, $valeur): self
    {
        return self::updateOrCreate(
            [
                'produit_id' => $produitId,
                'attribut_id' => $attributId,
            ],
            [
                'valeur' => $valeur,
            ]
        );
    }

    /**
     * Supprime toutes les valeurs d'un produit
     */
    public static function supprimerPourProduit(int $produitId): int
    {
        return self::where('produit_id', $produitId)->delete();
    }

    /**
     * Obtient toutes les valeurs d'attributs d'un produit sous forme de tableau
     */
    public static function getValeursProduit(int $produitId): array
    {
        return self::with('attribut')
            ->where('produit_id', $produitId)
            ->get()
            ->mapWithKeys(function ($valeur) {
                return [$valeur->attribut->slug => $valeur->valeur];
            })
            ->toArray();
    }
}