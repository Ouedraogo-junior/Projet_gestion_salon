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
        return $this->user() && in_array($this->user()->role, ['gerant', 'gestionnaire']);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'produit_id' => ['required', 'exists:produits,id'],
            'type_transfert' => ['required', Rule::in(['vente_vers_utilisation', 'utilisation_vers_vente', 'reserve_vers_vente', 'reserve_vers_utilisation', 'vente_vers_reserve', 'utilisation_vers_reserve'])],
            'quantite' => ['required', 'integer', 'min:1'],
            'motif' => ['nullable', 'string', 'max:500'],
            'auto_valider' => ['boolean'],
             // ✅ AJOUT: Seuils conditionnels pour transferts depuis réserve
            'seuil_alerte' => 'nullable|integer|min:0',
            'seuil_critique' => 'nullable|integer|min:0',
            'seuil_alerte_utilisation' => 'nullable|integer|min:0',
            'seuil_critique_utilisation' => 'nullable|integer|min:0',
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
            $produit = Produit::find($this->produit_id);
            
            if (!$produit) {
                return;
            }
            
            // Déterminer le stock source selon le type de transfert
            $stockSource = match($this->type_transfert) {
                'vente_vers_utilisation', 'vente_vers_reserve' => $produit->stock_vente,
                'utilisation_vers_vente', 'utilisation_vers_reserve' => $produit->stock_utilisation,
                'reserve_vers_vente', 'reserve_vers_utilisation' => $produit->stock_reserve,
                default => 0
            };
            
            // Vérifier que le stock source est suffisant
            if ($stockSource < $this->quantite) {
                $typeStock = match($this->type_transfert) {
                    'vente_vers_utilisation', 'vente_vers_reserve' => 'vente',
                    'utilisation_vers_vente', 'utilisation_vers_reserve' => 'utilisation',
                    'reserve_vers_vente', 'reserve_vers_utilisation' => 'réserve',
                    default => 'source'
                };
                
                $validator->errors()->add(
                    'quantite', 
                    "Stock {$typeStock} insuffisant. Disponible : {$stockSource}"
                );
            }
        });
    }
}