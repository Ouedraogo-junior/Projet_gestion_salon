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
        return [
            // Produit parent
            'nom'            => ['sometimes', 'string', 'max:255'],
            'description'    => ['nullable', 'string', 'max:1000'],
            'categorie_id'   => ['sometimes', 'exists:categories,id'],
            'marque'         => ['nullable', 'string', 'max:100'],
            'fournisseur'    => ['nullable', 'string', 'max:100'],
            'visible_public' => ['sometimes', 'boolean'],
            'is_active'      => ['sometimes', 'boolean'],
            'photo'          => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],

            // Variantes (optionnel à l'update)
            'variantes'      => ['sometimes', 'array', 'min:1'],

            // Id variante (pour distinguer update vs create)
            'variantes.*.id' => ['nullable', 'exists:produit_variantes,id'],

            // Champs variante
            'variantes.*.reference' => [
                'nullable', 'string', 'max:50', 'distinct',
                Rule::unique('produit_variantes', 'reference')->ignore(
                    $this->getVarianteId()
                ),
            ],
            'variantes.*.type_stock_principal' => ['sometimes', Rule::in(['vente', 'utilisation', 'mixte', 'reserve'])],

            // Prix
            'variantes.*.prix_achat'       => ['sometimes', 'numeric', 'min:0'],
            'variantes.*.prix_vente'       => ['sometimes', 'numeric', 'min:0'],
            'variantes.*.prix_promo'       => ['nullable', 'numeric', 'min:0'],
            'variantes.*.date_debut_promo' => ['nullable', 'date'],
            'variantes.*.date_fin_promo'   => ['nullable', 'date', 'after:variantes.*.date_debut_promo'],

            // Stocks
            'variantes.*.stock_vente'       => ['sometimes', 'integer', 'min:0'],
            'variantes.*.stock_utilisation' => ['sometimes', 'integer', 'min:0'],
            'variantes.*.stock_reserve'     => ['sometimes', 'integer', 'min:0'],

            // Seuils
            'variantes.*.seuil_alerte'               => ['nullable', 'integer', 'min:0'],
            'variantes.*.seuil_critique'             => ['nullable', 'integer', 'min:0'],
            'variantes.*.seuil_alerte_utilisation'   => ['nullable', 'integer', 'min:0'],
            'variantes.*.seuil_critique_utilisation' => ['nullable', 'integer', 'min:0'],
            'variantes.*.seuil_alerte_reserve'       => ['nullable', 'integer', 'min:0'],
            'variantes.*.seuil_critique_reserve'     => ['nullable', 'integer', 'min:0'],

            // Achat / Import
            'variantes.*.devise_achat'            => ['nullable', 'string', 'max:10'],
            'variantes.*.taux_change'             => ['nullable', 'numeric', 'min:0'],
            'variantes.*.prix_achat_stock_total'  => ['nullable', 'numeric', 'min:0'],
            'variantes.*.quantite_stock_commande' => ['nullable', 'integer', 'min:1'],
            'variantes.*.frais_cmb'               => ['nullable', 'numeric', 'min:0'],
            'variantes.*.frais_transit'           => ['nullable', 'numeric', 'min:0'],
            'variantes.*.frais_bancaires'         => ['nullable', 'numeric', 'min:0'],
            'variantes.*.frais_courtier'          => ['nullable', 'numeric', 'min:0'],
            'variantes.*.frais_transport_local'   => ['nullable', 'numeric', 'min:0'],
            'variantes.*.moyen_paiement'          => ['nullable', 'string', 'max:50'],
            'variantes.*.date_commande'           => ['nullable', 'date'],
            'variantes.*.date_reception'          => ['nullable', 'date'],
            'variantes.*.quantite_min_commande'   => ['nullable', 'integer', 'min:1'],
            'variantes.*.delai_livraison_jours'   => ['nullable', 'integer', 'min:1'],
            'variantes.*.cbm'                     => ['nullable', 'numeric', 'min:0'],
            'variantes.*.poids_kg'                => ['nullable', 'numeric', 'min:0'],

            // Attributs
            'variantes.*.attributs'    => ['nullable', 'array'],
            'variantes.*.attributs.*' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'nom.max'                               => 'Le nom ne peut pas dépasser 255 caractères.',
            'categorie_id.exists'                   => 'Cette catégorie n\'existe pas.',

            'variantes.min'                         => 'Au moins une variante est obligatoire.',
            'variantes.*.id.exists'                 => 'Cette variante n\'existe pas.',
            'variantes.*.reference.unique'          => 'Cette référence existe déjà.',
            'variantes.*.reference.distinct'        => 'Les références des variantes doivent être uniques.',
            'variantes.*.type_stock_principal.in'   => 'Le type de stock doit être : vente, utilisation, mixte ou reserve.',

            'variantes.*.prix_achat.min'            => 'Le prix d\'achat doit être positif.',
            'variantes.*.prix_vente.min'            => 'Le prix de vente doit être positif.',
            'variantes.*.date_fin_promo.after'      => 'La date de fin doit être après la date de début.',

            'variantes.*.stock_vente.min'           => 'Le stock vente ne peut pas être négatif.',
            'variantes.*.stock_utilisation.min'     => 'Le stock utilisation ne peut pas être négatif.',
            'variantes.*.stock_reserve.min'         => 'Le stock réserve ne peut pas être négatif.',

            'photo.image'                           => 'Le fichier doit être une image.',
            'photo.mimes'                           => 'Format accepté : jpeg, png, jpg, webp.',
            'photo.max'                             => 'L\'image ne doit pas dépasser 2 Mo.',

            'variantes.*.attributs.*.max'           => 'La valeur de l\'attribut ne peut pas dépasser 255 caractères.',
        ];
    }

    // ========================================
    // HELPER
    // ========================================

    /**
     * Récupère l'id de la variante en cours de mise à jour
     * pour exclure sa propre référence de la règle unique
     */
    private function getVarianteId(): ?int
    {
        $variantes = $this->input('variantes', []);
        foreach ($variantes as $v) {
            if (!empty($v['id'])) {
                return (int) $v['id'];
            }
        }
        return null;
    }
}