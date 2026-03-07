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
        'variante_id',
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
        'quantite'        => 'integer',
        'prix_unitaire'   => 'decimal:2',
        'montant_total'   => 'decimal:2',
        'valide'          => 'boolean',
        'date_validation' => 'datetime',
        'created_at'      => 'datetime',
        'updated_at'      => 'datetime',
    ];

    // ========================================
    // BOOT
    // ========================================

    protected static function booted(): void
    {
        static::creating(function ($transfert) {
            if (!$transfert->numero_transfert) {
                $transfert->numero_transfert = self::genererNumero();
            }
            if (!$transfert->montant_total) {
                $transfert->montant_total = $transfert->quantite * $transfert->prix_unitaire;
            }
        });
    }

    // ========================================
    // RELATIONS
    // ========================================

    public function variante(): BelongsTo
    {
        return $this->belongsTo(ProduitVariante::class, 'variante_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function valideur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'valideur_id');
    }

    public function mouvements(): HasMany
    {
        return $this->hasMany(MouvementStock::class, 'transfert_id');
    }

    // ========================================
    // SCOPES
    // ========================================

    public function scopeValides($query)
    {
        return $query->where('valide', true);
    }

    public function scopeEnAttente($query)
    {
        return $query->where('valide', false);
    }

    public function scopeType($query, string $type)
    {
        return $query->where('type_transfert', $type);
    }

    public function scopePeriode($query, $dateDebut, $dateFin)
    {
        return $query->whereBetween('created_at', [$dateDebut, $dateFin]);
    }

    // ========================================
    // HELPERS
    // ========================================

    public function isValide(): bool
    {
        return $this->valide === true;
    }

    public function getTypeTransfertLibelleAttribute(): string
    {
        return match($this->type_transfert) {
            'vente_vers_utilisation'   => 'Stock Vente → Stock Utilisation',
            'utilisation_vers_vente'   => 'Stock Utilisation → Stock Vente',
            'reserve_vers_vente'       => 'Stock Réserve → Stock Vente',
            'reserve_vers_utilisation' => 'Stock Réserve → Stock Utilisation',
            'vente_vers_reserve'       => 'Stock Vente → Stock Réserve',
            'utilisation_vers_reserve' => 'Stock Utilisation → Stock Réserve',
            default                    => 'Inconnu',
        };
    }

    public function getStockSourceAttribute(): string
    {
        return match($this->type_transfert) {
            'vente_vers_utilisation', 'vente_vers_reserve'       => 'vente',
            'utilisation_vers_vente', 'utilisation_vers_reserve' => 'utilisation',
            'reserve_vers_vente', 'reserve_vers_utilisation'     => 'reserve',
            default                                               => 'vente',
        };
    }

    public function getStockDestinationAttribute(): string
    {
        return match($this->type_transfert) {
            'vente_vers_utilisation', 'reserve_vers_utilisation' => 'utilisation',
            'utilisation_vers_vente', 'reserve_vers_vente'       => 'vente',
            'vente_vers_reserve', 'utilisation_vers_reserve'     => 'reserve',
            default                                               => 'vente',
        };
    }

    // ========================================
    // MÉTHODES MÉTIER
    // ========================================

    public function valider(?int $valideurId = null): bool
    {
        if ($this->valide) {
            return false;
        }

        DB::beginTransaction();
        try {
            $variante = $this->variante;

            $stockSource = match($this->stock_source) {
                'vente'       => $variante->stock_vente,
                'utilisation' => $variante->stock_utilisation,
                'reserve'     => $variante->stock_reserve,
                default       => 0,
            };

            if ($stockSource < $this->quantite) {
                throw new \Exception("Stock insuffisant pour le transfert");
            }

            MouvementStock::enregistrerMouvement(
                varianteId:    $this->variante_id,
                typeStock:     $this->stock_source,
                typeMouvement: 'sortie',
                quantite:      $this->quantite,
                motif:         "Transfert vers stock {$this->stock_destination} - {$this->numero_transfert}",
                transfertId:   $this->id,
                userId:        $valideurId ?? auth()->id()
            );

            MouvementStock::enregistrerMouvement(
                varianteId:    $this->variante_id,
                typeStock:     $this->stock_destination,
                typeMouvement: 'entree',
                quantite:      $this->quantite,
                motif:         "Transfert depuis stock {$this->stock_source} - {$this->numero_transfert}",
                transfertId:   $this->id,
                userId:        $valideurId ?? auth()->id()
            );

            $this->update([
                'valide'          => true,
                'valideur_id'     => $valideurId ?? auth()->id(),
                'date_validation' => now(),
            ]);

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public static function creerTransfert(
        int $varianteId,
        string $typeTransfert,
        int $quantite,
        ?string $motif = null,
        ?int $userId = null,
        bool $autoValider = false
    ): self {
        $variante = ProduitVariante::findOrFail($varianteId);

        $transfert = self::create([
            'variante_id'    => $varianteId,
            'type_transfert' => $typeTransfert,
            'quantite'       => $quantite,
            'prix_unitaire'  => $variante->prix_achat,
            'motif'          => $motif,
            'user_id'        => $userId ?? auth()->id(),
        ]);

        if ($autoValider) {
            $transfert->valider($userId);
        }

        return $transfert;
    }

    // ========================================
    // UTILITAIRES
    // ========================================

    private static function genererNumero(): string
    {
        $prefix  = 'TRF';
        $date    = now()->format('Ymd');
        $dernier = self::whereDate('created_at', today())->count() + 1;
        return sprintf('%s-%s-%04d', $prefix, $date, $dernier);
    }
}