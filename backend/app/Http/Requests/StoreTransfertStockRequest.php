<?php

namespace App\Http\Requests;

use App\Models\Produit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransfertStockRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && in_array($this->user()->role, ['gerant', 'receptionniste']);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'produit_id' => ['required', 'exists:produits,id'],
            'type_transfert' => ['required', Rule::in(['vente_vers_utilisation', 'utilisation_vers_vente'])],
            'quantite' => ['required', 'integer', 'min:1'],
            'motif' => ['nullable', 'string', 'max:500'],
            'auto_valider' => ['boolean'],
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
            'type_transfert.required' => 'Le type de transfert est obligatoire.',
            'type_transfert.in' => 'Type invalide. Utilisez : vente_vers_utilisation ou utilisation_vers_vente.',
            'quantite.required' => 'La quantité est obligatoire.',
            'quantite.integer' => 'La quantité doit être un nombre entier.',
            'quantite.min' => 'La quantité doit être au moins 1.',
            'motif.max' => 'Le motif ne peut pas dépasser 500 caractères.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Vérifier la disponibilité du stock source
            $produit = Produit::find($this->produit_id);
            
            if ($produit) {
                // ✅ CORRECTION: Utiliser stock_vente au lieu de stock_actuel
                $stockSource = $this->type_transfert === 'vente_vers_utilisation' 
                    ? $produit->stock_vente      // ← CORRIGÉ
                    : $produit->stock_utilisation;
                
                if ($stockSource < $this->quantite) {
                    $typeStock = $this->type_transfert === 'vente_vers_utilisation' ? 'vente' : 'utilisation';
                    
                    $validator->errors()->add(
                        'quantite', 
                        "Stock {$typeStock} insuffisant. Disponible : {$stockSource}"
                    );
                }
            }
        });
    }
}