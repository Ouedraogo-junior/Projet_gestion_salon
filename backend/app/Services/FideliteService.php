<?php

namespace App\Services;

use App\Models\Vente;
use App\Models\Client;
use Exception;

class FideliteService
{
    // Configuration des points de fidélité
    const POINTS_PAR_1000_FCFA = 1;
    const FCFA_PAR_100_POINTS = 1000;
    const POINTS_MIN_UTILISATION = 100;
    const POURCENTAGE_MAX_REDUCTION = 50; // Maximum 50% du montant en points

    /**
     * Traiter les points pour une vente
     */
    public function traiterPointsVente(Vente $vente, int $pointsUtilises = 0): void
    {
        $client = Client::findOrFail($vente->client_id);

        // Utiliser des points si demandé
        if ($pointsUtilises > 0) {
            $this->utiliserPoints($vente, $client, $pointsUtilises);
        }

        // Calculer et attribuer les points gagnés
        $pointsGagnes = $this->calculerPointsGagnes($vente->montant_total_ttc);
        $this->attribuerPoints($vente, $client, $pointsGagnes);
    }

    /**
     * Calculer les points gagnés
     */
    public function calculerPointsGagnes(float $montant): int
    {
        return (int) floor($montant / 1000) * self::POINTS_PAR_1000_FCFA;
    }

    /**
     * Utiliser des points pour réduction
     */
    protected function utiliserPoints(Vente $vente, Client $client, int $pointsUtilises): void
    {
        // Validations
        if ($pointsUtilises < self::POINTS_MIN_UTILISATION) {
            throw new Exception("Minimum " . self::POINTS_MIN_UTILISATION . " points requis pour une utilisation");
        }

        if ($client->points_fidelite < $pointsUtilises) {
            throw new Exception("Points insuffisants. Disponible: {$client->points_fidelite}");
        }

        // Calculer la réduction en FCFA
        $reduction = ($pointsUtilises / 100) * self::FCFA_PAR_100_POINTS;

        // Vérifier que la réduction ne dépasse pas 50% du montant
        $reductionMax = ($vente->montant_total_ht * self::POURCENTAGE_MAX_REDUCTION) / 100;
        if ($reduction > $reductionMax) {
            throw new Exception(
                "La réduction par points ne peut pas dépasser " . 
                self::POURCENTAGE_MAX_REDUCTION . 
                "% du montant (max: {$reductionMax} FCFA)"
            );
        }

        // Appliquer la réduction
        $vente->montant_reduction += $reduction;
        $vente->type_reduction = 'fidelite';
        $vente->points_utilises = $pointsUtilises;

        // Déduire les points du client
        $client->decrement('points_fidelite', $pointsUtilises);
    }

    /**
     * Attribuer des points gagnés
     */
    protected function attribuerPoints(Vente $vente, Client $client, int $points): void
    {
        if ($points > 0) {
            $client->increment('points_fidelite', $points);
            $vente->points_gagnes = $points;
        }
    }

    /**
     * Annuler les points d'une vente
     */
    public function annulerPointsVente(Vente $vente): void
    {
        $client = Client::findOrFail($vente->client_id);

        // Retirer les points gagnés
        if ($vente->points_gagnes > 0) {
            $client->decrement('points_fidelite', $vente->points_gagnes);
        }

        // Redonner les points utilisés
        if ($vente->points_utilises > 0) {
            $client->increment('points_fidelite', $vente->points_utilises);
        }
    }

    /**
     * Calculer la réduction possible avec les points
     */
    public function calculerReductionPossible(int $pointsDisponibles, float $montantVente): array
    {
        if ($pointsDisponibles < self::POINTS_MIN_UTILISATION) {
            return [
                'possible' => false,
                'message' => 'Minimum ' . self::POINTS_MIN_UTILISATION . ' points requis',
                'reduction_max' => 0,
                'points_max_utilisables' => 0,
            ];
        }

        // Calculer la réduction maximale autorisée (50% du montant)
        $reductionMaxAutorisee = ($montantVente * self::POURCENTAGE_MAX_REDUCTION) / 100;

        // Calculer les points nécessaires pour cette réduction max
        $pointsPourReductionMax = ($reductionMaxAutorisee / self::FCFA_PAR_100_POINTS) * 100;

        // Points réellement utilisables
        $pointsMaxUtilisables = min($pointsDisponibles, $pointsPourReductionMax);
        $reductionMax = ($pointsMaxUtilisables / 100) * self::FCFA_PAR_100_POINTS;

        return [
            'possible' => true,
            'reduction_max' => $reductionMax,
            'points_max_utilisables' => (int) $pointsMaxUtilisables,
            'taux_conversion' => self::FCFA_PAR_100_POINTS . ' FCFA pour 100 points',
        ];
    }

    /**
     * Obtenir le résumé des points du client
     */
    public function getResumeFidelite(int $clientId): array
    {
        $client = Client::findOrFail($clientId);

        $totalDepense = Vente::where('client_id', $clientId)
            ->where('statut_paiement', '!=', 'annulee')
            ->sum('montant_total_ttc');

        $totalPointsGagnes = Vente::where('client_id', $clientId)
            ->where('statut_paiement', '!=', 'annulee')
            ->sum('points_gagnes');

        $totalPointsUtilises = Vente::where('client_id', $clientId)
            ->where('statut_paiement', '!=', 'annulee')
            ->sum('points_utilises');

        $valeurPoints = ($client->points_fidelite / 100) * self::FCFA_PAR_100_POINTS;

        return [
            'points_actuels' => $client->points_fidelite,
            'valeur_fcfa' => $valeurPoints,
            'total_depense' => $totalDepense,
            'total_points_gagnes' => $totalPointsGagnes,
            'total_points_utilises' => $totalPointsUtilises,
            'peut_utiliser' => $client->points_fidelite >= self::POINTS_MIN_UTILISATION,
        ];
    }
}