<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Services\NotificationService;


// Rappels de rendez-vous : vérifier toutes les heures
Schedule::command('rdv:rappels')
    ->hourly()
    ->withoutOverlapping();

// Nettoyage des vieilles notifications (> 30 jours) : tous les jours à 2h du matin
Schedule::call(function () {
    app(NotificationService::class)->nettoyerVieilles();
})->dailyAt('02:00');


Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
