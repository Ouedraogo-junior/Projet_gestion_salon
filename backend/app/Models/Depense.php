<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Depense extends Model
{
    protected $fillable = [
        'libelle',
        'montant',
        'description',
        'categorie_depense_id',
        'date_depense',
        'user_id',
    ];

    protected $casts = [
        'date_depense'        => 'date',
        'montant'             => 'decimal:2',
        'categorie_depense_id' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function categorieDepense(): BelongsTo
    {
        return $this->belongsTo(CategorieDepense::class, 'categorie_depense_id');
    }
}