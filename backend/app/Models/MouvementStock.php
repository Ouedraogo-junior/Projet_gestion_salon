<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MouvementStock extends Model
{
    use HasFactory;

    protected $table = 'mouvements_stock';

    protected $fillable = [
        'variante_id',
        'type_stock',
        'type_mouvement',
        'quantite',
        'stock_avant',
        'stock_apres',
        'motif',
        'vente_id',
        'transfert_id',
        'confection_id',
        'user_id',
    ];

    protected $casts = [
        'quantite'    => 'integer',
        'stock_avant' => 'integer',
        'stock_apres' => 'integer',
        'created_at'  => 'datetime',
        'updated_at'  => 'datetime',
    ];

    // ========================================
    // RELATIONS
    // ========================================

    public function variante(): BelongsTo
    {
        return $this->belongsTo(ProduitVariante::class, 'variante_id');
    }

    public function vente(): BelongsTo
    {
        return $this->belongsTo(Vente::class);
    }

    public function transfert(): BelongsTo
    {
        return $this->belongsTo(TransfertStock::class);
    }

    public function confection(): BelongsTo
    {
        return $this->belongsTo(Confection::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ========================================
    // SCOPES
    // ========================================

    public function scopeTypeStock($query, string $type)
    {
        return $query->where('type_stock', $type);
    }

    public function scopeTypeMouvement($query, string $type)
    {
        return $query->where('type_mouvement', $type);
    }

    public function scopeEntrees($query)
    {
        return $query->where('type_mouvement', 'entree');
    }

    public function scopeSorties($query)
    {
        return $query->where('type_mouvement', 'sortie');
    }

    public function scopePourVariante($query, int $varianteId)
    {
        return $query->where('variante_id', $varianteId);
    }

    public function scopePeriode($query, $dateDebut, $dateFin)
    {
        return $query->whereBetween('created_at', [$dateDebut, $dateFin]);
    }

    // ========================================
    // HELPERS
    // ========================================

    public function isEntree(): bool
    {
        return $this->type_mouvement === 'entree';
    }

    public function isSortie(): bool
    {
        return $this->type_mouvement === 'sortie';
    }

    public function isAjustement(): bool
    {
        return $this->type_mouvement === 'ajustement';
    }

    public function isInventaire(): bool
    {
        return $this->type_mouvement === 'inventaire';
    }

    public function getTypeMouvementLibelleAttribute(): string
    {
        return match($this->type_mouvement) {
            'entree'      => 'Entrée',
            'sortie'      => 'Sortie',
            'ajustement'  => 'Ajustement',
            'inventaire'  => 'Inventaire',
            default       => 'Inconnu',
        };
    }

    public function getTypeStockLibelleAttribute(): string
    {
        return match($this->type_stock) {
            'vente'        => 'Stock Vente',
            'utilisation'  => 'Stock Utilisation',
            'reserve'      => 'Stock Réserve',
            default        => 'Inconnu',
        };
    }

    // ========================================
    // MÉTHODE PRINCIPALE
    // ========================================

    public static function enregistrerMouvement(
        int $varianteId,
        string $typeStock,
        string $typeMouvement,
        int $quantite,
        ?string $motif = null,
        ?int $venteId = null,
        ?int $transfertId = null,
        ?int $confectionId = null,
        ?int $userId = null
    ): self {
        $variante = ProduitVariante::findOrFail($varianteId);

        $stockAvant = match($typeStock) {
            'vente'       => $variante->stock_vente,
            'utilisation' => $variante->stock_utilisation,
            'reserve'     => $variante->stock_reserve,
            default       => 0,
        };

        $stockApres = match($typeMouvement) {
            'entree'                  => $stockAvant + $quantite,
            'sortie'                  => $stockAvant - $quantite,
            'ajustement', 'inventaire' => $quantite,
            default                   => $stockAvant,
        };

        $mouvement = self::create([
            'variante_id'   => $varianteId,
            'type_stock'    => $typeStock,
            'type_mouvement' => $typeMouvement,
            'quantite'      => abs($quantite),
            'stock_avant'   => $stockAvant,
            'stock_apres'   => $stockApres,
            'motif'         => $motif,
            'vente_id'      => $venteId,
            'transfert_id'  => $transfertId,
            'confection_id' => $confectionId,
            'user_id'       => $userId ?? auth()->id(),
        ]);

        match($typeStock) {
            'vente'       => $variante->update(['stock_vente' => $stockApres]),
            'utilisation' => $variante->update(['stock_utilisation' => $stockApres]),
            'reserve'     => $variante->update(['stock_reserve' => $stockApres]),
            default       => null,
        };

        return $mouvement;
    }
}