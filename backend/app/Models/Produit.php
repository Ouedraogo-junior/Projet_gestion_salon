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
        'nom',
        'reference',
        'description',
        'categorie_id',
        'marque',
        'fournisseur',
        'prix_achat',
        'prix_vente',
        'prix_promo',
        'date_debut_promo',
        'date_fin_promo',
        'stock_vente',
        'stock_utilisation',
        'stock_reserve',
        'type_stock_principal',
        'seuil_alerte',
        'seuil_critique',
        'seuil_alerte_utilisation',
        'seuil_critique_utilisation',
        'seuil_alerte_reserve',
        'seuil_critique_reserve',
        'photo_url',
        'quantite_min_commande',
        'delai_livraison_jours',
        'is_active',
        'sync_status',
        'visible_public',
        'salon_id',
        'date_commande',
        'devise_achat',
        'frais_cmb',
        'frais_transit',
        'moyen_paiement',
        'date_reception',
        'montant_total_achat',
        'taux_change',
        'prix_achat_devise_origine',
        'prix_achat_stock_total',
        'quantite_stock_commande',
        'cbm',
        'poids_kg',
        'frais_bancaires',
        'frais_courtier',
        'frais_transport_local',
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
        'taux_change' => 'decimal:2',
        'prix_achat_devise_origine' => 'decimal:2',
        'prix_achat_stock_total' => 'decimal:2',
        'quantite_stock_commande' => 'integer',
        'cbm' => 'decimal:4',
        'poids_kg' => 'decimal:2',
        'frais_bancaires' => 'decimal:2',
        'frais_courtier' => 'decimal:2',
        'frais_transport_local' => 'decimal:2',
    ];

    // Relation avec la catégorie
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


    public function isStockVenteAlerte(): bool
    {
        return $this->stock_vente <= $this->seuil_alerte;
    }

    public function isStockUtilisationAlerte(): bool
    {
        return $this->stock_utilisation <= $this->seuil_alerte_utilisation;
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

    /**
     * Calculer automatiquement le montant total d'achat
     */
   public function calculerMontantTotal(): float
    {
        $total = (float) ($this->prix_achat_stock_total ?? 0);
        
        $total += (float) ($this->frais_cmb ?? 0);
        $total += (float) ($this->frais_transit ?? 0);
        $total += (float) ($this->frais_bancaires ?? 0);
        $total += (float) ($this->frais_courtier ?? 0);
        $total += (float) ($this->frais_transport_local ?? 0);
        
        return round($total, 2);
    }


    // Calculer le prix d'achat unitaire en tenant compte du taux de change
    public function calculerPrixAchatUnitaire(): ?float
    {
        if (!$this->quantite_stock_commande || $this->quantite_stock_commande <= 0) {
            return null;
        }
        
        $totalDeviseOrigine = $this->calculerMontantTotal();
        $prixUnitaireDevise = $totalDeviseOrigine / $this->quantite_stock_commande;
        
        return round($prixUnitaireDevise * ($this->taux_change ?? 1), 2);
    }


    /**
     * Enregistrer et calculer automatiquement le montant total
     */
    protected static function booted()
    {
        static::saving(function ($produit) {
            // Calculer montant total
            $produit->montant_total_achat = $produit->calculerMontantTotal();
            
            // Calculer prix unitaire automatiquement
            $prixCalcule = $produit->calculerPrixAchatUnitaire();
            if ($prixCalcule !== null) {
                $produit->prix_achat = $prixCalcule;
            }
        });
    }


    // Méthode pour gérer le stock de réserve
    public function ajusterStockReserve(int $quantite, string $operation = 'entree'): void
    {
        if ($operation === 'entree') {
            $this->increment('stock_reserve', $quantite);
        } else {
            $this->decrement('stock_reserve', $quantite);
        }
    }

    // Vérifier alerte réserve
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
}