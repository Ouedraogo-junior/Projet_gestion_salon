<?php

namespace App\Observers;

use App\Models\RendezVous;
use App\Services\NotificationService;

class RendezVousObserver
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Après création d'un rendez-vous
     */
    public function created(RendezVous $rdv)
    {
        // Notifier uniquement si le RDV est confirmé ou en attente
        if (in_array($rdv->statut, ['en_attente', 'confirme'])) {
            $this->notificationService->notifierNouveauRendezVous($rdv);
        }
    }
}