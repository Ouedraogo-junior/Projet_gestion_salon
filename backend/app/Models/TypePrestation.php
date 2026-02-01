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
        'salon_id',
        'acompte_requis',
        'acompte_montant',
        'acompte_pourcentage',
    ];

    protected $casts = [
        'duree_estimee_minutes' => 'integer',
        'prix_base' => 'decimal:2',
        'actif' => 'boolean',
        'ordre' => 'integer',
        'acompte_requis' => 'boolean',
        'acompte_montant' => 'decimal:2',
        'acompte_pourcentage' => 'decimal:2',
    ];

    /**
     * Relation : Un type de prestation a plusieurs rendez-vous
     */
    public function rendezVous()
    {
        return $this->hasMany(RendezVous::class, 'type_prestation_id');
    }

    /**
     * Relation : Un type de prestation est dans plusieurs détails de vente
     */
    public function venteDetails()
    {
        return $this->hasMany(VenteDetail::class, 'prestation_id');
    }

    /**
     * Relation : Un type de prestation a plusieurs prestations clients (historique technique)
     */
    public function prestationsClients()
    {
        return $this->hasMany(PrestationClient::class, 'type_prestation_id');
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
     * Scope : Alias pour compatibilité
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('ordre', 'asc');
    }

    /**
     * Accessor : Formater le prix
     */
    public function getPrixFormateAttribute()
    {
        return $this->prix_base ? number_format($this->prix_base, 0, ',', ' ') . ' FCFA' : 'Non défini';
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
            return "{$heures}h {$minutes}min";
        } elseif ($heures > 0) {
            return "{$heures}h";
        } else {
            return "{$minutes}min";
        }
    }
}