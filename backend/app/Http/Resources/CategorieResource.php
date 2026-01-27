<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategorieResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'slug' => $this->slug,
            'description' => $this->description,
            'icone' => $this->icone,
            'couleur' => $this->couleur,
            'is_active' => $this->is_active,
            'ordre' => $this->ordre,
            
            // Compteurs
            'nombre_produits' => $this->whenCounted('produits'),
            'nombre_produits_actifs' => $this->when(
                $this->relationLoaded('produits'),
                fn() => $this->produits->where('is_active', true)->count()
            ),
            'nombre_attributs' => $this->whenCounted('attributs'),
            
            // Relations (chargées si eager loaded)
            'attributs' => AttributResource::collection($this->whenLoaded('attributs')),
            'produits' => ProduitResource::collection($this->whenLoaded('produits')),
            
            // Timestamps
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deleted_at?->format('Y-m-d H:i:s'),
        ];
    }
}