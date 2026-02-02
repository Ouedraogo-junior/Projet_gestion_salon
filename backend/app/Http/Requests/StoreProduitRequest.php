<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProduitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && in_array($this->user()->role, ['gerant', 'gestionnaire']);
    }

    public function rules(): array
    {
        return [
            // Informations générales
            'nom' => ['required', 'string', 'max:255'],
            'reference' => ['nullable', 'string', 'max:50', 'unique:produits,reference'],
            'description' => ['nullable', 'string', 'max:1000'],
            'categorie_id' => ['required', 'exists:categories,id'],
            'marque' => ['nullable', 'string', 'max:100'],
            'fournisseur' => ['nullable', 'string', 'max:100'],
            'type_stock_principal' => ['required', Rule::in(['vente', 'utilisation', 'mixte'])],

            // Prix
            'prix_achat' => ['required', 'numeric', 'min:0'],
            'prix_vente' => ['required', 'numeric', 'min:0', 'gt:prix_achat'],
            'prix_promo' => ['nullable', 'numeric', 'min:0', 'lt:prix_vente'],
            'date_debut_promo' => ['nullable', 'date', 'required_with:prix_promo'],
            'date_fin_promo' => ['nullable', 'date', 'after:date_debut_promo', 'required_with:prix_promo'],

            // Stocks - conditionnels selon type_stock_principal
            'stock_vente' => ['nullable', 'integer', 'min:0'],
            'stock_utilisation' => ['nullable', 'integer', 'min:0'],
            
            // Seuils OPTIONNELS (nullable)
            'seuil_alerte' => ['nullable', 'integer', 'min:0'],
            'seuil_critique' => ['nullable', 'integer', 'min:0', 'lte:seuil_alerte'],
            'seuil_alerte_utilisation' => ['nullable', 'integer', 'min:0'],
            'seuil_critique_utilisation' => ['nullable', 'integer', 'min:0', 'lte:seuil_alerte_utilisation'],

            // Autres
            'quantite_min_commande' => ['nullable', 'integer', 'min:1'],
            'delai_livraison_jours' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],

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
            'nom.required' => 'Le nom du produit est obligatoire.',
            'nom.max' => 'Le nom ne peut pas dépasser 255 caractères.',
            'reference.unique' => 'Cette référence existe déjà.',
            'categorie_id.required' => 'La catégorie est obligatoire.',
            'categorie_id.exists' => 'Cette catégorie n\'existe pas.',
            'type_stock_principal.required' => 'Le type de stock est obligatoire.',
            'type_stock_principal.in' => 'Le type de stock doit être : vente, utilisation ou mixte.',
            
            'prix_achat.required' => 'Le prix d\'achat est obligatoire.',
            'prix_achat.min' => 'Le prix d\'achat doit être positif.',
            'prix_vente.required' => 'Le prix de vente est obligatoire.',
            'prix_vente.min' => 'Le prix de vente doit être positif.',
            'prix_vente.gt' => 'Le prix de vente doit être supérieur au prix d\'achat.',
            'prix_promo.lt' => 'Le prix promo doit être inférieur au prix de vente.',
            'date_debut_promo.required_with' => 'La date de début est obligatoire si prix promo défini.',
            'date_fin_promo.after' => 'La date de fin doit être après la date de début.',
            
            'stock_vente.min' => 'Le stock vente ne peut pas être négatif.',
            'stock_utilisation.min' => 'Le stock utilisation ne peut pas être négatif.',
            'seuil_critique.lte' => 'Le seuil critique doit être ≤ au seuil d\'alerte.',
            'seuil_critique_utilisation.lte' => 'Le seuil critique utilisation doit être ≤ au seuil alerte.',
            
            'photo.image' => 'Le fichier doit être une image.',
            'photo.mimes' => 'Format accepté : jpeg, png, jpg, webp.',
            'photo.max' => 'L\'image ne doit pas dépasser 2 Mo.',
            
            'attributs.*.max' => 'La valeur de l\'attribut ne peut pas dépasser 255 caractères.',
        ];
    }
}