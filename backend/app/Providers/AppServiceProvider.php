<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use App\Models\Produit;
use App\Models\ProduitVariante;
use App\Models\RendezVous;
use App\Observers\ProduitObserver;
use App\Observers\ProduitVarianteObserver;
use App\Observers\RendezVousObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Enregistrer les observers
        Produit::observe(ProduitObserver::class);
        ProduitVariante::observe(ProduitVarianteObserver::class);
        RendezVous::observe(RendezVousObserver::class);
        }
}
