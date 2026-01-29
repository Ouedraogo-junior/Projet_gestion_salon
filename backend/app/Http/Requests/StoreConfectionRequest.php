<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConfectionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Ajuster selon votre logique d'autorisation
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:users,id',
            'categorie_id' => 'required|exists:categories,id',
            'nom_produit' => 'required|string|max:255',
            'quantite_produite' => 'required|integer|min:1',
            'destination' => 'required|in:vente,utilisation,mixte',
            'description' => 'nullable|string|max:1000',
            'date_confection' => 'required|date|before_or_equal:today',
            'cout_main_oeuvre' => 'nullable|numeric|min:0',
            'prix_vente_unitaire' => 'nullable|numeric|min:0',
            
            // Détails (matières premières)
            'details' => 'required|array|min:1',
            'details.*.produit_id' => 'required|exists:produits,id',
            'details.*.quantite_utilisee' => 'required|integer|min:1',
            'details.*.prix_unitaire' => 'required|numeric|min:0',
            
            // Attributs optionnels
            'attributs' => 'nullable|array',
            'attributs.*.attribut_id' => 'required_with:attributs|exists:attributs,id',
            'attributs.*.valeur' => 'required_with:attributs|string|max:255',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'user_id.required' => 'Le confectionneur est obligatoire',
            'user_id.exists' => 'Le confectionneur sélectionné n\'existe pas',
            
            'categorie_id.required' => 'La catégorie du produit est obligatoire',
            'categorie_id.exists' => 'La catégorie sélectionnée n\'existe pas',
            
            'nom_produit.required' => 'Le nom du produit est obligatoire',
            'nom_produit.max' => 'Le nom du produit ne peut dépasser 255 caractères',
            
            'quantite_produite.required' => 'La quantité produite est obligatoire',
            'quantite_produite.integer' => 'La quantité doit être un nombre entier',
            'quantite_produite.min' => 'La quantité doit être au moins 1',
            
            'destination.required' => 'La destination du produit est obligatoire',
            'destination.in' => 'La destination doit être : vente, utilisation ou mixte',
            
            'date_confection.required' => 'La date de confection est obligatoire',
            'date_confection.date' => 'La date de confection doit être une date valide',
            'date_confection.before_or_equal' => 'La date de confection ne peut être dans le futur',
            
            'cout_main_oeuvre.numeric' => 'Le coût de main d\'œuvre doit être un nombre',
            'cout_main_oeuvre.min' => 'Le coût de main d\'œuvre ne peut être négatif',
            
            'prix_vente_unitaire.numeric' => 'Le prix de vente doit être un nombre',
            'prix_vente_unitaire.min' => 'Le prix de vente ne peut être négatif',
            
            'details.required' => 'Au moins une matière première est requise',
            'details.array' => 'Les détails doivent être un tableau',
            'details.min' => 'Au moins une matière première est requise',
            
            'details.*.produit_id.required' => 'Le produit est obligatoire pour chaque détail',
            'details.*.produit_id.exists' => 'Un des produits sélectionnés n\'existe pas',
            
            'details.*.quantite_utilisee.required' => 'La quantité utilisée est obligatoire',
            'details.*.quantite_utilisee.integer' => 'La quantité doit être un nombre entier',
            'details.*.quantite_utilisee.min' => 'La quantité doit être au moins 1',
            
            'details.*.prix_unitaire.required' => 'Le prix unitaire est obligatoire',
            'details.*.prix_unitaire.numeric' => 'Le prix unitaire doit être un nombre',
            'details.*.prix_unitaire.min' => 'Le prix unitaire ne peut être négatif',
            
            'attributs.*.attribut_id.required_with' => 'L\'attribut est obligatoire',
            'attributs.*.attribut_id.exists' => 'Un des attributs sélectionnés n\'existe pas',
            
            'attributs.*.valeur.required_with' => 'La valeur de l\'attribut est obligatoire',
            'attributs.*.valeur.max' => 'La valeur de l\'attribut ne peut dépasser 255 caractères',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'user_id' => 'confectionneur',
            'categorie_id' => 'catégorie',
            'nom_produit' => 'nom du produit',
            'quantite_produite' => 'quantité produite',
            'destination' => 'destination',
            'date_confection' => 'date de confection',
            'cout_main_oeuvre' => 'coût de main d\'œuvre',
            'prix_vente_unitaire' => 'prix de vente unitaire',
            'details' => 'matières premières',
            'attributs' => 'attributs',
        ];
    }
}