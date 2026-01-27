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
        Schema::create('confections', function (Blueprint $table) {
            $table->id();
            $table->string('numero_confection', 50)->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('set null')->comment('Qui a confectionné');
            $table->foreignId('categorie_id')->constrained('categories')->onDelete('restrict');
            $table->string('nom_produit', 255); // Ex: "Locks naturelles"
            $table->integer('quantite_produite');
            $table->text('description')->nullable();
            $table->date('date_confection');
            $table->decimal('cout_matiere_premiere', 10, 2)->default(0);
            $table->decimal('cout_main_oeuvre', 10, 2)->default(0);
            $table->decimal('cout_total', 10, 2)->default(0);
            $table->decimal('prix_vente_unitaire', 10, 2)->nullable();
            $table->enum('statut', ['en_cours', 'terminee', 'annulee'])->default('en_cours');
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('date_confection');
            $table->index('statut');
        });

        // Détails confection : matières premières utilisées
        Schema::create('confection_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('confection_id')->constrained('confections')->onDelete('cascade');
            $table->foreignId('produit_id')->constrained('produits')->onDelete('restrict');
            $table->integer('quantite_utilisee');
            $table->decimal('prix_unitaire', 10, 2);
            $table->decimal('prix_total', 10, 2);
            $table->timestamps();
            
            $table->index('confection_id');
        });

        // Attributs du produit confectionné
        Schema::create('confection_attributs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('confection_id')->constrained('confections')->onDelete('cascade');
            $table->foreignId('attribut_id')->constrained('attributs')->onDelete('cascade');
            $table->string('valeur', 255);
            $table->timestamps();
            
            $table->index('confection_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('confections');
        Schema::dropIfExists('confection_details');
        Schema::dropIfExists('confection_attributs');
    }
};
