<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;


class Vente extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'ventes';

    protected $fillable = [
    'numero_facture',
    'client_id',
    'client_nom',              // ✅ AJOUTÉ
    'client_telephone',        // ✅ AJOUTÉ
    'coiffeur_id',
    'vendeur_id',              // ✅ AJOUTÉ
    'rendez_vous_id',
    'type_vente',              // ✅ AJOUTÉ
    'date_vente',
    'montant_prestations',
    'montant_produits',
    'montant_total_ht',
    'montant_reduction',
    'type_reduction',
    'montant_total_ttc',
    'mode_paiement',
    'montant_paye',
    'montant_rendu',
    'statut_paiement',
    'solde_restant',
    'recu_imprime',
    'points_gagnes',
    'points_utilises',
    'notes',
    'sync_status',
    ];

    protected $casts = [
        'date_vente' => 'datetime',
        'montant_prestations' => 'decimal:2',
        'montant_produits' => 'decimal:2',
        'montant_total_ht' => 'decimal:2',
        'montant_reduction' => 'decimal:2',
        'montant_total_ttc' => 'decimal:2',
        'montant_paye' => 'decimal:2',
        'montant_rendu' => 'decimal:2',
        'solde_restant' => 'decimal:2',
        'recu_imprime' => 'boolean',
        'points_gagnes' => 'integer',
        'points_utilises' => 'integer',
    ];

    protected $attributes = [
        'montant_prestations' => 0,
        'montant_produits' => 0,
        'montant_reduction' => 0,
        'montant_rendu' => 0,
        'statut_paiement' => 'paye',
        'solde_restant' => 0,
        'recu_imprime' => false,
        'points_gagnes' => 0,
        'points_utilises' => 0,
        'sync_status' => 'synced',
    ];

    /**
     * Relations
     */
    
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function coiffeur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coiffeur_id');
    }

    public function rendezVous(): BelongsTo
    {
        return $this->belongsTo(RendezVous::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(VenteDetail::class);
    }

    public function vendeur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendeur_id');
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(VentePaiement::class);
    }

    /**
     * Scopes
     */
    
    public function scopePayees($query)
    {
        return $query->where('statut_paiement', 'paye');
    }

    public function scopeImpayes($query)
    {
        return $query->whereIn('statut_paiement', ['impaye', 'partiel']);
    }

    

    public function scopeParPeriode($query, $dateDebut, $dateFin)
    {
        return $query->whereBetween('date_vente', [$dateDebut, $dateFin]);
    }

    public function scopeNonSynchronisees($query)
    {
        return $query->whereIn('sync_status', ['pending', 'conflict']);
    }


    /**
     * Méthodes utilitaires
     */
    
    public function calculerMontants(): void
    {
        $this->montant_prestations = $this->details()
            ->where('type_article', 'prestation')
            ->sum('prix_total');

        $this->montant_produits = $this->details()
            ->where('type_article', 'produit')
            ->sum('prix_total');

        $this->montant_total_ht = $this->montant_prestations + $this->montant_produits;
        $this->montant_total_ttc = $this->montant_total_ht - $this->montant_reduction;
        $this->solde_restant = $this->montant_total_ttc - $this->montant_paye;
        
        $this->updateStatutPaiement();
    }

    public function updateStatutPaiement(): void
    {
        if ($this->montant_paye >= $this->montant_total_ttc) {
            $this->statut_paiement = 'paye';
            $this->solde_restant = 0;
        } elseif ($this->montant_paye > 0) {
            $this->statut_paiement = 'partiel';
        } else {
            $this->statut_paiement = 'impaye';
        }
    }

    public function marquerCommeImprime(): bool
    {
        return $this->update(['recu_imprime' => true]);
    }

    public static function genererNumeroFacture(): string
    {
        $prefix = 'FACT-';
        $date = now()->format('Ymd');
        $derniere = static::whereDate('created_at', today())
            ->latest('id')
            ->first();
        
        $numero = $derniere ? ((int) substr($derniere->numero_facture, -4)) + 1 : 1;
        
        return $prefix . $date . '-' . str_pad($numero, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Boot method
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($vente) {
            if (empty($vente->numero_facture)) {
                $vente->numero_facture = static::genererNumeroFacture();
            }
        });
    }

    /**
     * Relation avec les mouvements de stock générés par cette vente
     */
    public function mouvementsStock(): HasMany
    {
        return $this->hasMany(MouvementStock::class);
    }

    /**
     * Relation avec la prestation détaillée (si applicable)
     */
    public function prestationClient(): HasOne
    {
        return $this->hasOne(PrestationClient::class);
    }

    /**
     * Vérifie si la vente a une prestation détaillée
     */
    public function hasPrestationDetaillee(): bool
    {
        return $this->prestationClient()->exists();
    }

    /**
     * Crée une prestation détaillée pour cette vente
     */
    public function creerPrestationDetaillee(array $data): PrestationClient
    {
        return PrestationClient::create(array_merge($data, [
            'vente_id' => $this->id,
            'client_id' => $this->client_id,
            'date_prestation' => $this->date_vente,
        ]));
    }

}