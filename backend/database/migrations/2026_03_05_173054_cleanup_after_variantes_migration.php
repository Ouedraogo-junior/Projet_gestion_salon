<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // cleanup_after_variantes_migration.php
public function up(): void
{
    // Supprimer les colonnes devenues inutiles sur produits
    Schema::table('produits', function (Blueprint $table) {
        $table->dropColumn([
            'reference', 'prix_achat', 'prix_vente', 'prix_promo',
            'date_debut_promo', 'date_fin_promo',
            'stock_vente', 'stock_utilisation', 'stock_reserve',
            'seuil_alerte', 'seuil_critique',
            'seuil_alerte_utilisation', 'seuil_critique_utilisation',
            'seuil_alerte_reserve', 'seuil_critique_reserve',
            'type_stock_principal', 'devise_achat', 'prix_achat_devise_origine',
            'taux_change', 'frais_cmb', 'frais_transit', 'frais_bancaires',
            'frais_courtier', 'frais_transport_local', 'montant_total_achat',
            'prix_achat_stock_total', 'moyen_paiement', 'date_commande',
            'date_reception', 'quantite_stock_commande', 'quantite_min_commande',
            'delai_livraison_jours', 'cbm', 'poids_kg',
            'statut_validation', 'valide_par', 'valide_le', 'motif_rejet',
            'cree_par', 'sync_status',
        ]);
    });

    // Supprimer les anciennes colonnes produit_id sur les tables liées
    Schema::table('mouvements_stock', function (Blueprint $table) {
        $table->dropForeign(['produit_id']);
        $table->dropColumn('produit_id');
    });
    Schema::table('ventes_details', function (Blueprint $table) {
        $table->dropForeign(['produit_id']);
        $table->dropColumn('produit_id');
    });
    Schema::table('confection_details', function (Blueprint $table) {
        $table->dropForeign(['produit_id']);
        $table->dropColumn('produit_id');
    });
    Schema::table('transferts_stock', function (Blueprint $table) {
        $table->dropForeign(['produit_id']);
        $table->dropColumn('produit_id');
    });
    Schema::table('confections', function (Blueprint $table) {
        $table->dropForeign(['produit_id']);
        $table->dropColumn('produit_id');
    });
    Schema::table('produit_attribut_valeurs', function (Blueprint $table) {
        $table->dropForeign(['produit_id']);
        $table->dropColumn('produit_id');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
{
    // Remettre les colonnes sur produits
    Schema::table('produits', function (Blueprint $table) {
        $table->string('reference', 50)->nullable()->unique();
        $table->decimal('prix_achat', 10, 2)->default(0);
        $table->decimal('prix_vente', 10, 2)->default(0);
        $table->decimal('prix_promo', 10, 2)->nullable();
        $table->date('date_debut_promo')->nullable();
        $table->date('date_fin_promo')->nullable();
        $table->integer('stock_vente')->default(0);
        $table->integer('stock_utilisation')->default(0);
        $table->integer('stock_reserve')->default(0);
        $table->integer('seuil_alerte')->nullable();
        $table->integer('seuil_critique')->nullable();
        $table->integer('seuil_alerte_utilisation')->nullable();
        $table->integer('seuil_critique_utilisation')->nullable();
        $table->integer('seuil_alerte_reserve')->nullable();
        $table->integer('seuil_critique_reserve')->nullable();
        $table->string('type_stock_principal')->default('mixte');
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
        $table->string('statut_validation')->default('en_attente');
        $table->foreignId('valide_par')->nullable()->constrained('users')->nullOnDelete();
        $table->timestamp('valide_le')->nullable();
        $table->text('motif_rejet')->nullable();
        $table->foreignId('cree_par')->nullable()->constrained('users')->nullOnDelete();
        $table->string('sync_status')->default('synced');
    });

    // Remettre produit_id sur les tables liées
    Schema::table('mouvements_stock', function (Blueprint $table) {
        $table->foreignId('produit_id')->nullable()->constrained('produits')->nullOnDelete();
    });
    Schema::table('ventes_details', function (Blueprint $table) {
        $table->foreignId('produit_id')->nullable()->constrained('produits')->nullOnDelete();
    });
    Schema::table('confection_details', function (Blueprint $table) {
        $table->foreignId('produit_id')->nullable()->constrained('produits')->nullOnDelete();
    });
    Schema::table('transferts_stock', function (Blueprint $table) {
        $table->foreignId('produit_id')->nullable()->constrained('produits')->nullOnDelete();
    });
    Schema::table('confections', function (Blueprint $table) {
        $table->foreignId('produit_id')->nullable()->constrained('produits')->nullOnDelete();
    });
    Schema::table('produit_attribut_valeurs', function (Blueprint $table) {
        $table->foreignId('produit_id')->nullable()->constrained('produits')->nullOnDelete();
    });
}
};
