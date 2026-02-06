<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProduitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && in_array($this->user()->role, ['gerant', 'gestionnaire']);
    }

    public function rules(): array
    {
        $produitId = $this->route('produit');

        return [
            // Informations générales
            'nom' => ['sometimes', 'string', 'max:255'],
            'reference' => ['nullable', 'string', 'max:50', Rule::unique('produits', 'reference')->ignore($produitId)],
            'description' => ['nullable', 'string', 'max:1000'],
            'categorie_id' => ['sometimes', 'exists:categories,id'],
            'marque' => ['nullable', 'string', 'max:100'],
            'fournisseur' => ['nullable', 'string', 'max:100'],
            'type_stock_principal' => ['sometimes', Rule::in(['vente', 'utilisation', 'mixte', 'reserve'])],

            // Prix
            'prix_achat' => ['sometimes', 'numeric', 'min:0'],
            'prix_vente' => ['sometimes', 'numeric', 'min:0'],
            'prix_promo' => ['nullable', 'numeric', 'min:0'],
            'date_debut_promo' => ['nullable', 'date'],
            'date_fin_promo' => ['nullable', 'date', 'after:date_debut_promo'],

            // Seuils OPTIONNELS (nullable)
            'seuil_alerte' => ['nullable', 'integer', 'min:0'],
            'seuil_critique' => ['nullable', 'integer', 'min:0'],
            'seuil_alerte_utilisation' => ['nullable', 'integer', 'min:0'],
            'seuil_critique_utilisation' => ['nullable', 'integer', 'min:0'],

            // Autres
            'quantite_min_commande' => ['nullable', 'integer', 'min:1'],
            'delai_livraison_jours' => ['nullable', 'integer', 'min:1'],
            'is_active' => 'sometimes|boolean',
            'visible_public' => 'sometimes|boolean',

            // Attributs dynamiques
            'attributs' => ['nullable', 'array'],
            'attributs.*' => ['nullable', 'string', 'max:255'],

            // Photo
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'nom.max' => 'Le nom ne peut pas dépasser 255 caractères.',
            'reference.unique' => 'Cette référence existe déjà.',
            'categorie_id.exists' => 'Cette catégorie n\'existe pas.',
            'type_stock_principal.in' => 'Le type de stock doit être : vente, utilisation, mixte ou reserve.',
            
            'prix_achat.min' => 'Le prix d\'achat doit être positif.',
            'prix_vente.min' => 'Le prix de vente doit être positif.',
            'date_fin_promo.after' => 'La date de fin doit être après la date de début.',
            
            'photo.image' => 'Le fichier doit être une image.',
            'photo.mimes' => 'Format accepté : jpeg, png, jpg, webp.',
            'photo.max' => 'L\'image ne doit pas dépasser 2 Mo.',
            
            'attributs.*.max' => 'La valeur de l\'attribut ne peut pas dépasser 255 caractères.',
        ];
    }
}