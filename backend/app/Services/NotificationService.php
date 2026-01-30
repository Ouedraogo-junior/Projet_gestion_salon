<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\Produit;
use App\Models\RendezVous;

class NotificationService
{
    /**
     * Créer une notification
     */
    public function creer(
        ?int $userId,
        string $type,
        string $titre,
        string $message,
        array $data = [],
        string $priorite = 'normale',
        ?string $lien = null
    ): Notification {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'titre' => $titre,
            'message' => $message,
            'data' => $data,
            'priorite' => $priorite,
            'lien' => $lien,
        ]);
    }

    /**
     * Notifier stock critique
     */
    public function notifierStockCritique(Produit $produit): void
    {
        $gerants = User::where('role', 'gerant')->get();

        foreach ($gerants as $gerant) {
            // Vérifier si une notification similaire n'existe pas déjà aujourd'hui
            $existante = Notification::where('user_id', $gerant->id)
                ->where('type', 'stock_critique')
                ->whereJsonContains('data->produit_id', $produit->id)
                ->whereDate('created_at', today())
                ->exists();

            if (!$existante) {
                $this->creer(
                    userId: $gerant->id,
                    type: 'stock_critique',
                    titre: '🔴 Stock critique',
                    message: "Le produit \"{$produit->nom}\" est en stock critique ({$produit->stock_total} unités)",
                    data: [
                        'produit_id' => $produit->id,
                        'stock_vente' => $produit->stock_vente,
                        'stock_utilisation' => $produit->stock_utilisation,
                    ],
                    priorite: 'critique',
                    lien: "/produits/{$produit->id}"
                );
            }
        }
    }

    /**
     * Notifier stock en alerte
     */
    public function notifierStockAlerte(Produit $produit): void
    {
        $gerants = User::where('role', 'gerant')->get();

        foreach ($gerants as $gerant) {
            // Vérifier si une notification similaire n'existe pas déjà aujourd'hui
            $existante = Notification::where('user_id', $gerant->id)
                ->where('type', 'stock_alerte')
                ->whereJsonContains('data->produit_id', $produit->id)
                ->whereDate('created_at', today())
                ->exists();

            if (!$existante) {
                $this->creer(
                    userId: $gerant->id,
                    type: 'stock_alerte',
                    titre: '🟡 Stock en alerte',
                    message: "Le produit \"{$produit->nom}\" nécessite un réapprovisionnement ({$produit->stock_total} unités)",
                    data: [
                        'produit_id' => $produit->id,
                        'stock_vente' => $produit->stock_vente,
                        'stock_utilisation' => $produit->stock_utilisation,
                    ],
                    priorite: 'haute',
                    lien: "/produits/{$produit->id}"
                );
            }
        }
    }

    /**
     * Notifier nouveau rendez-vous
     */
    public function notifierNouveauRendezVous(RendezVous $rdv): void
    {
        $gerants = User::where('role', 'gerant')->get();

        foreach ($gerants as $gerant) {
            $this->creer(
                userId: $gerant->id,
                type: 'nouveau_rdv',
                titre: '📅 Nouveau rendez-vous',
                message: "Rendez-vous pris pour {$rdv->client_nom} le " . $rdv->date_heure->format('d/m/Y à H:i'),
                data: [
                    'rdv_id' => $rdv->id,
                    'client_nom' => $rdv->client_nom,
                    'date_heure' => $rdv->date_heure->toIso8601String(),
                ],
                priorite: 'normale',
                lien: "/rendez-vous/{$rdv->id}"
            );
        }
    }

    /**
     * Notifier rappel RDV veille (J-1)
     */
    public function notifierRappelRdvVeille(RendezVous $rdv): void
    {
        $gerants = User::where('role', 'gerant')->get();

        foreach ($gerants as $gerant) {
            $this->creer(
                userId: $gerant->id,
                type: 'rappel_rdv_veille',
                titre: '⏰ Rappel rendez-vous demain',
                message: "Rendez-vous prévu demain à " . $rdv->date_heure->format('H:i') . " pour {$rdv->client_nom}",
                data: [
                    'rdv_id' => $rdv->id,
                    'client_nom' => $rdv->client_nom,
                    'date_heure' => $rdv->date_heure->toIso8601String(),
                ],
                priorite: 'normale',
                lien: "/rendez-vous/{$rdv->id}"
            );
        }
    }

    /**
     * Notifier rappel RDV jour J
     */
    public function notifierRappelRdvJour(RendezVous $rdv): void
    {
        $gerants = User::where('role', 'gerant')->get();

        foreach ($gerants as $gerant) {
            $this->creer(
                userId: $gerant->id,
                type: 'rappel_rdv_jour',
                titre: '⏰ Rendez-vous aujourd\'hui',
                message: "Rendez-vous à " . $rdv->date_heure->format('H:i') . " pour {$rdv->client_nom}",
                data: [
                    'rdv_id' => $rdv->id,
                    'client_nom' => $rdv->client_nom,
                    'date_heure' => $rdv->date_heure->toIso8601String(),
                ],
                priorite: 'haute',
                lien: "/rendez-vous/{$rdv->id}"
            );
        }
    }

    /**
     * Récupérer les notifications d'un utilisateur
     */
    public function getNotifications(?int $userId, bool $nonLuesOnly = false, int $limit = 50)
    {
        $query = Notification::query()
            ->when($userId, fn($q) => $q->where('user_id', $userId))
            ->when($nonLuesOnly, fn($q) => $q->nonLues())
            ->orderBy('created_at', 'desc')
            ->limit($limit);

        return $query->get();
    }

    /**
     * Compter les notifications non lues
     */
    public function compterNonLues(?int $userId): int
    {
        return Notification::query()
            ->when($userId, fn($q) => $q->where('user_id', $userId))
            ->nonLues()
            ->count();
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    public function marquerToutCommeLu(?int $userId): void
    {
        Notification::query()
            ->when($userId, fn($q) => $q->where('user_id', $userId))
            ->nonLues()
            ->update([
                'lu' => true,
                'lu_at' => now(),
            ]);
    }

    /**
     * Supprimer les vieilles notifications (> 30 jours)
     */
    public function nettoyerVieilles(): int
    {
        return Notification::where('created_at', '<', now()->subDays(30))->delete();
    }
}