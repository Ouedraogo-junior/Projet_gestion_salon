<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMouvementStockRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && in_array($this->user()->role, ['gerant', 'gestionnaire']);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'produit_id' => ['required', 'exists:produits,id'],
            'type_stock' => ['required', Rule::in(['vente', 'utilisation'])],
            'type_mouvement' => ['required', Rule::in(['entree', 'ajustement'])],
            'quantite' => ['required', 'integer', 'min:1'],
            'motif' => ['required', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'produit_id.required' => 'Le produit est obligatoire.',
            'produit_id.exists' => 'Ce produit n\'existe pas.',
            'type_stock.required' => 'Le type de stock est obligatoire.',
            'type_stock.in' => 'Le type de stock doit être : vente ou utilisation.',
            'type_mouvement.required' => 'Le type de mouvement est obligatoire.',
            'type_mouvement.in' => 'Le type de mouvement doit être : entree ou ajustement.',
            'quantite.required' => 'La quantité est obligatoire.',
            'quantite.integer' => 'La quantité doit être un nombre entier.',
            'quantite.min' => 'La quantité doit être au moins 1.',
            'motif.required' => 'Le motif est obligatoire.',
            'motif.max' => 'Le motif ne peut pas dépasser 500 caractères.',
        ];
    }
}