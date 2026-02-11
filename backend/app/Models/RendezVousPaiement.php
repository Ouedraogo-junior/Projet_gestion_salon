<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RendezVousPaiement extends Model
{
    protected $table = 'rendez_vous_paiements';

    protected $fillable = [
        'rendez_vous_id',
        'type_paiement',
        'montant',
        'mode_paiement',
        'reference_transaction',
        'date_paiement',
        'user_id',
        'notes',
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'date_paiement' => 'datetime',
    ];

    /**
     * Relations
     */
    public function rendezVous(): BelongsTo
    {
        return $this->belongsTo(RendezVous::class, 'rendez_vous_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}