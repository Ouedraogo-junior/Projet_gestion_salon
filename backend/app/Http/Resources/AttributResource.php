<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttributResource extends JsonResource
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
            'type_valeur' => $this->type_valeur,
            'type_valeur_libelle' => $this->type_valeur_libelle,
            'valeurs_possibles' => $this->valeurs_possibles,
            'unite' => $this->unite,
            'obligatoire' => $this->obligatoire,
            'ordre' => $this->ordre,
            
            // Informations pivot si chargé depuis une catégorie
            'pivot' => $this->when(
                $this->relationLoaded('pivot') && $this->pivot,
                [
                    'obligatoire' => $this->pivot->obligatoire ?? false,
                    'ordre' => $this->pivot->ordre ?? 0,
                ]
            ),
            
            // Relations
            'categories' => CategorieResource::collection($this->whenLoaded('categories')),
            
            // Compteurs
            'nombre_categories' => $this->whenCounted('categories'),
            
            // Timestamps
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}