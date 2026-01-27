<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VenteDetail extends Model
{
    use HasFactory;

    protected $table = 'ventes_details';

    protected $fillable = [
        'vente_id',
        'type_article',
        'article_nom',
        'produit_id',
        'quantite',
        'prix_unitaire',
        'prix_total',
    ];

    protected $casts = [
        'quantite' => 'integer',
        'prix_unitaire' => 'decimal:2',
        'prix_total' => 'decimal:2',
    ];

    protected $attributes = [
        'quantite' => 1,
    ];

    /**
     * Relations
     */
    
    public function vente(): BelongsTo
    {
        return $this->belongsTo(Vente::class);
    }

    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }

    /**
     * Scopes
     */
    
    public function scopePrestations($query)
    {
        return $query->where('type_article', 'prestation');
    }

    public function scopeProduits($query)
    {
        return $query->where('type_article', 'produit');
    }

    public function scopeParVente($query, $venteId)
    {
        return $query->where('vente_id', $venteId);
    }

    /**
     * Accessors
     */
    
    public function getEstPrestationAttribute(): bool
    {
        return $this->type_article === 'prestation';
    }

    public function getEstProduitAttribute(): bool
    {
        return $this->type_article === 'produit';
    }

    public function getMontantTotalAttribute(): float
    {
        return (float) $this->prix_total;
    }

    /**
     * Méthodes utilitaires
     */
    
    public function calculerPrixTotal(): void
    {
        $this->prix_total = $this->quantite * $this->prix_unitaire;
    }

    public function updateStock(): void
    {
        if ($this->type_article === 'produit' && $this->produit_id) {
            $produit = $this->produit;
            if ($produit) {
                $produit->decrement('stock_actuel', $this->quantite);
            }
        }
    }

    public function restaurerStock(): void
    {
        if ($this->type_article === 'produit' && $this->produit_id) {
            $produit = $this->produit;
            if ($produit) {
                $produit->increment('stock_actuel', $this->quantite);
            }
        }
    }

    /**
     * Boot method
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($detail) {
            if (empty($detail->prix_total)) {
                $detail->calculerPrixTotal();
            }
        });

        static::updating(function ($detail) {
            if ($detail->isDirty(['quantite', 'prix_unitaire'])) {
                $detail->calculerPrixTotal();
            }
        });

        static::created(function ($detail) {
            $detail->vente->calculerMontants();
            $detail->vente->save();
            
            $detail->updateStock();
        });

        static::updated(function ($detail) {
            $detail->vente->calculerMontants();
            $detail->vente->save();
        });

        static::deleted(function ($detail) {
            $detail->restaurerStock();
            
            $detail->vente->calculerMontants();
            $detail->vente->save();
        });
    }
}