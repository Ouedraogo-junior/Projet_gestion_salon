<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategorieRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Seuls les gérants peuvent créer des catégories
        return $this->user() && $this->user()->role === 'gerant';
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:100', 'unique:categories,nom'],
            'description' => ['nullable', 'string', 'max:500'],
            'icone' => ['nullable', 'string', 'max:50'],
            'couleur' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'is_active' => ['boolean'],
            'ordre' => ['integer', 'min:0'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom de la catégorie est obligatoire.',
            'nom.unique' => 'Cette catégorie existe déjà.',
            'nom.max' => 'Le nom ne peut pas dépasser 100 caractères.',
            'description.max' => 'La description ne peut pas dépasser 500 caractères.',
            'couleur.regex' => 'La couleur doit être au format hexadécimal (#RRGGBB).',
            'ordre.min' => "L'ordre doit être un nombre positif.",
        ];
    }
}