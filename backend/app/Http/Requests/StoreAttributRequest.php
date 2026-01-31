<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAttributRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'gestionnaire';
        // return $this->user() && in_array($this->user()->role, ['gestionnaire', 'gerant']);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:100', 'unique:attributs,nom'],
            'type_valeur' => ['required', Rule::in(['texte', 'nombre', 'liste'])],
            'valeurs_possibles' => ['nullable', 'array'], // ← MODIFIÉ: nullable au lieu de required_if
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
            'nom.required' => "Le nom de l'attribut est obligatoire.",
            'nom.unique' => 'Cet attribut existe déjà.',
            'nom.max' => 'Le nom ne peut pas dépasser 100 caractères.',
            'type_valeur.required' => 'Le type de valeur est obligatoire.',
            'type_valeur.in' => 'Le type de valeur doit être : texte, nombre ou liste.',
            'valeurs_possibles.array' => 'Les valeurs possibles doivent être un tableau.',
            'unite.max' => "L'unité ne peut pas dépasser 20 caractères.",
            'ordre.min' => "L'ordre doit être un nombre positif.",
        ];
    }

    /**
     * Prepare the data for validation.
     * 
     * SUPPRIMÉ: Ne plus forcer valeurs_possibles à null
     * On laisse le frontend gérer l'envoi d'un tableau vide [] ou avec des valeurs
     */
}