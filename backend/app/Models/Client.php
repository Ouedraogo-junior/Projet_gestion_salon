<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nom',
        'prenom',
        'telephone',
        'email',
        'date_naissance',
        'adresse',
        'date_premiere_visite',
        'date_derniere_visite',
        'points_fidelite',
        'montant_total_depense',
        'notes',
        'is_active',
        'sync_status',
    ];

    protected $casts = [
        'date_naissance' => 'date',
        'date_premiere_visite' => 'date',
        'date_derniere_visite' => 'date',
        'points_fidelite' => 'integer',
        'montant_total_depense' => 'decimal:2',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = ['nom_complet', 'est_vip', 'jours_depuis_derniere_visite'];

    /**
     * Accesseurs
     */
    public function getNomCompletAttribute(): string
    {
        return "{$this->prenom} {$this->nom}";
    }

    public function getEstVipAttribute(): bool
    {
        return $this->points_fidelite >= 500;
    }

    public function getJoursDepuisderniereVisiteAttribute(): ?int
    {
        if (!$this->date_derniere_visite) {
            return null;
        }
        return now()->diffInDays($this->date_derniere_visite);
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeVip($query)
    {
        return $query->where('points_fidelite', '>=', 500);
    }

    public function scopeInactifs($query, int $jours = 180)
    {
        return $query->where('date_derniere_visite', '<=', now()->subDays($jours))
                    ->orWhereNull('date_derniere_visite');
    }

    public function scopeActifs($query, int $jours = 90)
    {
        return $query->where('date_derniere_visite', '>=', now()->subDays($jours));
    }

    public function scopeAnniversaireDuMois($query)
    {
        return $query->whereMonth('date_naissance', now()->month);
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('nom', 'ILIKE', "%{$search}%")
              ->orWhere('prenom', 'ILIKE', "%{$search}%")
              ->orWhere('telephone', 'LIKE', "%{$search}%");
        });
    }

    /**
     * Méthodes métier
     */
    public function ajouterPoints(int $montant): void
    {
        // 1 point par 1000 FCFA
        $points = floor($montant / 1000);
        $this->increment('points_fidelite', $points);
    }

    public function utiliserPoints(int $points): bool
    {
        if ($this->points_fidelite >= $points) {
            $this->decrement('points_fidelite', $points);
            return true;
        }
        return false;
    }

    public function updateLastVisit(): void
    {
        $this->update(['date_derniere_visite' => now()]);
    }

    /**
     * Relations
     */
    public function rendezVous()
    {
        return $this->hasMany(RendezVous::class);
    }

    public function ventes()
    {
        return $this->hasMany(Vente::class);
    }

    public function photos()
    {
        return $this->hasMany(PhotoClient::class);
    }

    /**
     * Vérifie si le client a des problèmes signalés
     */
    public function hasProblemes(): bool
    {
        return $this->prestations()
            ->whereNotNull('problemes_rencontres')
            ->exists();
    }

    /**
     * Obtient les problèmes récents
     */
    public function getProblemes()
    {
        return $this->prestations()
            ->whereNotNull('problemes_rencontres')
            ->orderBy('date_prestation', 'desc')
            ->pluck('problemes_rencontres');
    }

    /**
     * Obtient les recommandations pour le client
     */
    public function getRecommandations()
    {
        return $this->prestations()
            ->whereNotNull('recommandations')
            ->orderBy('date_prestation', 'desc')
            ->first()?->recommandations;
    }

    /**
     * Obtient le nombre de visites
     */
    public function getNombreVisites(): int
    {
        return $this->prestations()->count();
    }

    /**
     * Obtient la prestation la plus récente
     */
    public function getDernierePrestationAttribute()
    {
        return $this->prestations()
            ->orderBy('date_prestation', 'desc')
            ->first();
    }


    /**
     * Relation avec les prestations détaillées
     */
    public function prestations(): HasMany
    {
        return $this->hasMany(PrestationClient::class);
    }

    /**
     * Obtient l'historique complet des prestations
     */
    public function getHistoriquePrestations()
    {
        return $this->prestations()
            ->with(['typePrestation', 'coiffeur'])
            ->orderBy('date_prestation', 'desc')
            ->get();
    }

}