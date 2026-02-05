<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            // Date de commande
            $table->date('date_commande')->nullable()->after('fournisseur');
            
            // Prix d'achat avec devise
            $table->string('devise_achat', 10)->default('FCFA')->after('prix_achat');
            
            // Frais additionnels
            $table->decimal('frais_cmb', 10, 2)->nullable()->after('devise_achat')->comment('Frais CMB');
            $table->decimal('frais_transit', 10, 2)->nullable()->after('frais_cmb')->comment('Frais de transit/douane');
            
            // Moyen de paiement
            $table->string('moyen_paiement', 50)->nullable()->after('frais_transit');
            
            // Date de réception
            $table->date('date_reception')->nullable()->after('moyen_paiement');
            
            // Montant total d'achat (calculé)
            $table->decimal('montant_total_achat', 10, 2)->nullable()->after('date_reception')
                  ->comment('Prix achat + CMB + Transit');
            
            // Index
            $table->index('date_commande');
            $table->index('date_reception');
        });
    }

    public function down(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->dropColumn([
                'date_commande',
                'devise_achat',
                'frais_cmb',
                'frais_transit',
                'moyen_paiement',
                'date_reception',
                'montant_total_achat'
            ]);
        });
    }
};