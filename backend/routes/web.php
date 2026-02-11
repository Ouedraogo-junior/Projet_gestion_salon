<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use App\Mail\CompteArreteMail;

Route::get('/', function () {
    return view('welcome');
});

// routes/web.php

Route::get('/test-compte-arrete', function () {
    try {
        $gestionnaire = \App\Models\User::where('role', 'gestionnaire')->first();
        
        if (!$gestionnaire) {
            return 'Aucun gestionnaire trouvé';
        }
        
        Mail::to($gestionnaire->email)->send(new \App\Mail\CompteArreteMail([
            'date' => now()->format('d/m/Y'),
            'emetteur' => 'Test Utilisateur',
            'role' => 'coiffeur',
        ]));
        
        return 'Email de compte arrêté envoyé à ' . $gestionnaire->email;
    } catch (\Exception $e) {
        return 'Erreur : ' . $e->getMessage();
    }
});
