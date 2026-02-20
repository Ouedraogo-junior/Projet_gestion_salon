<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produit extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'nom', 'reference', 'description', 'categorie_id', 'marque', 'fournisseur',
        'prix_achat', 'prix_vente', 'prix_promo', 'date_debut_promo', 'date_fin_promo',
        'stock_vente', 'stock_utilisation', 'stock_reserve', 'type_stock_principal',
        'seuil_alerte', 'seuil_critique', 'seuil_alerte_utilisation', 'seuil_critique_utilisation',
        'seuil_alerte_reserve', 'seuil_critique_reserve',
        'photo_url', 'quantite_min_commande', 'delai_livraison_jours',
        'is_active', 'sync_status', 'visible_public', 'salon_id',
        'date_commande', 'devise_achat', 'frais_cmb', 'frais_transit', 'moyen_paiement',
        'date_reception', 'montant_total_achat', 'taux_change', 'prix_achat_devise_origine',
        'prix_achat_stock_total', 'quantite_stock_commande', 'cbm', 'poids_kg',
        'frais_bancaires', 'frais_courtier', 'frais_transport_local',
        'statut_validation', 'valide_par', 'valide_le', 'motif_rejet', 'cree_par',
    ];

    protected $casts = [
        'prix_achat' => 'decimal:2',
        'prix_vente' => 'decimal:2',
        'prix_promo' => 'decimal:2',
        'date_debut_promo' => 'date',
        'date_fin_promo' => 'date',
        'stock_vente' => 'integer',
        'stock_utilisation' => 'integer',
        'stock_reserve' => 'integer',
        'seuil_alerte' => 'integer',
        'seuil_critique' => 'integer',
        'seuil_alerte_utilisation' => 'integer',
        'seuil_critique_utilisation' => 'integer',
        'seuil_alerte_reserve' => 'integer',
        'seuil_critique_reserve' => 'integer',
        'quantite_min_commande' => 'integer',
        'delai_livraison_jours' => 'integer',
        'is_active' => 'boolean',
        'visible_public' => 'boolean',
        'date_commande' => 'date',
        'date_reception' => 'date',
        'frais_cmb' => 'decimal:2',
        'frais_transit' => 'decimal:2',
        'montant_total_achat' => 'decimal:2',
        'taux_change' => 'decimal:4',
        'prix_achat_devise_origine' => 'decimal:4',
        'prix_achat_stock_total' => 'decimal:2',
        'quantite_stock_commande' => 'integer',
        'cbm' => 'decimal:4',
        'poids_kg' => 'decimal:2',
        'frais_bancaires' => 'decimal:2',
        'frais_courtier' => 'decimal:2',
        'frais_transport_local' => 'decimal:2',
        'valide_le' => 'datetime',
        'statut_validation' => 'string',
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

    public function categorie()
    {
        return $this->belongsTo(Categorie::class);
    }

    public function attributs(): BelongsToMany
    {
        return $this->belongsToMany(Attribut::class, 'produit_attribut_valeurs')
            ->withPivot('valeur')
            ->withTimestamps();
    }

    public function valeursAttributs(): HasMany
    {
        return $this->hasMany(ProduitAttributValeur::class);
    }

    public function mouvementsStock(): HasMany
    {
        return $this->hasMany(MouvementStock::class);
    }

    public function transferts(): HasMany
    {
        return $this->hasMany(TransfertStock::class);
    }

    public function validateur()
    {
        return $this->belongsTo(User::class, 'valide_par');
    }

    public function createur()
    {
        return $this->belongsTo(User::class, 'cree_par');
    }

    /// ========================================
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
    // CALCULS FINANCIERS
    // ========================================

    /**
     * Coût total du stock en FCFA :
     *   (prix_achat_stock_total × taux_change) + frais_cmb + frais_transit + ...
     * Les frais sont tous en FCFA, seul le prix stock est en devise étrangère.
     */
    public function calculerMontantTotal(): float
    {
        $taux = (float) ($this->taux_change ?? 1);

        // Prix stock converti en FCFA
        $total = (float) ($this->prix_achat_stock_total ?? 0) * $taux;

        // Frais déjà en FCFA
        $total += (float) ($this->frais_cmb ?? 0);
        $total += (float) ($this->frais_transit ?? 0);
        $total += (float) ($this->frais_bancaires ?? 0);
        $total += (float) ($this->frais_courtier ?? 0);
        $total += (float) ($this->frais_transport_local ?? 0);

        return round($total, 2);
    }

    /**
     * Prix unitaire dans la devise d'origine (stock seul, sans frais) :
     *   prix_achat_stock_total ÷ quantite_stock_commande
     * Stocké dans prix_achat_devise_origine pour affichage.
     */
    public function calculerPrixUnitaireDeviseOrigine(): ?float
    {
        $quantite = (int) ($this->quantite_stock_commande ?? 0);
        $stockTotal = (float) ($this->prix_achat_stock_total ?? 0);

        if ($quantite <= 0 || $stockTotal <= 0) {
            return null;
        }

        return round($stockTotal / $quantite, 4);
    }

    /**
     * Prix d'achat unitaire en FCFA (avec tous les frais) :
     *   montant_total_achat_FCFA ÷ quantite_stock_commande
     */
    public function calculerPrixAchatUnitaire(): ?float
    {
        $quantite = (int) ($this->quantite_stock_commande ?? 0);

        if ($quantite <= 0) {
            return null;
        }

        return round($this->calculerMontantTotal() / $quantite, 2);
    }

    // ========================================
    // BOOT - RECALCUL AUTOMATIQUE
    // ========================================

    protected static function booted()
    {
        static::saving(function ($produit) {
            // 1. Montant total du stock en FCFA
            $produit->montant_total_achat = $produit->calculerMontantTotal();

            // 2. Prix unitaire en devise d'origine (informatif)
            $prixDevise = $produit->calculerPrixUnitaireDeviseOrigine();
            if ($prixDevise !== null) {
                $produit->prix_achat_devise_origine = $prixDevise;
            }

            // 3. Prix d'achat unitaire FCFA (avec frais)
            $prixFCFA = $produit->calculerPrixAchatUnitaire();
            if ($prixFCFA !== null) {
                $produit->prix_achat = $prixFCFA;
            }
        });
    }

    // ========================================
    // ACCESSEURS MARGE & GAINS
    // ========================================

    public function getMargeUnitaireAttribute(): float
    {
        return round((float) ($this->prix_vente ?? 0) - (float) ($this->prix_achat ?? 0), 2);
    }

    public function getMargePourcentageAttribute(): float
    {
        if (!$this->prix_achat || (float) $this->prix_achat == 0) {
            return 0;
        }
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
        return $this->stock_vente <= $this->seuil_alerte;
    }

    public function isStockUtilisationAlerte(): bool
    {
        return $this->stock_utilisation <= $this->seuil_alerte_utilisation;
    }

    public function ajusterStockReserve(int $quantite, string $operation = 'entree'): void
    {
        if ($operation === 'entree') {
            $this->increment('stock_reserve', $quantite);
        } else {
            $this->decrement('stock_reserve', $quantite);
        }
    }

    public function isAlerteReserve(): bool
    {
        return $this->seuil_alerte_reserve !== null
            && $this->stock_reserve <= $this->seuil_alerte_reserve;
    }

    public function isCritiqueReserve(): bool
    {
        return $this->seuil_critique_reserve !== null
            && $this->stock_reserve <= $this->seuil_critique_reserve;
    }

    public function getAttributsFormates(): array
    {
        return $this->valeursAttributs()
            ->with('attribut')
            ->get()
            ->mapWithKeys(function ($valeur) {
                return [
                    $valeur->attribut->nom => $valeur->attribut->formaterValeur($valeur->valeur)
                ];
            })
            ->toArray();
    }

    public function setAttribut(int $attributId, $valeur): void
    {
        ProduitAttributValeur::definirValeur($this->id, $attributId, $valeur);
    }

    public function getAttribut(int $attributId): ?string
    {
        $valeur = $this->valeursAttributs()
            ->where('attribut_id', $attributId)
            ->first();

        return $valeur ? $valeur->valeur : null;
    }

    public function isValide(): bool
    {
        return $this->statut_validation === 'valide';
    }
}