<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RendezVous extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'rendez_vous';

    protected $fillable = [
        'client_id',
        'coiffeur_id',
        'type_prestation_id',
        'date_heure',
        'duree_minutes',
        'prix_estime',
        'statut',
        'notes',
        'acompte_demande',
        'acompte_montant',
        'acompte_paye',
        'sms_confirmation_envoye',
        'sms_rappel_24h_envoye',
        'sms_rappel_2h_envoye',
        'motif_annulation',
        'date_annulation',
        'sync_status',
    ];

    protected $casts = [
        'date_heure' => 'datetime',
        'duree_minutes' => 'integer',
        'prix_estime' => 'decimal:2',
        'acompte_demande' => 'boolean',
        'acompte_montant' => 'decimal:2',
        'acompte_paye' => 'boolean',
        'sms_confirmation_envoye' => 'boolean',
        'sms_rappel_24h_envoye' => 'boolean',
        'sms_rappel_2h_envoye' => 'boolean',
        'date_annulation' => 'datetime',
    ];

    /**
     * Relation : Un rendez-vous appartient à un client
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Relation : Un rendez-vous appartient à un coiffeur (user)
     */
    public function coiffeur()
    {
        return $this->belongsTo(User::class, 'coiffeur_id');
    }

    public function coiffeurs()
    {
        return $this->belongsToMany(
            User::class, 
            'coiffeur_rendez_vous', 
            'rendez_vous_id', 
            'user_id'
        )->withTimestamps();
    }

    /**
     * Relation : Un rendez-vous appartient à un type de prestation
     */
    public function typePrestation()
    {
        return $this->belongsTo(TypePrestation::class, 'type_prestation_id');
    }

    /**
     * Scope : Rendez-vous à venir
     */
    public function scopeAvenir($query)
    {
        return $query->where('date_heure', '>', now());
    }

    /**
     * Scope : Rendez-vous passés
     */
    public function scopePasses($query)
    {
        return $query->where('date_heure', '<', now());
    }

    /**
     * Scope : Rendez-vous du jour
     */
    public function scopeDuJour($query)
    {
        return $query->whereDate('date_heure', today());
    }

    /**
     * Scope : Par statut
     */
    public function scopeParStatut($query, $statut)
    {
        return $query->where('statut', $statut);
    }

    /**
     * Scope : Rendez-vous confirmés
     */
    public function scopeConfirmes($query)
    {
        return $query->where('statut', 'confirme');
    }

    /**
     * Scope : Pour un coiffeur spécifique
     */
    public function scopePourCoiffeur($query, $coiffeurId)
    {
        return $query->where('coiffeur_id', $coiffeurId);
    }

    /**
     * Scope : Pour un client spécifique
     */
    public function scopePourClient($query, $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    /**
     * Accessor : Date formatée
     */
    public function getDateFormatteeAttribute()
    {
        return $this->date_heure->format('d/m/Y à H:i');
    }

    /**
     * Accessor : Heure de fin calculée
     */
    public function getHeureFinAttribute()
    {
        return $this->date_heure->copy()->addMinutes($this->duree_minutes);
    }

    /**
     * Accessor : Statut formaté
     */
    public function getStatutFormateAttribute()
    {
        return match($this->statut) {
            'en_attente' => 'En attente',
            'confirme' => 'Confirmé',
            'en_cours' => 'En cours',
            'termine' => 'Terminé',
            'annule' => 'Annulé',
            'no_show' => 'Absent',
            default => $this->statut,
        };
    }

    /**
     * Accessor : Couleur du badge de statut (pour l'UI)
     */
    public function getStatutCouleurAttribute()
    {
        return match($this->statut) {
            'en_attente' => 'warning',
            'confirme' => 'info',
            'en_cours' => 'primary',
            'termine' => 'success',
            'annule' => 'danger',
            'no_show' => 'secondary',
            default => 'secondary',
        };
    }

    /**
     * Vérifier si le rendez-vous est modifiable
     */
    public function estModifiable()
    {
        return in_array($this->statut, ['en_attente', 'confirme']);
    }

    /**
     * Vérifier si le rendez-vous peut être annulé
     */
    public function peutEtreAnnule()
    {
        return !in_array($this->statut, ['termine', 'annule', 'no_show']);
    }

    /**
     * Marquer comme confirmé
     */
    public function confirmer()
    {
        $this->update(['statut' => 'confirme']);
    }

    /**
     * Marquer comme en cours
     */
    public function demarrer()
    {
        $this->update(['statut' => 'en_cours']);
    }

    /**
     * Marquer comme terminé
     */
    public function terminer()
    {
        $this->update(['statut' => 'termine']);
    }

    /**
     * Annuler le rendez-vous
     */
    public function annuler($motif = null)
    {
        $this->update([
            'statut' => 'annule',
            'motif_annulation' => $motif,
            'date_annulation' => now(),
        ]);
    }

    /**
     * Marquer comme no-show
     */
    public function marquerNoShow()
    {
        $this->update(['statut' => 'no_show']);
    }

    /**
     * Vérifier s'il y a un conflit avec un autre rendez-vous
     */
    public function aConflitAvec($coiffeurId, $dateHeure, $dureeMinutes)
    {
        $heureDebut = $dateHeure;
        $heureFin = $dateHeure->copy()->addMinutes($dureeMinutes);

        return self::where('coiffeur_id', $coiffeurId)
            ->where('id', '!=', $this->id ?? 0)
            ->whereIn('statut', ['en_attente', 'confirme', 'en_cours'])
            ->where(function ($query) use ($heureDebut, $heureFin) {
                $query->whereBetween('date_heure', [$heureDebut, $heureFin])
                    ->orWhere(function ($q) use ($heureDebut, $heureFin) {
                        $q->where('date_heure', '<=', $heureDebut)
                          ->whereRaw('DATE_ADD(date_heure, INTERVAL duree_minutes MINUTE) > ?', [$heureDebut]);
                    });
            })
            ->exists();
    }
}