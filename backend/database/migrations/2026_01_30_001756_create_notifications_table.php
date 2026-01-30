<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('type'); // 'stock_critique', 'stock_alerte', 'nouveau_rdv', 'rappel_rdv_veille', 'rappel_rdv_jour'
            $table->string('titre');
            $table->text('message');
            $table->json('data')->nullable(); // Données supplémentaires (produit_id, rdv_id, etc.)
            $table->enum('priorite', ['basse', 'normale', 'haute', 'critique'])->default('normale');
            $table->boolean('lu')->default(false);
            $table->timestamp('lu_at')->nullable();
            $table->string('lien')->nullable(); // URL vers la page concernée
            $table->timestamps();
            
            // Index pour performances
            $table->index(['user_id', 'lu', 'created_at']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};