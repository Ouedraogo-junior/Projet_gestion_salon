<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // create_produit_variantes_table.php
public function up(): void
{
    Schema::create('produit_variantes', function (Blueprint $table) {
        $table->id();
        $table->foreignId('produit_id')->constrained('produits')->cascadeOnDelete();
        $table->string('reference', 50)->nullable()->unique();
        $table->decimal('prix_achat', 10, 2);
        $table->decimal('prix_vente', 10, 2);
        $table->decimal('prix_promo', 10, 2)->nullable();
        $table->date('date_debut_promo')->nullable();
        $table->date('date_fin_promo')->nullable();

        // Stocks
        $table->integer('stock_vente')->default(0);
        $table->integer('stock_utilisation')->default(0);
        $table->integer('stock_reserve')->default(0);
        $table->integer('seuil_alerte')->nullable();
        $table->integer('seuil_critique')->nullable();
        $table->integer('seuil_alerte_utilisation')->nullable();
        $table->integer('seuil_critique_utilisation')->nullable();
        $table->integer('seuil_alerte_reserve')->nullable();
        $table->integer('seuil_critique_reserve')->nullable();
        $table->string('type_stock_principal', 50)->default('mixte');

        // Achat / import
        $table->string('devise_achat', 10)->default('FCFA');
        $table->decimal('prix_achat_devise_origine', 12, 2)->nullable();
        $table->decimal('taux_change', 10, 4)->nullable();
        $table->decimal('frais_cmb', 10, 2)->nullable();
        $table->decimal('frais_transit', 10, 2)->nullable();
        $table->decimal('frais_bancaires', 10, 2)->nullable();
        $table->decimal('frais_courtier', 10, 2)->nullable();
        $table->decimal('frais_transport_local', 10, 2)->nullable();
        $table->decimal('montant_total_achat', 10, 2)->nullable();
        $table->decimal('prix_achat_stock_total', 12, 2)->nullable();
        $table->string('moyen_paiement', 50)->nullable();
        $table->date('date_commande')->nullable();
        $table->date('date_reception')->nullable();
        $table->integer('quantite_stock_commande')->nullable();
        $table->integer('quantite_min_commande')->nullable();
        $table->integer('delai_livraison_jours')->nullable();
        $table->decimal('cbm', 10, 4)->nullable();
        $table->decimal('poids_kg', 10, 2)->nullable();

        // Validation
        $table->string('statut_validation')->default('en_attente');
        $table->foreignId('valide_par')->nullable()->constrained('users')->nullOnDelete();
        $table->timestamp('valide_le')->nullable();
        $table->text('motif_rejet')->nullable();
        $table->foreignId('cree_par')->nullable()->constrained('users')->nullOnDelete();

        $table->string('sync_status')->default('synced');
        $table->boolean('is_active')->default(true);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produit_variantes');
    }
};
