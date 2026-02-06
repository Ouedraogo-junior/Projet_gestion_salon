<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVenteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Géré par middleware auth
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Client (un seul type requis)
            'client_id' => 'nullable|exists:clients,id',
            'nouveau_client' => 'nullable|array',
            'nouveau_client.nom' => 'nullable|string|max:100', // MODIFIÉ: required_with → nullable
            'nouveau_client.prenom' => 'nullable|string|max:100', // MODIFIÉ: required_with → nullable
            'nouveau_client.telephone' => 'required_with:nouveau_client|string|max:20',
            'nouveau_client.email' => 'nullable|email|max:255',
            'client_anonyme' => 'nullable|array',
            'client_anonyme.nom' => 'nullable|string|max:100', // MODIFIÉ: required_with → nullable
            'client_anonyme.telephone' => 'required_with:client_anonyme|string|max:20', // MODIFIÉ: nullable → required_with

            // Personnel
            'coiffeur_id' => 'nullable|exists:users,id',
            'rendez_vous_id' => 'nullable|exists:rendez_vous,id',

            // Articles
            'articles' => 'required|array|min:1',
            'articles.*.id' => 'required|integer',
            'articles.*.type' => ['required', Rule::in(['prestation', 'produit'])],
            'articles.*.quantite' => 'required|integer|min:1',
            'articles.*.prix_unitaire' => 'required|numeric|min:0',
            'articles.*.reduction' => 'nullable|numeric|min:0',
            'articles.*.source_stock' => 'nullable|in:vente,utilisation',

            // Réduction globale
            'reduction' => 'nullable|array',
            'reduction.type' => ['required_with:reduction', Rule::in(['pourcentage', 'montant'])],
            'reduction.valeur' => 'required_with:reduction|numeric|min:0',
            'reduction.motif' => 'nullable|string|max:100',

            // Paiements
            'paiements' => 'required|array|min:1',
            'paiements.*.mode' => ['required', Rule::in(['especes', 'orange_money', 'moov_money', 'carte'])],
            'paiements.*.montant' => 'required|numeric|min:0',
            'paiements.*.reference' => 'nullable|string|max:100',

            // Points de fidélité
            'points_utilises' => 'nullable|integer|min:0',

            // Divers
            'notes' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'articles.required' => 'Au moins un article est requis',
            'articles.min' => 'Au moins un article est requis',
            'paiements.required' => 'Au moins un mode de paiement est requis',
            'paiements.min' => 'Au moins un mode de paiement est requis',
            'client_id.exists' => 'Client introuvable',
            'coiffeur_id.exists' => 'Coiffeur introuvable',
            'nouveau_client.telephone.required_with' => 'Le téléphone du client est requis',
            'client_anonyme.telephone.required_with' => 'Le téléphone est requis', // AJOUTÉ
        ];
    }

    /**
     * Validation personnalisée
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Vérifier qu'un seul type de client est fourni
            $clientTypes = array_filter([
                $this->client_id,
                $this->nouveau_client,
                $this->client_anonyme,
            ]);

            if (count($clientTypes) > 1) {
                $validator->errors()->add('client', 'Un seul type de client peut être spécifié');
            }

            if (count($clientTypes) === 0) {
                $validator->errors()->add('client', 'Un client est requis (existant, nouveau ou anonyme)');
            }

            // Vérifier que les IDs des articles existent
            if ($this->has('articles')) {
                foreach ($this->articles as $index => $article) {
                    if ($article['type'] === 'prestation') {
                        if (!\App\Models\TypePrestation::find($article['id'])) {
                            $validator->errors()->add(
                                "articles.{$index}.id",
                                'Prestation introuvable'
                            );
                        }
                    } else {
                        if (!\App\Models\Produit::find($article['id'])) {
                            $validator->errors()->add(
                                "articles.{$index}.id",
                                'Produit introuvable'
                            );
                        }
                    }
                }
            }

            // Vérifier que le total des paiements est suffisant
            if ($this->has('paiements') && $this->has('articles')) {
                $totalPaiements = array_sum(array_column($this->paiements, 'montant'));
                $montantVente = $this->calculerMontantTotal();

                if ($totalPaiements < $montantVente) {
                    $validator->errors()->add(
                        'paiements',
                        "Le montant payé ({$totalPaiements} FCFA) est insuffisant. Total: {$montantVente} FCFA"
                    );
                }
            }
        });
    }

    /**
     * Calculer le montant total prévisionnel
     */
    protected function calculerMontantTotal(): float
    {
        $total = 0;

        foreach ($this->articles ?? [] as $article) {
            $sousTotal = $article['prix_unitaire'] * $article['quantite'];
            $sousTotal -= ($article['reduction'] ?? 0);
            $total += $sousTotal;
        }

        // Réduction globale
        if ($this->has('reduction')) {
            if ($this->reduction['type'] === 'pourcentage') {
                $total -= ($total * $this->reduction['valeur']) / 100;
            } else {
                $total -= $this->reduction['valeur'];
            }
        }

        // Réduction par points
        if ($this->has('points_utilises') && $this->points_utilises > 0) {
            $reductionPoints = ($this->points_utilises / 100) * 1000; // 100 points = 1000 FCFA
            $total -= $reductionPoints;
        }

        return max(0, $total);
    }
}