<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('confections', function (Blueprint $table) {
            // Destination du produit confectionné
            $table->enum('destination', ['vente', 'utilisation', 'mixte'])
                  ->default('vente')
                  ->after('quantite_produite')
                  ->comment('Destination du produit confectionné');
            
            // Lien vers le produit créé après confection terminée
            $table->foreignId('produit_id')
                  ->nullable()
                  ->after('id')
                  ->constrained('produits')
                  ->onDelete('set null')
                  ->comment('Produit créé à partir de cette confection');
            
            // Index pour optimiser les requêtes
            $table->index('destination');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('confections', function (Blueprint $table) {
            $table->dropForeign(['produit_id']);
            $table->dropIndex(['destination']);
            $table->dropColumn(['destination', 'produit_id']);
        });
    }
};