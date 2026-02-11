<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rendez_vous_paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rendez_vous_id')->constrained('rendez_vous')->onDelete('cascade');
            
            // Type de paiement
            $table->enum('type_paiement', ['acompte', 'solde']);
            
            // Montant et mode
            $table->decimal('montant', 10, 2);
            $table->enum('mode_paiement', [
                'especes',
                'orange_money',
                'moov_money',
                'carte'
            ]);
            
            // Référence pour paiements mobiles
            $table->string('reference_transaction', 100)->nullable();
            
            // Traçabilité
            $table->timestamp('date_paiement')->useCurrent();
            $table->foreignId('user_id')->constrained('users')->comment('Qui a encaissé');
            
            // Notes éventuelles
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            // Index
            $table->index(['rendez_vous_id', 'type_paiement']);
            $table->index('date_paiement');
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('rendez_vous_paiements');
    }
};