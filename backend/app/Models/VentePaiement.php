<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VentePaiement extends Model
{
    use HasFactory;

    protected $table = 'ventes_paiements';

    protected $fillable = [
        'vente_id',
        'mode_paiement',
        'montant',
        'reference_transaction',
    ];

    protected $casts = [
        'montant' => 'decimal:2',
    ];

    /**
     * Relations
     */
    public function vente(): BelongsTo
    {
        return $this->belongsTo(Vente::class);
    }

    /**
     * Scopes
     */
    public function scopeParVente($query, $venteId)
    {
        return $query->where('vente_id', $venteId);
    }

    public function scopeParMode($query, $mode)
    {
        return $query->where('mode_paiement', $mode);
    }

    /**
     * Accessors
     */
    public function getEstMobileMoney(): bool
    {
        return in_array($this->mode_paiement, ['orange_money', 'moov_money']);
    }

    /**
     * Validation de référence pour mobile money
     */
    public function validerReference(): bool
    {
        if ($this->est_mobile_money && empty($this->reference_transaction)) {
            return false;
        }
        return true;
    }
}