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
        // Créer d'abord la table des types de prestations
        Schema::create('types_prestations', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->text('description')->nullable();
            $table->integer('duree_estimee_minutes')->nullable();
            $table->decimal('prix_base', 10, 2)->nullable();
            $table->boolean('actif')->default(true);
            $table->integer('ordre')->default(0); // Pour l'ordre d'affichage
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('types_prestations');
    }
};
