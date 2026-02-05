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
        'produit_id',
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
        'quantite' => 'integer',
        'stock_avant' => 'integer',
        'stock_apres' => 'integer',
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
     * Relation avec la vente (si sortie pour vente)
     */
    public function vente(): BelongsTo
    {
        return $this->belongsTo(Vente::class);
    }

    /**
     * Relation avec le transfert (si mouvement de transfert inter-stock)
     */
    public function transfert(): BelongsTo
    {
        return $this->belongsTo(TransfertStock::class);
    }

    /**
     * Relation avec la confection (si entrée depuis confection)
     */
    public function confection(): BelongsTo
    {
        return $this->belongsTo(Confection::class);
    }

    /**
     * Relation avec l'utilisateur qui a effectué le mouvement
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope pour filtrer par type de stock
     */
    public function scopeTypeStock($query, string $type)
    {
        return $query->where('type_stock', $type);
    }

    /**
     * Scope pour filtrer par type de mouvement
     */
    public function scopeTypeMouvement($query, string $type)
    {
        return $query->where('type_mouvement', $type);
    }

    /**
     * Scope pour les entrées
     */
    public function scopeEntrees($query)
    {
        return $query->where('type_mouvement', 'entree');
    }

    /**
     * Scope pour les sorties
     */
    public function scopeSorties($query)
    {
        return $query->where('type_mouvement', 'sortie');
    }

    /**
     * Scope pour un produit spécifique
     */
    public function scopePourProduit($query, int $produitId)
    {
        return $query->where('produit_id', $produitId);
    }

    /**
     * Scope pour une période donnée
     */
    public function scopePeriode($query, $dateDebut, $dateFin)
    {
        return $query->whereBetween('created_at', [$dateDebut, $dateFin]);
    }

    /**
     * Vérifie si c'est un mouvement d'entrée
     */
    public function isEntree(): bool
    {
        return $this->type_mouvement === 'entree';
    }

    /**
     * Vérifie si c'est un mouvement de sortie
     */
    public function isSortie(): bool
    {
        return $this->type_mouvement === 'sortie';
    }

    /**
     * Vérifie si c'est un ajustement
     */
    public function isAjustement(): bool
    {
        return $this->type_mouvement === 'ajustement';
    }

    /**
     * Vérifie si c'est un inventaire
     */
    public function isInventaire(): bool
    {
        return $this->type_mouvement === 'inventaire';
    }

    /**
     * Obtient le libellé du type de mouvement
     */
    public function getTypeMouvementLibelleAttribute(): string
    {
        return match($this->type_mouvement) {
            'entree' => 'Entrée',
            'sortie' => 'Sortie',
            'ajustement' => 'Ajustement',
            'inventaire' => 'Inventaire',
            default => 'Inconnu',
        };
    }

    /**
     * Obtient le libellé du type de stock
     */
    public function getTypeStockLibelleAttribute(): string
    {
        return match($this->type_stock) {
            'vente' => 'Stock Vente',
            'utilisation' => 'Stock Utilisation',
            'reserve' => 'Stock Réserve', // ✅ AJOUT
            default => 'Inconnu',
        };
    }

    /**
     * Enregistre un mouvement de stock
     */
    public static function enregistrerMouvement(
        int $produitId,
        string $typeStock,
        string $typeMouvement,
        int $quantite,
        ?string $motif = null,
        ?int $venteId = null,
        ?int $transfertId = null,
        ?int $confectionId = null,
        ?int $userId = null
    ): self {
        $produit = Produit::findOrFail($produitId);
        
        // ✅ MODIFICATION - Gérer les 3 types de stock
        $stockAvant = match($typeStock) {
            'vente' => $produit->stock_vente,
            'utilisation' => $produit->stock_utilisation,
            'reserve' => $produit->stock_reserve, // ← AJOUT
            default => 0,
        };

        // Calculer le nouveau stock
        $stockApres = match($typeMouvement) {
            'entree' => $stockAvant + $quantite,
            'sortie' => $stockAvant - $quantite,
            'ajustement', 'inventaire' => $quantite, // quantite = nouveau stock
            default => $stockAvant,
        };

        // Créer le mouvement
        $mouvement = self::create([
            'produit_id' => $produitId,
            'type_stock' => $typeStock,
            'type_mouvement' => $typeMouvement,
            'quantite' => abs($quantite),
            'stock_avant' => $stockAvant,
            'stock_apres' => $stockApres,
            'motif' => $motif,
            'vente_id' => $venteId,
            'transfert_id' => $transfertId,
            'confection_id' => $confectionId,
            'user_id' => $userId ?? auth()->id(),
        ]);

        // ✅ MODIFICATION - Mettre à jour le bon champ de stock
        match($typeStock) {
            'vente' => $produit->update(['stock_vente' => $stockApres]),
            'utilisation' => $produit->update(['stock_utilisation' => $stockApres]),
            'reserve' => $produit->update(['stock_reserve' => $stockApres]), // ← AJOUT
            default => null,
        };

        return $mouvement;
    }
}