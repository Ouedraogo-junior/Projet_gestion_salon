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
        Schema::create('transferts_stock', function (Blueprint $table) {
            $table->id();
            $table->string('numero_transfert', 50)->unique();
            $table->foreignId('produit_id')->constrained('produits')->onDelete('restrict');
            $table->enum('type_transfert', ['vente_vers_utilisation', 'utilisation_vers_vente']);
            $table->integer('quantite');
            $table->decimal('prix_unitaire', 10, 2)->comment('Prix auquel le transfert est valorisé');
            $table->decimal('montant_total', 10, 2);
            $table->text('motif')->nullable();
            $table->foreignId('user_id')->constrained('users')->onDelete('set null')->comment('Qui a effectué le transfert');
            $table->boolean('valide')->default(false)->comment('Validation gérant si nécessaire');
            $table->foreignId('valideur_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('date_validation')->nullable();
            $table->timestamps();
            
            $table->index('produit_id');
            $table->index('type_transfert');
            $table->index('valide');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transferts_stock');
    }
};
