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
        'type_stock_principal',
        'seuil_alerte',
        'seuil_critique',
        'seuil_alerte_utilisation',
        'seuil_critique_utilisation',
        'photo_url',
        'quantite_min_commande',
        'delai_livraison_jours',
        'is_active',
        'sync_status',
        'visible_public',
        'salon_id',
    ];

    // AJOUTEZ CECI
    protected $casts = [
        'prix_achat' => 'decimal:2',
        'prix_vente' => 'decimal:2',
        'prix_promo' => 'decimal:2',
        'date_debut_promo' => 'date',
        'date_fin_promo' => 'date',
        'stock_vente' => 'integer',
        'stock_utilisation' => 'integer',
        'seuil_alerte' => 'integer',
        'seuil_critique' => 'integer',
        'seuil_alerte_utilisation' => 'integer',
        'seuil_critique_utilisation' => 'integer',
        'quantite_min_commande' => 'integer',
        'delai_livraison_jours' => 'integer',
        'is_active' => 'boolean',
        'visible_public' => 'boolean',
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

    // SUPPRIMEZ CET ACCESSEUR car il est redondant
    // public function getStockVenteAttribute(): int
    // {
    //     return $this->stock_vente; // Ceci crée une boucle infinie !
    // }

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
}