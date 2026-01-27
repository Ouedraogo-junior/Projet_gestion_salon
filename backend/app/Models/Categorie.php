<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Categorie extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'nom',
        'slug',
        'description',
        'icone',
        'couleur',
        'is_active',
        'ordre'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'ordre' => 'integer',
    ];

    // Générer automatiquement le slug
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($categorie) {
            if (empty($categorie->slug)) {
                $categorie->slug = Str::slug($categorie->nom);
            }
        });
    }

    // Relation avec les produits
    public function produits()
    {
        return $this->hasMany(Produit::class, 'categorie_id');
    }

    // Scope pour les catégories actives
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope pour trier par ordre
    public function scopeOrdered($query)
    {
        return $query->orderBy('ordre');
    }

    /**
     * Relation avec les attributs (via table pivot)
     */
    public function attributs(): BelongsToMany
    {
        return $this->belongsToMany(Attribut::class, 'categorie_attribut')
                    ->withPivot('obligatoire', 'ordre')
                    ->orderByPivot('ordre')
                    ->withTimestamps();
    }

    /**
     * Relation avec les confections
     */
    public function confections(): HasMany
    {
        return $this->hasMany(Confection::class);
    }

    /**
     * Obtient les attributs obligatoires pour cette catégorie
     */
    public function getAttributsObligatoires()
    {
        return $this->attributs()->wherePivot('obligatoire', true)->get();
    }

    /**
     * Obtient les attributs optionnels pour cette catégorie
     */
    public function getAttributsOptionnels()
    {
        return $this->attributs()->wherePivot('obligatoire', false)->get();
    }

    /**
     * Associe un attribut à la catégorie
     */
    public function associerAttribut(int $attributId, bool $obligatoire = false, int $ordre = 0): void
    {
        $this->attributs()->attach($attributId, [
            'obligatoire' => $obligatoire,
            'ordre' => $ordre,
        ]);
    }

    /**
     * Dissocie un attribut de la catégorie
     */
    public function dissocierAttribut(int $attributId): void
    {
        $this->attributs()->detach($attributId);
    }
}