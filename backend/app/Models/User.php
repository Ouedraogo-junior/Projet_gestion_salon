<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nom',
        'prenom',
        'telephone',
        'email',
        'code_pin',
        'role',
        'photo_url',
        'specialite',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'code_pin',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Attributs accesseurs
     */
    protected $appends = ['nom_complet'];

    /**
     * Get the nom complet
     */
    public function getNomCompletAttribute(): string
    {
        return "{$this->prenom} {$this->nom}";
    }

    /**
     * Hash automatique du code PIN
     */
    public function setCodePinAttribute($value): void
    {
        $this->attributes['code_pin'] = Hash::make($value);
    }

    /**
     * Vérifier le code PIN
     */
    public function verifyPin(string $pin): bool
    {
        return Hash::check($pin, $this->code_pin);
    }

    /**
     * Scope pour les utilisateurs actifs
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope pour filtrer par rôle
     */
    public function scopeRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Vérifier si l'utilisateur est gérant
     */
    public function isGerant(): bool
    {
        return $this->role === 'gerant';
    }

    /**
     * Vérifier si l'utilisateur est coiffeur
     */
    public function isCoiffeur(): bool
    {
        return $this->role === 'coiffeur';
    }

    /**
     * Vérifier si l'utilisateur est réceptionniste
     */
    public function isReceptionniste(): bool
    {
        return $this->role === 'receptionniste';
    }

    /**
     * Relations
     */
    public function rendezVous()
    {
        return $this->hasMany(RendezVous::class, 'coiffeur_id');
    }

    public function ventes()
    {
        return $this->hasMany(Vente::class, 'coiffeur_id');
    }

    public function mouvementsStock()
    {
        return $this->hasMany(MouvementStock::class);
    }

    /**
     * Relation avec les pointages
     */
    public function pointages(): HasMany
    {
        return $this->hasMany(Pointage::class);
    }

    /**
     * Relation avec les confections réalisées
     */
    public function confections(): HasMany
    {
        return $this->hasMany(Confection::class);
    }

    /**
     * Relation avec les transferts effectués
     */
    public function transferts(): HasMany
    {
        return $this->hasMany(TransfertStock::class);
    }

    /**
     * Relation avec les prestations réalisées (si coiffeur)
     */
    public function prestationsRealisees(): HasMany
    {
        return $this->hasMany(PrestationClient::class, 'coiffeur_id');
    }

    /**
     * Obtient le pointage du jour
     */
    public function getPointageAujourdhui(): ?Pointage
    {
        return $this->pointages()
            ->pourDate(today())
            ->first();
    }

    /**
     * Vérifie si l'employé a pointé aujourd'hui
     */
    public function aPointeAujourdhui(): bool
    {
        return $this->pointages()
            ->pourDate(today())
            ->exists();
    }

    /**
     * Enregistre un pointage
     */
    public function pointer(?string $heureArrivee = null): Pointage
    {
        return Pointage::pointer($this->id, $heureArrivee);
    }

    /**
     * Obtient les statistiques de présence du mois
     */
    public function getStatistiquesPresenceMois()
    {
        $pointages = $this->pointages()->moisEnCours()->get();
        
        return [
            'total_jours' => $pointages->count(),
            'presents' => $pointages->where('statut', 'present')->count(),
            'retards' => $pointages->where('statut', 'retard')->count(),
            'absents' => $pointages->where('statut', 'absent')->count(),
            'conges' => $pointages->where('statut', 'conge')->count(),
            'heures_travaillees' => $pointages->sum('minutes_travailles'),
        ];
    }

    /**
     * Obtient les confections du mois (si coiffeur)
     */
    public function getConfectionsMois()
    {
        return $this->confections()
            ->whereMonth('date_confection', now()->month)
            ->whereYear('date_confection', now()->year)
            ->get();
    }

    /**
     * Obtient les prestations du mois (si coiffeur)
     */
    public function getPrestationsMois()
    {
        return $this->prestationsRealisees()
            ->whereMonth('date_prestation', now()->month)
            ->whereYear('date_prestation', now()->year)
            ->get();
    }

    /**
     * Calcule le CA généré par le coiffeur ce mois
     */
    public function getCaMois(): float
    {
        return $this->prestationsRealisees()
            ->whereMonth('date_prestation', now()->month)
            ->whereYear('date_prestation', now()->year)
            ->sum('montant_total');
    }
}