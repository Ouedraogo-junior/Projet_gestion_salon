<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\RendezVous;
use App\Services\NotificationService;
use Carbon\Carbon;

class EnvoyerRappelsRendezVous extends Command
{
    protected $signature = 'rdv:rappels';
    protected $description = 'Envoyer les rappels de rendez-vous (J-1 et jour J)';

    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        parent::__construct();
        $this->notificationService = $notificationService;
    }

    public function handle()
    {
        $this->info('🔔 Envoi des rappels de rendez-vous...');

        // Rappels pour demain (J-1) - envoyé à 18h
        if (now()->hour === 18) {
            $this->envoyerRappelsVeille();
        }

        // Rappels pour aujourd'hui (jour J) - envoyé à 8h
        if (now()->hour === 8) {
            $this->envoyerRappelsJour();
        }

        $this->info('✅ Rappels envoyés avec succès');
    }

    protected function envoyerRappelsVeille()
    {
        $demain = Carbon::tomorrow();
        
        $rdvs = RendezVous::whereDate('date_heure', $demain->toDateString())
            ->whereIn('statut', ['en_attente', 'confirme'])
            ->get();

        foreach ($rdvs as $rdv) {
            $this->notificationService->notifierRappelRdvVeille($rdv);
        }

        $this->info("📅 {$rdvs->count()} rappels J-1 envoyés");
    }

    protected function envoyerRappelsJour()
    {
        $aujourdhui = Carbon::today();
        
        $rdvs = RendezVous::whereDate('date_heure', $aujourdhui->toDateString())
            ->whereIn('statut', ['en_attente', 'confirme'])
            ->get();

        foreach ($rdvs as $rdv) {
            $this->notificationService->notifierRappelRdvJour($rdv);
        }

        $this->info("📅 {$rdvs->count()} rappels jour J envoyés");
    }
}