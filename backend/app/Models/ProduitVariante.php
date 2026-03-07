<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProduitVariante extends Model
{
    protected $table = 'produit_variantes';

    protected $fillable = [
        'produit_id', 'reference',
        'prix_achat', 'prix_vente', 'prix_promo', 'date_debut_promo', 'date_fin_promo',
        'stock_vente', 'stock_utilisation', 'stock_reserve',
        'seuil_alerte', 'seuil_critique',
        'seuil_alerte_utilisation', 'seuil_critique_utilisation',
        'seuil_alerte_reserve', 'seuil_critique_reserve',
        'type_stock_principal',
        'devise_achat', 'prix_achat_devise_origine', 'taux_change',
        'frais_cmb', 'frais_transit', 'frais_bancaires', 'frais_courtier', 'frais_transport_local',
        'montant_total_achat', 'prix_achat_stock_total', 'moyen_paiement',
        'date_commande', 'date_reception', 'quantite_stock_commande',
        'quantite_min_commande', 'delai_livraison_jours', 'cbm', 'poids_kg',
        'statut_validation', 'valide_par', 'valide_le', 'motif_rejet', 'cree_par',
        'sync_status', 'is_active',
    ];

    protected $casts = [
        'prix_achat'               => 'decimal:2',
        'prix_vente'               => 'decimal:2',
        'prix_promo'               => 'decimal:2',
        'date_debut_promo'         => 'date',
        'date_fin_promo'           => 'date',
        'stock_vente'              => 'integer',
        'stock_utilisation'        => 'integer',
        'stock_reserve'            => 'integer',
        'seuil_alerte'             => 'integer',
        'seuil_critique'           => 'integer',
        'seuil_alerte_utilisation' => 'integer',
        'seuil_critique_utilisation' => 'integer',
        'seuil_alerte_reserve'     => 'integer',
        'seuil_critique_reserve'   => 'integer',
        'quantite_min_commande'    => 'integer',
        'delai_livraison_jours'    => 'integer',
        'quantite_stock_commande'  => 'integer',
        'is_active'                => 'boolean',
        'date_commande'            => 'date',
        'date_reception'           => 'date',
        'frais_cmb'                => 'decimal:2',
        'frais_transit'            => 'decimal:2',
        'frais_bancaires'          => 'decimal:2',
        'frais_courtier'           => 'decimal:2',
        'frais_transport_local'    => 'decimal:2',
        'montant_total_achat'      => 'decimal:2',
        'taux_change'              => 'decimal:4',
        'prix_achat_devise_origine' => 'decimal:4',
        'prix_achat_stock_total'   => 'decimal:2',
        'cbm'                      => 'decimal:4',
        'poids_kg'                 => 'decimal:2',
        'valide_le'                => 'datetime',
    ];

    protected $appends = [
        'marge_unitaire',
        'marge_pourcentage',
        'gain_total_commande',
        'gain_total_stock_actuel',
        'stock_total',
    ];

    // ========================================
    // RELATIONS
    // ========================================

    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }

    public function attributs(): BelongsToMany
    {
        return $this->belongsToMany(Attribut::class, 'produit_attribut_valeurs', 'variante_id', 'attribut_id')
            ->withPivot('valeur')
            ->withTimestamps();
    }

    public function valeursAttributs(): HasMany
    {
        return $this->hasMany(ProduitAttributValeur::class, 'variante_id');
    }

    public function mouvementsStock(): HasMany
    {
        return $this->hasMany(MouvementStock::class, 'variante_id');
    }

    public function transferts(): HasMany
    {
        return $this->hasMany(TransfertStock::class, 'variante_id');
    }

    public function validateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'valide_par');
    }

    public function createur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cree_par');
    }

    // ========================================
    // SCOPES
    // ========================================

    public function scopeValide($query)
    {
        return $query->where('statut_validation', 'valide');
    }

    public function scopeEnAttente($query)
    {
        return $query->where('statut_validation', 'en_attente');
    }

    public function scopeRejete($query)
    {
        return $query->where('statut_validation', 'rejete');
    }

    // ========================================
    // BOOT - RECALCUL AUTOMATIQUE
    // ========================================

    protected static function booted(): void
    {
        static::saving(function ($variante) {
            $variante->montant_total_achat      = $variante->calculerMontantTotal();
            $prixDevise = $variante->calculerPrixUnitaireDeviseOrigine();
            if ($prixDevise !== null) {
                $variante->prix_achat_devise_origine = $prixDevise;
            }
            $prixFCFA = $variante->calculerPrixAchatUnitaire();
            if ($prixFCFA !== null) {
                $variante->prix_achat = $prixFCFA;
            }
        });
    }

    // ========================================
    // CALCULS FINANCIERS
    // ========================================

    public function calculerMontantTotal(): float
    {
        $taux  = (float) ($this->taux_change ?? 1);
        $total = (float) ($this->prix_achat_stock_total ?? 0) * $taux;
        $total += (float) ($this->frais_cmb ?? 0);
        $total += (float) ($this->frais_transit ?? 0);
        $total += (float) ($this->frais_bancaires ?? 0);
        $total += (float) ($this->frais_courtier ?? 0);
        $total += (float) ($this->frais_transport_local ?? 0);
        return round($total, 2);
    }

    public function calculerPrixUnitaireDeviseOrigine(): ?float
    {
        $quantite   = (int) ($this->quantite_stock_commande ?? 0);
        $stockTotal = (float) ($this->prix_achat_stock_total ?? 0);
        if ($quantite <= 0 || $stockTotal <= 0) return null;
        return round($stockTotal / $quantite, 4);
    }

    public function calculerPrixAchatUnitaire(): ?float
    {
        $quantite = (int) ($this->quantite_stock_commande ?? 0);
        if ($quantite <= 0) return null;
        return round($this->calculerMontantTotal() / $quantite, 2);
    }

    // ========================================
    // ACCESSEURS
    // ========================================

    public function getMargeUnitaireAttribute(): float
    {
        return round((float) ($this->prix_vente ?? 0) - (float) ($this->prix_achat ?? 0), 2);
    }

    public function getMargePourcentageAttribute(): float
    {
        if (!$this->prix_achat || (float) $this->prix_achat == 0) return 0;
        return round(($this->marge_unitaire / (float) $this->prix_achat) * 100, 2);
    }

    public function getGainTotalCommandeAttribute(): float
    {
        return round($this->marge_unitaire * (int) ($this->quantite_stock_commande ?? 0), 2);
    }

    public function getGainTotalStockActuelAttribute(): float
    {
        return round($this->marge_unitaire * $this->stock_total, 2);
    }

    public function getStockTotalAttribute(): int
    {
        return (int) ($this->stock_vente ?? 0)
             + (int) ($this->stock_utilisation ?? 0)
             + (int) ($this->stock_reserve ?? 0);
    }

    // ========================================
    // HELPERS STOCK
    // ========================================

    public function isStockVenteAlerte(): bool
    {
        return $this->seuil_alerte !== null && $this->stock_vente <= $this->seuil_alerte;
    }

    public function isStockUtilisationAlerte(): bool
    {
        return $this->seuil_alerte_utilisation !== null && $this->stock_utilisation <= $this->seuil_alerte_utilisation;
    }

    public function isAlerteReserve(): bool
    {
        return $this->seuil_alerte_reserve !== null && $this->stock_reserve <= $this->seuil_alerte_reserve;
    }

    public function isCritiqueReserve(): bool
    {
        return $this->seuil_critique_reserve !== null && $this->stock_reserve <= $this->seuil_critique_reserve;
    }

    public function isValide(): bool
    {
        return $this->statut_validation === 'valide';
    }

    // ========================================
    // HELPERS ATTRIBUTS
    // ========================================

    public function getAttributsFormates(): array
    {
        return $this->valeursAttributs()
            ->with('attribut')
            ->get()
            ->mapWithKeys(fn($v) => [$v->attribut->nom => $v->attribut->formaterValeur($v->valeur)])
            ->toArray();
    }

    public function setAttribut(int $attributId, $valeur): void
    {
        ProduitAttributValeur::definirValeur($this->id, $attributId, $valeur);
    }

    public function getAttribut(int $attributId): ?string
    {
        return $this->valeursAttributs()
            ->where('attribut_id', $attributId)
            ->value('valeur');
    }
}