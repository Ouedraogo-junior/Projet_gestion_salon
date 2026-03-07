<?php
namespace App\Http\Requests;
use App\Models\ProduitVariante;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransfertStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && in_array($this->user()->role, ['gerant', 'gestionnaire']);
    }

    public function rules(): array
    {
        return [
            'variante_id' => ['required', 'exists:produit_variantes,id'],
            'type_transfert' => ['required', Rule::in([
                'vente_vers_utilisation', 'utilisation_vers_vente',
                'reserve_vers_vente', 'reserve_vers_utilisation',
                'vente_vers_reserve', 'utilisation_vers_reserve'
            ])],
            'quantite'                    => ['required', 'integer', 'min:1'],
            'motif'                       => ['nullable', 'string', 'max:500'],
            'auto_valider'                => ['boolean'],
            'seuil_alerte'                => ['nullable', 'integer', 'min:0'],
            'seuil_critique'              => ['nullable', 'integer', 'min:0'],
            'seuil_alerte_utilisation'    => ['nullable', 'integer', 'min:0'],
            'seuil_critique_utilisation'  => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'variante_id.required'     => 'La variante du produit est obligatoire.',
            'variante_id.exists'       => 'Cette variante n\'existe pas.',
            'type_transfert.required'  => 'Le type de transfert est obligatoire.',
            'type_transfert.in'        => 'Type de transfert invalide.',
            'quantite.required'        => 'La quantité est obligatoire.',
            'quantite.integer'         => 'La quantité doit être un nombre entier.',
            'quantite.min'             => 'La quantité doit être au moins 1.',
            'motif.max'                => 'Le motif ne peut pas dépasser 500 caractères.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $variante = ProduitVariante::find($this->variante_id);
            if (!$variante) return;

            $stockSource = match($this->type_transfert) {
                'vente_vers_utilisation', 'vente_vers_reserve'           => $variante->stock_vente,
                'utilisation_vers_vente', 'utilisation_vers_reserve'     => $variante->stock_utilisation,
                'reserve_vers_vente', 'reserve_vers_utilisation'         => $variante->stock_reserve,
                default => 0
            };

            if ($stockSource < $this->quantite) {
                $typeStock = match($this->type_transfert) {
                    'vente_vers_utilisation', 'vente_vers_reserve'       => 'vente',
                    'utilisation_vers_vente', 'utilisation_vers_reserve' => 'utilisation',
                    'reserve_vers_vente', 'reserve_vers_utilisation'     => 'réserve',
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