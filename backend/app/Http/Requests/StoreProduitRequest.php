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
            // Produit parent
            'nom'          => ['required', 'string', 'max:255'],
            'description'  => ['nullable', 'string', 'max:1000'],
            'categorie_id' => ['required', 'exists:categories,id'],
            'marque'       => ['nullable', 'string', 'max:100'],
            'fournisseur'  => ['nullable', 'string', 'max:100'],
            'visible_public' => ['boolean'],
            'salon_id'     => ['nullable', 'exists:salons,id'],
            'photo'        => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],

            // Variantes (au moins une obligatoire)
            'variantes'    => ['required', 'array', 'min:1'],

            // Champs de chaque variante
            'variantes.*.reference'          => ['nullable', 'string', 'max:50', 'distinct', 'unique:produit_variantes,reference'],
            'variantes.*.type_stock_principal' => ['required', Rule::in(['vente', 'utilisation', 'mixte', 'reserve'])],

            // Prix
            'variantes.*.prix_achat'         => ['required', 'numeric', 'min:0'],
            'variantes.*.prix_vente'         => ['required', 'numeric', 'min:0', 'gt:variantes.*.prix_achat'],
            'variantes.*.prix_promo'         => ['nullable', 'numeric', 'min:0', 'lt:variantes.*.prix_vente'],
            'variantes.*.date_debut_promo'   => ['nullable', 'date', 'required_with:variantes.*.prix_promo'],
            'variantes.*.date_fin_promo'     => ['nullable', 'date', 'after:variantes.*.date_debut_promo', 'required_with:variantes.*.prix_promo'],

            // Stocks
            'variantes.*.stock_vente'        => ['nullable', 'integer', 'min:0'],
            'variantes.*.stock_utilisation'  => ['nullable', 'integer', 'min:0'],
            'variantes.*.stock_reserve'      => ['nullable', 'integer', 'min:0'],

            // Seuils
            'variantes.*.seuil_alerte'                => ['nullable', 'integer', 'min:0'],
            'variantes.*.seuil_critique'              => ['nullable', 'integer', 'min:0', 'lte:variantes.*.seuil_alerte'],
            'variantes.*.seuil_alerte_utilisation'    => ['nullable', 'integer', 'min:0'],
            'variantes.*.seuil_critique_utilisation'  => ['nullable', 'integer', 'min:0', 'lte:variantes.*.seuil_alerte_utilisation'],
            'variantes.*.seuil_alerte_reserve'        => ['nullable', 'integer', 'min:0'],
            'variantes.*.seuil_critique_reserve'      => ['nullable', 'integer', 'min:0', 'lte:variantes.*.seuil_alerte_reserve'],

            // Achat / Import
            'variantes.*.devise_achat'              => ['nullable', 'string', 'max:10'],
            'variantes.*.taux_change'               => ['nullable', 'numeric', 'min:0'],
            'variantes.*.prix_achat_stock_total'    => ['nullable', 'numeric', 'min:0'],
            'variantes.*.quantite_stock_commande'   => ['nullable', 'integer', 'min:1'],
            'variantes.*.frais_cmb'                 => ['nullable', 'numeric', 'min:0'],
            'variantes.*.frais_transit'             => ['nullable', 'numeric', 'min:0'],
            'variantes.*.frais_bancaires'           => ['nullable', 'numeric', 'min:0'],
            'variantes.*.frais_courtier'            => ['nullable', 'numeric', 'min:0'],
            'variantes.*.frais_transport_local'     => ['nullable', 'numeric', 'min:0'],
            'variantes.*.moyen_paiement'            => ['nullable', 'string', 'max:50'],
            'variantes.*.date_commande'             => ['nullable', 'date'],
            'variantes.*.date_reception'            => ['nullable', 'date'],
            'variantes.*.quantite_min_commande'     => ['nullable', 'integer', 'min:1'],
            'variantes.*.delai_livraison_jours'     => ['nullable', 'integer', 'min:1'],
            'variantes.*.cbm'                       => ['nullable', 'numeric', 'min:0'],
            'variantes.*.poids_kg'                  => ['nullable', 'numeric', 'min:0'],

            // Attributs de la variante
            'variantes.*.attributs'    => ['nullable', 'array'],
            'variantes.*.attributs.*' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required'                          => 'Le nom du produit est obligatoire.',
            'nom.max'                               => 'Le nom ne peut pas dépasser 255 caractères.',
            'categorie_id.required'                 => 'La catégorie est obligatoire.',
            'categorie_id.exists'                   => 'Cette catégorie n\'existe pas.',

            'variantes.required'                    => 'Au moins une variante est obligatoire.',
            'variantes.min'                         => 'Au moins une variante est obligatoire.',

            'variantes.*.reference.unique'          => 'Cette référence existe déjà.',
            'variantes.*.reference.distinct'        => 'Les références des variantes doivent être uniques.',
            'variantes.*.type_stock_principal.required' => 'Le type de stock est obligatoire.',
            'variantes.*.type_stock_principal.in'   => 'Le type de stock doit être : vente, utilisation, mixte ou reserve.',

            'variantes.*.prix_achat.required'       => 'Le prix d\'achat est obligatoire.',
            'variantes.*.prix_achat.min'            => 'Le prix d\'achat doit être positif.',
            'variantes.*.prix_vente.required'       => 'Le prix de vente est obligatoire.',
            'variantes.*.prix_vente.min'            => 'Le prix de vente doit être positif.',
            'variantes.*.prix_vente.gt'             => 'Le prix de vente doit être supérieur au prix d\'achat.',
            'variantes.*.prix_promo.lt'             => 'Le prix promo doit être inférieur au prix de vente.',
            'variantes.*.date_debut_promo.required_with' => 'La date de début est obligatoire si prix promo défini.',
            'variantes.*.date_fin_promo.after'      => 'La date de fin doit être après la date de début.',
            'variantes.*.date_fin_promo.required_with' => 'La date de fin est obligatoire si prix promo défini.',

            'variantes.*.stock_vente.min'           => 'Le stock vente ne peut pas être négatif.',
            'variantes.*.stock_utilisation.min'     => 'Le stock utilisation ne peut pas être négatif.',
            'variantes.*.stock_reserve.min'         => 'Le stock réserve ne peut pas être négatif.',

            'variantes.*.seuil_critique.lte'        => 'Le seuil critique doit être ≤ au seuil d\'alerte.',
            'variantes.*.seuil_critique_utilisation.lte' => 'Le seuil critique utilisation doit être ≤ au seuil alerte.',
            'variantes.*.seuil_critique_reserve.lte' => 'Le seuil critique réserve doit être ≤ au seuil alerte réserve.',

            'photo.image'                           => 'Le fichier doit être une image.',
            'photo.mimes'                           => 'Format accepté : jpeg, png, jpg, webp.',
            'photo.max'                             => 'L\'image ne doit pas dépasser 2 Mo.',

            'variantes.*.attributs.*.max'           => 'La valeur de l\'attribut ne peut pas dépasser 255 caractères.',
        ];
    }
}