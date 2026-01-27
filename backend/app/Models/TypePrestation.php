<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypePrestation extends Model
{
    use HasFactory;

    protected $table = 'types_prestations';

    protected $fillable = [
        'nom',
        'description',
        'duree_estimee_minutes',
        'prix_base',
        'actif',
        'ordre',
    ];

    protected $casts = [
        'duree_estimee_minutes' => 'integer',
        'prix_base' => 'decimal:2',
        'actif' => 'boolean',
        'ordre' => 'integer',
    ];

    /**
     * Relation : Un type de prestation a plusieurs rendez-vous
     */
    public function rendezVous()
    {
        return $this->hasMany(RendezVous::class, 'type_prestation_id');
    }

    /**
     * Scope : Seulement les types actifs
     */
    public function scopeActif($query)
    {
        return $query->where('actif', true);
    }

    /**
     * Scope : Ordonné par ordre croissant
     */
    public function scopeOrdonne($query)
    {
        return $query->orderBy('ordre');
    }

    /**
     * Accessor : Formater le prix
     */
    public function getPrixFormateAttribute()
    {
        return $this->prix_base ? number_format($this->prix_base, 2, ',', ' ') . ' FCFA' : 'Non défini';
    }

    /**
     * Accessor : Formater la durée
     */
    public function getDureeFormatteeAttribute()
    {
        if (!$this->duree_estimee_minutes) {
            return 'Non définie';
        }

        $heures = floor($this->duree_estimee_minutes / 60);
        $minutes = $this->duree_estimee_minutes % 60;

        if ($heures > 0 && $minutes > 0) {
            return "{$heures}h{$minutes}";
        } elseif ($heures > 0) {
            return "{$heures}h";
        } else {
            return "{$minutes}min";
        }
    }
}