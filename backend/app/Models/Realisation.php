<?php
// app/Models/Realisation.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Realisation extends Model
{
    use HasFactory;

    protected $table = 'realisations';

    protected $fillable = [
        'client_id',
        'nom_coiffure',
        'montant_coiffure',
        'description',
        'date_prise',
        'is_public',
    ];

    protected $casts = [
        'date_prise'        => 'date',
        'is_public'         => 'boolean',
        'montant_coiffure'  => 'decimal:2',
        'created_at'        => 'datetime',
        'updated_at'        => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function medias(): HasMany
    {
        return $this->hasMany(PhotoClient::class, 'realisation_id');
    }

    public function scopePubliques($query)
    {
        return $query->where('is_public', true);
    }

    public function scopePourClient($query, int $clientId)
    {
        return $query->where('client_id', $clientId);
    }
}