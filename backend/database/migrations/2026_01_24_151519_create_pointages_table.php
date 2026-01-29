<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ajouter soft deletes à users
        Schema::table('users', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Créer table pointages
        Schema::create('pointages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('pointeur_id')->nullable()->constrained('users')->onDelete('set null')->comment('Qui a enregistré le pointage');
            $table->date('date_pointage');
            $table->time('heure_arrivee');
            $table->time('heure_depart')->nullable();
            $table->integer('minutes_travailles')->nullable();
            $table->enum('statut', ['present', 'retard', 'absent', 'conge'])->default('present');
            $table->string('type_pointage')->default('manuel'); // 'manuel', 'automatique', 'badge'
            $table->text('commentaire')->nullable();
            $table->timestamps();

            // Contrainte unique : un pointage par employé par jour
            $table->unique(['user_id', 'date_pointage']);
            $table->index('date_pointage');
            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pointages');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};