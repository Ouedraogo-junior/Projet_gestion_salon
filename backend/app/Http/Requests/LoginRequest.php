<?php
// app/Http/Requests/LoginRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'L\'email est obligatoire',
            'email.email' => 'L\'email doit être valide',
            'password.required' => 'Le mot de passe est obligatoire',
            'password.min' => 'Le mot de passe doit contenir au moins 6 caractères',
        ];
    }
}

// ============================================================
// app/Http/Requests/RegisterRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'telephone' => 'nullable|string|max:20',
            'role' => 'nullable|in:admin,gerant,employe',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom est obligatoire',
            'email.required' => 'L\'email est obligatoire',
            'email.unique' => 'Cet email est déjà utilisé',
            'password.required' => 'Le mot de passe est obligatoire',
            'password.min' => 'Le mot de passe doit contenir au moins 6 caractères',
            'password.confirmed' => 'Les mots de passe ne correspondent pas',
        ];
    }
}

// ============================================================
// app/Http/Requests/ClientRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $clientId = $this->route('client') ?? $this->route('id');

        return [
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'telephone' => 'required|string|max:20|unique:clients,telephone,' . $clientId,
            'email' => 'nullable|email|unique:clients,email,' . $clientId,
            'date_naissance' => 'nullable|date|before:today',
            'adresse' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
            'est_fidele' => 'boolean',
            'points_fidelite' => 'integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom est obligatoire',
            'prenom.required' => 'Le prénom est obligatoire',
            'telephone.required' => 'Le téléphone est obligatoire',
            'telephone.unique' => 'Ce numéro de téléphone existe déjà',
            'email.email' => 'L\'email doit être valide',
            'email.unique' => 'Cet email existe déjà',
            'date_naissance.before' => 'La date de naissance doit être antérieure à aujourd\'hui',
        ];
    }
}

// ============================================================
// app/Http/Requests/ProduitRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProduitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $produitId = $this->route('produit') ?? $this->route('id');

        return [
            'nom' => 'required|string|max:200',
            'description' => 'nullable|string',
            'type' => 'required|in:produit,service',
            'categorie_id' => 'required|exists:categories,id',
            'code_barre' => 'nullable|string|unique:produits,code_barre,' . $produitId,
            'reference' => 'nullable|string|unique:produits,reference,' . $produitId,
            'prix_achat' => 'required|numeric|min:0',
            'prix_vente' => 'required|numeric|min:0|gte:prix_achat',
            'quantite_stock' => 'integer|min:0',
            'seuil_alerte' => 'integer|min:0',
            'image' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom du produit est obligatoire',
            'type.required' => 'Le type est obligatoire',
            'categorie_id.required' => 'La catégorie est obligatoire',
            'categorie_id.exists' => 'Cette catégorie n\'existe pas',
            'prix_achat.required' => 'Le prix d\'achat est obligatoire',
            'prix_vente.required' => 'Le prix de vente est obligatoire',
            'prix_vente.gte' => 'Le prix de vente doit être supérieur ou égal au prix d\'achat',
            'code_barre.unique' => 'Ce code-barre existe déjà',
            'reference.unique' => 'Cette référence existe déjà',
        ];
    }
}

// ============================================================
// app/Http/Requests/VenteRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VenteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id' => 'nullable|exists:clients,id',
            'mode_paiement' => 'required|in:especes,mobile_money,carte_bancaire,cheque',
            'statut' => 'nullable|in:en_attente,completee,annulee',
            'notes' => 'nullable|string|max:500',
            'items' => 'required|array|min:1',
            'items.*.produit_id' => 'required|exists:produits,id',
            'items.*.quantite' => 'required|integer|min:1',
            'items.*.prix_unitaire' => 'nullable|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'client_id.exists' => 'Ce client n\'existe pas',
            'mode_paiement.required' => 'Le mode de paiement est obligatoire',
            'items.required' => 'Au moins un article est requis',
            'items.*.produit_id.required' => 'Le produit est obligatoire',
            'items.*.produit_id.exists' => 'Ce produit n\'existe pas',
            'items.*.quantite.required' => 'La quantité est obligatoire',
            'items.*.quantite.min' => 'La quantité doit être au moins 1',
        ];
    }
}

// ============================================================
// app/Http/Requests/RendezVousRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RendezVousRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id' => 'required|exists:clients,id',
            'type_prestation_id' => 'required|exists:type_prestations,id',
            'date_heure' => 'required|date|after:now',
            'duree_estimee' => 'nullable|integer|min:15|max:480',
            'statut' => 'nullable|in:en_attente,confirme,complete,annule',
            'notes' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'client_id.required' => 'Le client est obligatoire',
            'client_id.exists' => 'Ce client n\'existe pas',
            'type_prestation_id.required' => 'Le type de prestation est obligatoire',
            'type_prestation_id.exists' => 'Ce type de prestation n\'existe pas',
            'date_heure.required' => 'La date et l\'heure sont obligatoires',
            'date_heure.after' => 'La date doit être ultérieure à maintenant',
            'duree_estimee.min' => 'La durée minimale est de 15 minutes',
            'duree_estimee.max' => 'La durée maximale est de 8 heures',
        ];
    }
}