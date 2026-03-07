<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Produit extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'nom', 'description', 'categorie_id', 'marque', 'fournisseur',
        'photo_url', 'visible_public', 'is_active', 'salon_id',
    ];

    protected $casts = [
        'is_active'      => 'boolean',
        'visible_public' => 'boolean',
    ];

    // ========================================
    // RELATIONS
    // ========================================

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class);
    }

    public function variantes(): HasMany
    {
        return $this->hasMany(ProduitVariante::class);
    }

    public function variantesActives(): HasMany
    {
        return $this->hasMany(ProduitVariante::class)->where('is_active', true);
    }

    // ========================================
    // ACCESSEURS AGRÉGÉS (sur toutes les variantes)
    // ========================================

    public function getStockTotalAttribute(): int
    {
        return $this->variantes->sum(fn($v) =>
            $v->stock_vente + $v->stock_utilisation + $v->stock_reserve
        );
    }

    public function getPrixMinAttribute(): ?float
    {
        return $this->variantes->min('prix_vente');
    }

    public function getPrixMaxAttribute(): ?float
    {
        return $this->variantes->max('prix_vente');
    }

    public function hasVariantes(): bool
    {
        return $this->variantes->count() > 1;
    }
}