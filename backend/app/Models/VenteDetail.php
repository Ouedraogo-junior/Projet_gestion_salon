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
        'prestation_id',
        'variante_id',
        'produit_reference',
        'quantite',
        'prix_unitaire',
        'prix_total',
        'reduction',
    ];

    protected $casts = [
        'quantite'     => 'integer',
        'prix_unitaire' => 'decimal:2',
        'prix_total'   => 'decimal:2',
        'reduction'    => 'decimal:2',
    ];

    protected $attributes = [
        'quantite'  => 1,
        'reduction' => 0,
    ];

    // ========================================
    // RELATIONS
    // ========================================

    public function vente(): BelongsTo
    {
        return $this->belongsTo(Vente::class);
    }

    public function variante(): BelongsTo
    {
        return $this->belongsTo(ProduitVariante::class, 'variante_id');
    }

    public function prestation(): BelongsTo
    {
        return $this->belongsTo(TypePrestation::class, 'prestation_id');
    }

    // ========================================
    // SCOPES
    // ========================================

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

    // ========================================
    // ACCESSEURS
    // ========================================

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

    public function getPrixNetAttribute(): float
    {
        return (float) ($this->prix_total - $this->reduction);
    }

    // ========================================
    // MÉTHODES UTILITAIRES
    // ========================================

    public function calculerPrixTotal(): void
    {
        $this->prix_total = ($this->quantite * $this->prix_unitaire) - $this->reduction;
    }

    public function updateStock(): void
    {
        if ($this->type_article === 'produit' && $this->variante_id) {
            MouvementStock::enregistrerMouvement(
                varianteId:    $this->variante_id,
                typeStock:     'vente',
                typeMouvement: 'sortie',
                quantite:      $this->quantite,
                motif:         "Vente #{$this->vente_id}",
                venteId:       $this->vente_id,
                userId:        auth()->id()
            );
        }
    }

    public function restaurerStock(): void
    {
        if ($this->type_article === 'produit' && $this->variante_id) {
            MouvementStock::enregistrerMouvement(
                varianteId:    $this->variante_id,
                typeStock:     'vente',
                typeMouvement: 'entree',
                quantite:      $this->quantite,
                motif:         "Annulation vente #{$this->vente_id}",
                venteId:       $this->vente_id,
                userId:        auth()->id()
            );
        }
    }

    // ========================================
    // BOOT
    // ========================================

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($detail) {
            if (empty($detail->prix_total)) {
                $detail->calculerPrixTotal();
            }
        });

        static::updating(function ($detail) {
            if ($detail->isDirty(['quantite', 'prix_unitaire', 'reduction'])) {
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