<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Depense extends Model
{
    protected $fillable = [
        'libelle',
        'montant',
        'description',
        'categorie',
        'date_depense',
        'user_id'
    ];

    protected $casts = [
        'date_depense' => 'date',
        'montant' => 'decimal:2'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
