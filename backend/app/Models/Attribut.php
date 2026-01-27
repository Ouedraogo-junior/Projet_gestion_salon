<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Attribut extends Model
{
    use HasFactory;

    protected $table = 'attributs';

    protected $fillable = [
        'nom',
        'slug',
        'type_valeur',
        'valeurs_possibles',
        'unite',
        'obligatoire',
        'ordre',
    ];

    protected $casts = [
        'valeurs_possibles' => 'array',
        'obligatoire' => 'boolean',
        'ordre' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Génère automatiquement le slug lors de la création
     */
    protected static function booted()
    {
        static::creating(function ($attribut) {
            if (!$attribut->slug) {
                $attribut->slug = Str::slug($attribut->nom);
            }
        });
    }

    /**
     * Relation avec les catégories (many-to-many)
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Categorie::class, 'categorie_attribut')
                    ->withPivot('obligatoire', 'ordre')
                    ->withTimestamps();
    }

    /**
     * Scope pour les attributs obligatoires
     */
    public function scopeObligatoires($query)
    {
        return $query->where('obligatoire', true);
    }

    /**
     * Scope pour les attributs optionnels
     */
    public function scopeOptionnels($query)
    {
        return $query->where('obligatoire', false);
    }

    /**
     * Scope pour trier par ordre
     */
    public function scopeOrdonnes($query)
    {
        return $query->orderBy('ordre');
    }

    /**
     * Vérifie si l'attribut est de type texte
     */
    public function isTexte(): bool
    {
        return $this->type_valeur === 'texte';
    }

    /**
     * Vérifie si l'attribut est de type nombre
     */
    public function isNombre(): bool
    {
        return $this->type_valeur === 'nombre';
    }

    /**
     * Vérifie si l'attribut est de type liste
     */
    public function isListe(): bool
    {
        return $this->type_valeur === 'liste';
    }

    /**
     * Valide une valeur pour cet attribut
     */
    public function validerValeur($valeur): bool
    {
        // Vérifier si obligatoire
        if ($this->obligatoire && empty($valeur)) {
            return false;
        }

        // Validation selon le type
        switch ($this->type_valeur) {
            case 'nombre':
                return is_numeric($valeur);
                
            case 'liste':
                return in_array($valeur, $this->valeurs_possibles ?? []);
                
            case 'texte':
            default:
                return is_string($valeur);
        }
    }

    /**
     * Obtient le libellé du type de valeur
     */
    public function getTypeValeurLibelleAttribute(): string
    {
        return match($this->type_valeur) {
            'texte' => 'Texte',
            'nombre' => 'Nombre',
            'liste' => 'Liste déroulante',
            default => 'Inconnu',
        };
    }

    /**
     * Formate une valeur avec l'unité si elle existe
     */
    public function formaterValeur($valeur): string
    {
        if ($this->unite) {
            return $valeur . ' ' . $this->unite;
        }
        
        return (string) $valeur;
    }

    /**
     * Ajoute une valeur possible (pour type liste)
     */
    public function ajouterValeurPossible(string $valeur): bool
    {
        if ($this->type_valeur !== 'liste') {
            return false;
        }

        $valeurs = $this->valeurs_possibles ?? [];
        
        if (!in_array($valeur, $valeurs)) {
            $valeurs[] = $valeur;
            return $this->update(['valeurs_possibles' => $valeurs]);
        }

        return false;
    }

    /**
     * Supprime une valeur possible
     */
    public function supprimerValeurPossible(string $valeur): bool
    {
        if ($this->type_valeur !== 'liste') {
            return false;
        }

        $valeurs = $this->valeurs_possibles ?? [];
        $index = array_search($valeur, $valeurs);

        if ($index !== false) {
            unset($valeurs[$index]);
            return $this->update(['valeurs_possibles' => array_values($valeurs)]);
        }

        return false;
    }
}