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
        // Table ventes
        Schema::create('ventes', function (Blueprint $table) {
            $table->id();
            $table->string('numero_facture', 50)->unique();
            $table->foreignId('client_id')->nullable()->constrained('clients')->onDelete('set null');
            $table->foreignId('coiffeur_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('rendez_vous_id')->nullable()->constrained('rendez_vous')->onDelete('set null');
            $table->timestamp('date_vente')->useCurrent();
            $table->decimal('montant_prestations', 10, 2)->default(0);
            $table->decimal('montant_produits', 10, 2)->default(0);
            $table->decimal('montant_total_ht', 10, 2);
            $table->decimal('montant_reduction', 10, 2)->default(0);
            $table->enum('type_reduction', ['fidelite', 'promo', 'manuelle', 'aucune'])->nullable();
            $table->decimal('montant_total_ttc', 10, 2);
            $table->enum('mode_paiement', [
                'especes',
                'orange_money',
                'moov_money',
                'carte',
                'mixte'
            ]);
            $table->decimal('montant_paye', 10, 2);
            $table->decimal('montant_rendu', 10, 2)->default(0);
            $table->enum('statut_paiement', ['paye', 'partiel', 'impaye'])->default('paye');
            $table->decimal('solde_restant', 10, 2)->default(0);
            $table->boolean('recu_imprime')->default(false);
            $table->integer('points_gagnes')->default(0);
            $table->integer('points_utilises')->default(0);
            $table->text('notes')->nullable();
            $table->enum('sync_status', ['synced', 'pending', 'conflict'])->default('synced');
            $table->timestamps();
            $table->softDeletes();
            
            // Index
            $table->index('numero_facture');
            $table->index('client_id');
            $table->index('coiffeur_id');
            $table->index('date_vente');
            $table->index('statut_paiement');
            $table->index('sync_status');
        });

        // Table ventes_details
        Schema::create('ventes_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vente_id')->constrained('ventes')->onDelete('cascade');
            $table->enum('type_article', ['prestation', 'produit']);
            $table->string('article_nom', 255);
            $table->foreignId('produit_id')->nullable()->constrained('produits')->onDelete('set null');
            $table->integer('quantite')->default(1);
            $table->decimal('prix_unitaire', 10, 2);
            $table->decimal('prix_total', 10, 2);
            $table->timestamps();
            
            // Index
            $table->index('vente_id');
            $table->index('produit_id');
            $table->index('type_article');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ventes_details');
        Schema::dropIfExists('ventes');
    }
};