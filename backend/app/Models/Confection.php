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
        'variante_id',
        'user_id',
        'categorie_id',
        'nom_produit',
        'quantite_produite',
        'destination',
        'description',
        'date_confection',
        'cout_matiere_premiere',
        'cout_main_oeuvre',
        'cout_total',
        'prix_vente_unitaire',
        'statut',
    ];

    protected $casts = [
        'quantite_produite'    => 'integer',
        'date_confection'      => 'date',
        'cout_matiere_premiere' => 'decimal:2',
        'cout_main_oeuvre'     => 'decimal:2',
        'cout_total'           => 'decimal:2',
        'prix_vente_unitaire'  => 'decimal:2',
        'created_at'           => 'datetime',
        'updated_at'           => 'datetime',
    ];

    // ========================================
    // BOOT
    // ========================================

    protected static function booted(): void
    {
        static::creating(function ($confection) {
            if (!$confection->numero_confection) {
                $confection->numero_confection = self::genererNumero();
            }
            if (!$confection->destination) {
                $confection->destination = 'vente';
            }
        });
    }

    // ========================================
    // RELATIONS
    // ========================================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class);
    }

    /**
     * Variante produite (résultat de la confection)
     */
    public function variante(): BelongsTo
    {
        return $this->belongsTo(ProduitVariante::class, 'variante_id');
    }

    public function details(): HasMany
    {
        return $this->hasMany(ConfectionDetail::class);
    }

    public function attributs(): HasMany
    {
        return $this->hasMany(ConfectionAttribut::class);
    }

    public function mouvements(): HasMany
    {
        return $this->hasMany(MouvementStock::class, 'confection_id');
    }

    // ========================================
    // SCOPES
    // ========================================

    public function scopeEnCours($query)
    {
        return $query->where('statut', 'en_cours');
    }

    public function scopeTerminees($query)
    {
        return $query->where('statut', 'terminee');
    }

    public function scopeAnnulees($query)
    {
        return $query->where('statut', 'annulee');
    }

    public function scopePeriode($query, $dateDebut, $dateFin)
    {
        return $query->whereBetween('date_confection', [$dateDebut, $dateFin]);
    }

    public function scopePourUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopePourDestination($query, string $destination)
    {
        return $query->where('destination', $destination);
    }

    // ========================================
    // HELPERS
    // ========================================

    public function isTerminee(): bool
    {
        return $this->statut === 'terminee';
    }

    public function isEnCours(): bool
    {
        return $this->statut === 'en_cours';
    }

    public function isAnnulee(): bool
    {
        return $this->statut === 'annulee';
    }

    public function getStatutLibelleAttribute(): string
    {
        return match($this->statut) {
            'en_cours'  => 'En cours',
            'terminee'  => 'Terminée',
            'annulee'   => 'Annulée',
            default     => 'Inconnu',
        };
    }

    public function getDestinationLibelleAttribute(): string
    {
        return match($this->destination) {
            'vente'       => 'Vente',
            'utilisation' => 'Utilisation salon',
            'mixte'       => 'Mixte (vente + utilisation)',
            default       => 'Non défini',
        };
    }

    // ========================================
    // CALCULS
    // ========================================

    public function calculerCoutTotal(): float
    {
        $coutMatierePremiere = $this->details()->sum('prix_total');
        $coutMainOeuvre      = $this->cout_main_oeuvre ?? 0;
        return $coutMatierePremiere + $coutMainOeuvre;
    }

    public function getMargeUnitaireAttribute(): float
    {
        if (!$this->prix_vente_unitaire || $this->quantite_produite <= 0) {
            return 0;
        }
        $coutUnitaire = $this->cout_total / $this->quantite_produite;
        return $this->prix_vente_unitaire - $coutUnitaire;
    }

    public function getTauxMargeAttribute(): float
    {
        if (!$this->prix_vente_unitaire || $this->cout_total <= 0) {
            return 0;
        }
        $coutUnitaire = $this->cout_total / $this->quantite_produite;
        return (($this->prix_vente_unitaire - $coutUnitaire) / $this->prix_vente_unitaire) * 100;
    }

    // ========================================
    // MÉTHODES MÉTIER
    // ========================================

    public function terminer(): bool
    {
        if ($this->statut === 'terminee') {
            return false;
        }

        DB::beginTransaction();
        try {
            // Créer le produit parent + variante dans le catalogue
            $variante = $this->creerProduitCatalogue();

            // Enregistrer l'entrée en stock selon la destination
            $this->enregistrerEntreeStock($variante);

            // Déduire les matières premières du stock utilisation de chaque variante utilisée
            foreach ($this->details as $detail) {
                MouvementStock::enregistrerMouvement(
                    varianteId:    $detail->variante_id,
                    typeStock:     'utilisation',
                    typeMouvement: 'sortie',
                    quantite:      $detail->quantite_utilisee,
                    motif:         "Utilisé pour confection {$this->numero_confection}",
                    confectionId:  $this->id
                );
            }

            $this->update([
                'cout_matiere_premiere' => $this->details()->sum('prix_total'),
                'cout_total'            => $this->calculerCoutTotal(),
                'statut'                => 'terminee',
                'variante_id'           => $variante->id,
            ]);

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function creerProduitCatalogue(): ProduitVariante
    {
        $coutUnitaire = $this->cout_total / $this->quantite_produite;

        // Créer le produit parent
        $produit = Produit::create([
            'nom'          => $this->nom_produit,
            'description'  => $this->description,
            'categorie_id' => $this->categorie_id,
            'is_active'    => true,
        ]);

        // Créer la variante
        $variante = ProduitVariante::create([
            'produit_id'           => $produit->id,
            'prix_achat'           => $coutUnitaire,
            'prix_vente'           => $this->prix_vente_unitaire ?? round($coutUnitaire * 1.5, 2),
            'type_stock_principal' => $this->destination,
            'stock_vente'          => 0,
            'stock_utilisation'    => 0,
            'statut_validation'    => 'valide',
            'cree_par'             => $this->user_id,
        ]);

        // Ajouter les attributs à la variante
        foreach ($this->attributs as $confectionAttribut) {
            ProduitAttributValeur::definirValeur(
                $variante->id,
                $confectionAttribut->attribut_id,
                $confectionAttribut->valeur
            );
        }

        return $variante;
    }

    private function enregistrerEntreeStock(ProduitVariante $variante): void
    {
        $motif = "Confection {$this->numero_confection} - {$this->nom_produit}";

        switch ($this->destination) {
            case 'vente':
                MouvementStock::enregistrerMouvement(
                    varianteId:    $variante->id,
                    typeStock:     'vente',
                    typeMouvement: 'entree',
                    quantite:      $this->quantite_produite,
                    motif:         $motif,
                    confectionId:  $this->id
                );
                break;

            case 'utilisation':
                MouvementStock::enregistrerMouvement(
                    varianteId:    $variante->id,
                    typeStock:     'utilisation',
                    typeMouvement: 'entree',
                    quantite:      $this->quantite_produite,
                    motif:         $motif,
                    confectionId:  $this->id
                );
                break;

            case 'mixte':
                $quantiteVente        = (int) floor($this->quantite_produite / 2);
                $quantiteUtilisation  = $this->quantite_produite - $quantiteVente;

                MouvementStock::enregistrerMouvement(
                    varianteId:    $variante->id,
                    typeStock:     'vente',
                    typeMouvement: 'entree',
                    quantite:      $quantiteVente,
                    motif:         $motif . ' (vente)',
                    confectionId:  $this->id
                );

                MouvementStock::enregistrerMouvement(
                    varianteId:    $variante->id,
                    typeStock:     'utilisation',
                    typeMouvement: 'entree',
                    quantite:      $quantiteUtilisation,
                    motif:         $motif . ' (utilisation)',
                    confectionId:  $this->id
                );
                break;
        }
    }

    public function annuler(?string $motif = null): bool
    {
        if ($this->statut !== 'en_cours') {
            return false;
        }

        return $this->update([
            'statut'      => 'annulee',
            'description' => $this->description . "\n[ANNULÉE] " . $motif,
        ]);
    }

    private static function genererNumero(): string
    {
        $prefix  = 'CONF';
        $date    = now()->format('Ymd');
        $dernier = self::whereDate('created_at', today())->count() + 1;
        return sprintf('%s-%s-%04d', $prefix, $date, $dernier);
    }
}