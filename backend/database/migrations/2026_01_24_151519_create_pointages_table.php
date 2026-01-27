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
        Schema::create('pointages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->date('date_pointage');
            $table->time('heure_arrivee');
            $table->time('heure_depart')->nullable();
            $table->integer('minutes_travailles')->nullable();
            $table->enum('statut', ['present', 'retard', 'absent', 'conge'])->default('present');
            $table->text('commentaire')->nullable();
            $table->timestamps();
            
            // Contrainte unique : un pointage par employé par jour
            $table->unique(['user_id', 'date_pointage']);
            $table->index('date_pointage');
            $table->index('statut');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pointages');
    }
};
