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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100);
            $table->string('prenom', 100);
            $table->string('telephone', 20)->unique()->comment('Format: +226XXXXXXXX');
            $table->string('email', 255)->nullable();
            $table->string('code_pin', 255)->comment('Code PIN 6 chiffres hashé');
            $table->enum('role', ['gerant', 'coiffeur', 'gestionnaire'])->default('coiffeur');
            $table->string('photo_url', 255)->nullable();
            $table->string('specialite', 100)->nullable()->comment('Spécialité du coiffeur');
            $table->boolean('is_active')->default(true);
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
            
            // Index
            $table->index('telephone');
            $table->index('role');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};