<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Pointage extends Model
{
    use HasFactory;

    protected $table = 'pointages';

    protected $fillable = [
        'user_id',
        'pointeur_id', 
        'date_pointage',
        'heure_arrivee',
        'heure_depart',
        'minutes_travailles',
        'statut',
        'type_pointage', 
        'commentaire',
    ];

    protected $casts = [
        'date_pointage' => 'date',
        'heure_arrivee' => 'datetime:H:i',
        'heure_depart' => 'datetime:H:i',
        'minutes_travailles' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relation avec l'employé
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation avec le pointeur (celui qui a enregistré le pointage)
     */
    public function pointeur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pointeur_id');
    }

    /**
     * Scope pour une date spécifique
     */
    public function scopePourDate($query, $date)
    {
        return $query->whereDate('date_pointage', $date);
    }

    /**
     * Scope pour un employé spécifique
     */
    public function scopePourUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope pour une période
     */
    public function scopePeriode($query, $dateDebut, $dateFin)
    {
        return $query->whereBetween('date_pointage', [$dateDebut, $dateFin]);
    }

    /**
     * Scope pour le mois en cours
     */
    public function scopeMoisEnCours($query)
    {
        return $query->whereMonth('date_pointage', now()->month)
                     ->whereYear('date_pointage', now()->year);
    }

    /**
     * Scope pour les présents
     */
    public function scopePresents($query)
    {
        return $query->where('statut', 'present');
    }

    /**
     * Scope pour les retards
     */
    public function scopeRetards($query)
    {
        return $query->where('statut', 'retard');
    }

    /**
     * Scope pour les absents
     */
    public function scopeAbsents($query)
    {
        return $query->where('statut', 'absent');
    }

    /**
     * Vérifie si l'employé est présent
     */
    public function isPresent(): bool
    {
        return $this->statut === 'present';
    }

    /**
     * Vérifie si l'employé est en retard
     */
    public function isRetard(): bool
    {
        return $this->statut === 'retard';
    }

    /**
     * Vérifie si l'employé est absent
     */
    public function isAbsent(): bool
    {
        return $this->statut === 'absent';
    }

    /**
     * Vérifie si l'employé est en congé
     */
    public function isConge(): bool
    {
        return $this->statut === 'conge';
    }

    /**
     * Calcule les minutes travaillées
     */
    public function calculerMinutesTravaillees(): int
    {
        if (!$this->heure_arrivee || !$this->heure_depart) {
            return 0;
        }

        $arrivee = Carbon::parse($this->heure_arrivee);
        $depart = Carbon::parse($this->heure_depart);

        return $arrivee->diffInMinutes($depart);
    }

    /**
     * Enregistre l'heure de départ et calcule les minutes
     */
    public function enregistrerDepart(string $heureDepart): bool
    {
        $minutes = $this->calculerMinutesTravailleesAvecDepart($heureDepart);
        
        return $this->update([
            'heure_depart' => $heureDepart,
            'minutes_travailles' => $minutes,
        ]);
    }

    /**
     * Calcule les minutes avec une heure de départ donnée
     */
    private function calculerMinutesTravailleesAvecDepart(string $heureDepart): int
    {
        $arrivee = Carbon::parse($this->heure_arrivee);
        $depart = Carbon::parse($heureDepart);

        return $arrivee->diffInMinutes($depart);
    }

    /**
     * Obtient les heures travaillées (format HH:MM)
     */
    public function getHeuresTravailleesAttribute(): string
    {
        if (!$this->minutes_travailles) {
            return '00:00';
        }

        $heures = floor($this->minutes_travailles / 60);
        $minutes = $this->minutes_travailles % 60;

        return sprintf('%02d:%02d', $heures, $minutes);
    }

    /**
     * Obtient le libellé du statut
     */
    public function getStatutLibelleAttribute(): string
    {
        return match($this->statut) {
            'present' => 'Présent',
            'retard' => 'En retard',
            'absent' => 'Absent',
            'conge' => 'Congé',
            default => 'Inconnu',
        };
    }

    /**
     * Vérifie si l'employé est encore au travail
     */
    public function isEnCours(): bool
    {
        return $this->heure_arrivee && !$this->heure_depart;
    }

    /**
     * Pointage d'arrivée
     */
    public static function pointer(
        int $userId,
        ?string $heureArrivee = null,
        string $statut = 'present',
        ?string $commentaire = null
    ): self {
        $heureArrivee = $heureArrivee ?? now()->format('H:i');
        
        return self::create([
            'user_id' => $userId,
            'pointeur_id' => auth()->id(),
            'date_pointage' => now()->toDateString(),
            'heure_arrivee' => $heureArrivee,
            'statut' => $statut,
            'type_pointage' => 'manuel',
            'commentaire' => $commentaire,
        ]);
    }

    /**
     * Détermine automatiquement le statut selon l'heure d'arrivée
     * (Par exemple, retard si après 8h30)
     */
    public static function determinerStatut(string $heureArrivee, string $heureDebut = '08:30'): string
    {
        $arrivee = Carbon::parse($heureArrivee);
        $debut = Carbon::parse($heureDebut);

        return $arrivee->gt($debut) ? 'retard' : 'present';
    }
}