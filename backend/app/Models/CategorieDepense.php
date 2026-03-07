<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class CategorieDepense extends Model
{
    use SoftDeletes;

    protected $table = 'categories_depenses';

    protected $fillable = ['nom', 'slug', 'couleur', 'icone', 'is_active', 'ordre'];

    protected static function booted(): void
    {
        static::creating(fn($m) => $m->slug ??= Str::slug($m->nom));
        static::updating(fn($m) => $m->slug = Str::slug($m->nom));
    }

    public function depenses(): HasMany
    {
        return $this->hasMany(Depense::class, 'categorie_depense_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('ordre')->orderBy('nom');
    }
}