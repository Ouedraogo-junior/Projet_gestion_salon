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
        Schema::create('prestations_clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vente_id')->constrained('ventes')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('coiffeur_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('type_prestation_id')->constrained('types_prestations')->onDelete('restrict');
            $table->timestamp('date_prestation')->useCurrent();
            
            // Détails financiers
            $table->decimal('montant_main_oeuvre', 10, 2);
            $table->decimal('montant_produits_utilises', 10, 2)->default(0);
            $table->decimal('montant_total', 10, 2);
            
            // Produits utilisés (JSON pour flexibilité)
            $table->json('produits_utilises')->nullable()->comment('Ex: [{"produit":"Mèches 18\"","quantite":2,"montant":5000}]');
            
            // Commentaires et suivi
            $table->text('commentaires')->nullable()->comment('Observations importantes');
            $table->text('problemes_rencontres')->nullable()->comment('Allergies, fragilité cheveux, etc.');
            $table->text('recommandations')->nullable()->comment('Pour prochaine visite');
            
            // Photos liées
            $table->boolean('a_photos')->default(false);
            
            $table->timestamps();
            
            $table->index('client_id');
            $table->index('coiffeur_id');
            $table->index('date_prestation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prestations_clients');
    }
};
