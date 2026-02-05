<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class TransfertStock extends Model
{
    use HasFactory;

    protected $table = 'transferts_stock';

    protected $fillable = [
        'numero_transfert',
        'produit_id',
        'type_transfert',
        'quantite',
        'prix_unitaire',
        'montant_total',
        'motif',
        'user_id',
        'valide',
        'valideur_id',
        'date_validation',
    ];

    protected $casts = [
        'quantite' => 'integer',
        'prix_unitaire' => 'decimal:2',
        'montant_total' => 'decimal:2',
        'valide' => 'boolean',
        'date_validation' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Génère automatiquement le numéro de transfert
     */
    protected static function booted()
    {
        static::creating(function ($transfert) {
            if (!$transfert->numero_transfert) {
                $transfert->numero_transfert = self::genererNumero();
            }
            
            // Calculer le montant total
            if (!$transfert->montant_total) {
                $transfert->montant_total = $transfert->quantite * $transfert->prix_unitaire;
            }
        });
    }

    /**
     * Relation avec le produit
     */
    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }

    /**
     * Relation avec l'utilisateur qui a effectué le transfert
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation avec le valideur
     */
    public function valideur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'valideur_id');
    }

    /**
     * Relation avec les mouvements de stock générés
     */
    public function mouvements(): HasMany
    {
        return $this->hasMany(MouvementStock::class, 'transfert_id');
    }

    /**
     * Scope pour les transferts validés
     */
    public function scopeValides($query)
    {
        return $query->where('valide', true);
    }

    /**
     * Scope pour les transferts en attente
     */
    public function scopeEnAttente($query)
    {
        return $query->where('valide', false);
    }

    /**
     * Scope pour un type de transfert spécifique
     */
    public function scopeType($query, string $type)
    {
        return $query->where('type_transfert', $type);
    }

    /**
     * Scope pour une période
     */
    public function scopePeriode($query, $dateDebut, $dateFin)
    {
        return $query->whereBetween('created_at', [$dateDebut, $dateFin]);
    }

    /**
     * Vérifie si le transfert est validé
     */
    public function isValide(): bool
    {
        return $this->valide === true;
    }

    /**
     * Obtient le libellé du type de transfert
     */
     public function getTypeTransfertLibelleAttribute(): string
    {
        return match($this->type_transfert) {
            'vente_vers_utilisation' => 'Stock Vente → Stock Utilisation',
            'utilisation_vers_vente' => 'Stock Utilisation → Stock Vente',
            // ✅ AJOUT - Nouveaux types
            'reserve_vers_vente' => 'Stock Réserve → Stock Vente',
            'reserve_vers_utilisation' => 'Stock Réserve → Stock Utilisation',
            'vente_vers_reserve' => 'Stock Vente → Stock Réserve',
            'utilisation_vers_reserve' => 'Stock Utilisation → Stock Réserve',
            default => 'Inconnu',
        };
    }

    /**
     * Obtient le stock source selon le type de transfert
     */
    public function getStockSourceAttribute(): string
    {
        return match($this->type_transfert) {
            'vente_vers_utilisation', 'vente_vers_reserve' => 'vente',
            'utilisation_vers_vente', 'utilisation_vers_reserve' => 'utilisation',
            // ✅ AJOUT
            'reserve_vers_vente', 'reserve_vers_utilisation' => 'reserve',
            default => 'vente',
        };
    }

    /**
     * Obtient le stock destination selon le type de transfert
     */
    public function getStockDestinationAttribute(): string
    {
        return match($this->type_transfert) {
            'vente_vers_utilisation' => 'utilisation',
            'utilisation_vers_vente' => 'vente',
            // ✅ AJOUT
            'reserve_vers_vente', 'utilisation_vers_reserve', 'vente_vers_reserve' => 
                str_contains($this->type_transfert, 'vers_vente') ? 'vente' :
                (str_contains($this->type_transfert, 'vers_utilisation') ? 'utilisation' : 'reserve'),
            'reserve_vers_utilisation' => 'utilisation',
            default => 'vente',
        };
    }

    /**
     * Valide le transfert et effectue les mouvements de stock
     */
     public function valider(?int $valideurId = null): bool
    {
        if ($this->valide) {
            return false; // Déjà validé
        }

        DB::beginTransaction();
        try {
            $produit = $this->produit;

            // ✅ MODIFICATION - Gérer les 3 types de stock
            $stockSource = match($this->stock_source) {
                'vente' => $produit->stock_vente,
                'utilisation' => $produit->stock_utilisation,
                'reserve' => $produit->stock_reserve, // ← AJOUT
                default => 0,
            };

            if ($stockSource < $this->quantite) {
                throw new \Exception("Stock insuffisant pour le transfert");
            }

            // Créer mouvement de sortie du stock source
            MouvementStock::enregistrerMouvement(
                produitId: $this->produit_id,
                typeStock: $this->stock_source,
                typeMouvement: 'sortie',
                quantite: $this->quantite,
                motif: "Transfert vers stock {$this->stock_destination} - {$this->numero_transfert}",
                transfertId: $this->id,
                userId: $valideurId ?? auth()->id()
            );

            // Créer mouvement d'entrée dans le stock destination
            MouvementStock::enregistrerMouvement(
                produitId: $this->produit_id,
                typeStock: $this->stock_destination,
                typeMouvement: 'entree',
                quantite: $this->quantite,
                motif: "Transfert depuis stock {$this->stock_source} - {$this->numero_transfert}",
                transfertId: $this->id,
                userId: $valideurId ?? auth()->id()
            );

            // Marquer comme validé
            $this->update([
                'valide' => true,
                'valideur_id' => $valideurId ?? auth()->id(),
                'date_validation' => now(),
            ]);

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Crée un nouveau transfert
     */
    public static function creerTransfert(
        int $produitId,
        string $typeTransfert,
        int $quantite,
        ?string $motif = null,
        ?int $userId = null,
        bool $autoValider = false
    ): self {
        $produit = Produit::findOrFail($produitId);
        
        $transfert = self::create([
            'produit_id' => $produitId,
            'type_transfert' => $typeTransfert,
            'quantite' => $quantite,
            'prix_unitaire' => $produit->prix_achat,
            'motif' => $motif,
            'user_id' => $userId ?? auth()->id(),
        ]);

        if ($autoValider) {
            $transfert->valider($userId);
        }

        return $transfert;
    }

    /**
     * Génère un numéro unique de transfert
     */
    private static function genererNumero(): string
    {
        $prefix = 'TRF';
        $date = now()->format('Ymd');
        $dernier = self::whereDate('created_at', today())->count() + 1;
        
        return sprintf('%s-%s-%04d', $prefix, $date, $dernier);
    }
}