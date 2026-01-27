<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAttributRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'gerant';
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $attributId = $this->route('attribut');

        return [
            'nom' => ['sometimes', 'string', 'max:100', Rule::unique('attributs', 'nom')->ignore($attributId)],
            'type_valeur' => ['sometimes', Rule::in(['texte', 'nombre', 'liste'])],
            'valeurs_possibles' => ['nullable', 'array'],
            'valeurs_possibles.*' => ['string', 'max:100'],
            'unite' => ['nullable', 'string', 'max:20'],
            'obligatoire' => ['boolean'],
            'ordre' => ['integer', 'min:0'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nom.unique' => 'Cet attribut existe déjà.',
            'nom.max' => 'Le nom ne peut pas dépasser 100 caractères.',
            'type_valeur.in' => 'Le type de valeur doit être : texte, nombre ou liste.',
            'unite.max' => "L'unité ne peut pas dépasser 20 caractères.",
            'ordre.min' => "L'ordre doit être un nombre positif.",
        ];
    }
}