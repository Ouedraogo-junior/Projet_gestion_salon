<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Confection extends Model
{
    use HasFactory;

    protected $table = 'confections';

    protected $fillable = [
        'numero_confection',
        'user_id',
        'categorie_id',
        'nom_produit',
        'quantite_produite',
        'description',
        'date_confection',
        'cout_matiere_premiere',
        'cout_main_oeuvre',
        'cout_total',
        'prix_vente_unitaire',
        'statut',
    ];

    protected $casts = [
        'quantite_produite' => 'integer',
        'date_confection' => 'date',
        'cout_matiere_premiere' => 'decimal:2',
        'cout_main_oeuvre' => 'decimal:2',
        'cout_total' => 'decimal:2',
        'prix_vente_unitaire' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Génère automatiquement le numéro de confection
     */
    protected static function booted()
    {
        static::creating(function ($confection) {
            if (!$confection->numero_confection) {
                $confection->numero_confection = self::genererNumero();
            }
        });
    }

    /**
     * Relation avec l'utilisateur (confectionneur)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation avec la catégorie du produit confectionné
     */
    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class);
    }

    /**
     * Relation avec les détails (matières premières utilisées)
     */
    public function details(): HasMany
    {
        return $this->hasMany(ConfectionDetail::class);
    }

    /**
     * Relation avec les attributs du produit confectionné
     */
    public function attributs(): HasMany
    {
        return $this->hasMany(ConfectionAttribut::class);
    }

    /**
     * Relation avec les mouvements de stock générés
     */
    public function mouvements(): HasMany
    {
        return $this->hasMany(MouvementStock::class, 'confection_id');
    }

    /**
     * Scope pour les confections en cours
     */
    public function scopeEnCours($query)
    {
        return $query->where('statut', 'en_cours');
    }

    /**
     * Scope pour les confections terminées
     */
    public function scopeTerminees($query)
    {
        return $query->where('statut', 'terminee');
    }

    /**
     * Scope pour les confections annulées
     */
    public function scopeAnnulees($query)
    {
        return $query->where('statut', 'annulee');
    }

    /**
     * Scope pour une période
     */
    public function scopePeriode($query, $dateDebut, $dateFin)
    {
        return $query->whereBetween('date_confection', [$dateDebut, $dateFin]);
    }

    /**
     * Scope pour un confectionneur spécifique
     */
    public function scopePourUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Vérifie si la confection est terminée
     */
    public function isTerminee(): bool
    {
        return $this->statut === 'terminee';
    }

    /**
     * Vérifie si la confection est en cours
     */
    public function isEnCours(): bool
    {
        return $this->statut === 'en_cours';
    }

    /**
     * Vérifie si la confection est annulée
     */
    public function isAnnulee(): bool
    {
        return $this->statut === 'annulee';
    }

    /**
     * Obtient le libellé du statut
     */
    public function getStatutLibelleAttribute(): string
    {
        return match($this->statut) {
            'en_cours' => 'En cours',
            'terminee' => 'Terminée',
            'annulee' => 'Annulée',
            default => 'Inconnu',
        };
    }

    /**
     * Calcule le coût total
     */
    public function calculerCoutTotal(): float
    {
        $coutMatierePremiere = $this->details()->sum('prix_total');
        $coutMainOeuvre = $this->cout_main_oeuvre ?? 0;

        return $coutMatierePremiere + $coutMainOeuvre;
    }

    /**
     * Calcule la marge unitaire
     */
    public function getMargeUnitaireAttribute(): float
    {
        if (!$this->prix_vente_unitaire || $this->quantite_produite <= 0) {
            return 0;
        }

        $coutUnitaire = $this->cout_total / $this->quantite_produite;
        return $this->prix_vente_unitaire - $coutUnitaire;
    }

    /**
     * Calcule le taux de marge
     */
    public function getTauxMargeAttribute(): float
    {
        if (!$this->prix_vente_unitaire || $this->cout_total <= 0) {
            return 0;
        }

        $coutUnitaire = $this->cout_total / $this->quantite_produite;
        return (($this->prix_vente_unitaire - $coutUnitaire) / $this->prix_vente_unitaire) * 100;
    }

    /**
     * Termine la confection et ajoute au stock
     */
    public function terminer(?string $typeStock = 'vente'): bool
    {
        if ($this->statut === 'terminee') {
            return false;
        }

        DB::beginTransaction();
        try {
            // Créer un produit dans le catalogue (optionnel)
            $produit = $this->creerProduitCatalogue();

            // Enregistrer l'entrée en stock
            if ($produit) {
                MouvementStock::enregistrerMouvement(
                    produitId: $produit->id,
                    typeStock: $typeStock,
                    typeMouvement: 'entree',
                    quantite: $this->quantite_produite,
                    motif: "Confection {$this->numero_confection} - {$this->nom_produit}",
                    confectionId: $this->id
                );
            }

            // Déduire les matières premières du stock utilisation
            foreach ($this->details as $detail) {
                MouvementStock::enregistrerMouvement(
                    produitId: $detail->produit_id,
                    typeStock: 'utilisation',
                    typeMouvement: 'sortie',
                    quantite: $detail->quantite_utilisee,
                    motif: "Utilisé pour confection {$this->numero_confection}",
                    confectionId: $this->id
                );
            }

            // Mettre à jour le coût total
            $this->update([
                'cout_matiere_premiere' => $this->details()->sum('prix_total'),
                'cout_total' => $this->calculerCoutTotal(),
                'statut' => 'terminee',
            ]);

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Crée un produit dans le catalogue à partir de la confection
     */
    private function creerProduitCatalogue(): ?Produit
    {
        if (!$this->prix_vente_unitaire) {
            return null;
        }

        $coutUnitaire = $this->cout_total / $this->quantite_produite;

        $produit = Produit::create([
            'nom' => $this->nom_produit,
            'description' => $this->description,
            'categorie_id' => $this->categorie_id,
            'prix_achat' => $coutUnitaire,
            'prix_vente' => $this->prix_vente_unitaire,
            'stock_actuel' => 0, // Le stock sera ajouté via le mouvement
            'type_stock_principal' => 'vente',
        ]);

        // Ajouter les attributs au produit
        foreach ($this->attributs as $confectionAttribut) {
            ProduitAttributValeur::definirValeur(
                $produit->id,
                $confectionAttribut->attribut_id,
                $confectionAttribut->valeur
            );
        }

        return $produit;
    }

    /**
     * Annule la confection
     */
    public function annuler(?string $motif = null): bool
    {
        if ($this->statut !== 'en_cours') {
            return false;
        }

        return $this->update([
            'statut' => 'annulee',
            'description' => $this->description . "\n[ANNULÉE] " . $motif,
        ]);
    }

    /**
     * Génère un numéro unique de confection
     */
    private static function genererNumero(): string
    {
        $prefix = 'CONF';
        $date = now()->format('Ymd');
        $dernier = self::whereDate('created_at', today())->count() + 1;
        
        return sprintf('%s-%s-%04d', $prefix, $date, $dernier);
    }
}