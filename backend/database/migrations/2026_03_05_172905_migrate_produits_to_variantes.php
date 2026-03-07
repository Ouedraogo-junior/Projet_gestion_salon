<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // migrate_produits_to_variantes.php
public function up(): void
{
    // 1. Migrer chaque produit existant → 1 variante
    DB::statement('
        INSERT INTO produit_variantes (
            produit_id, reference, prix_achat, prix_vente, prix_promo,
            date_debut_promo, date_fin_promo,
            stock_vente, stock_utilisation, stock_reserve,
            seuil_alerte, seuil_critique,
            seuil_alerte_utilisation, seuil_critique_utilisation,
            seuil_alerte_reserve, seuil_critique_reserve,
            type_stock_principal, devise_achat, prix_achat_devise_origine,
            taux_change, frais_cmb, frais_transit, frais_bancaires,
            frais_courtier, frais_transport_local, montant_total_achat,
            prix_achat_stock_total, moyen_paiement, date_commande,
            date_reception, quantite_stock_commande, quantite_min_commande,
            delai_livraison_jours, cbm, poids_kg,
            statut_validation, valide_par, valide_le, motif_rejet,
            cree_par, sync_status, is_active, created_at, updated_at
        )
        SELECT
            id, reference, prix_achat, prix_vente, prix_promo,
            date_debut_promo, date_fin_promo,
            stock_vente, stock_utilisation, stock_reserve,
            seuil_alerte, seuil_critique,
            seuil_alerte_utilisation, seuil_critique_utilisation,
            seuil_alerte_reserve, seuil_critique_reserve,
            type_stock_principal, devise_achat, prix_achat_devise_origine,
            taux_change, frais_cmb, frais_transit, frais_bancaires,
            frais_courtier, frais_transport_local, montant_total_achat,
            prix_achat_stock_total, moyen_paiement, date_commande,
            date_reception, quantite_stock_commande, quantite_min_commande,
            delai_livraison_jours, cbm, poids_kg,
            statut_validation, valide_par, valide_le, motif_rejet,
            cree_par, sync_status, is_active, created_at, updated_at
        FROM produits
    ');

    // 2. Ajouter variante_id sur les tables liées
    Schema::table('mouvements_stock', function (Blueprint $table) {
        $table->foreignId('variante_id')->nullable()->constrained('produit_variantes')->nullOnDelete();
    });
    Schema::table('ventes_details', function (Blueprint $table) {
        $table->foreignId('variante_id')->nullable()->constrained('produit_variantes')->nullOnDelete();
    });
    Schema::table('confection_details', function (Blueprint $table) {
        $table->foreignId('variante_id')->nullable()->constrained('produit_variantes')->nullOnDelete();
    });
    Schema::table('transferts_stock', function (Blueprint $table) {
        $table->foreignId('variante_id')->nullable()->constrained('produit_variantes')->nullOnDelete();
    });
    Schema::table('confections', function (Blueprint $table) {
        $table->foreignId('variante_id')->nullable()->constrained('produit_variantes')->nullOnDelete();
    });
    Schema::table('produit_attribut_valeurs', function (Blueprint $table) {
        $table->foreignId('variante_id')->nullable()->constrained('produit_variantes')->nullOnDelete();
    });

    // 3. Remplir variante_id en se basant sur la correspondance produit_id → variante
    // (la variante créée a le même produit_id que l'ancien produit)
    DB::statement('
        UPDATE mouvements_stock ms
        SET variante_id = pv.id
        FROM produit_variantes pv
        WHERE ms.produit_id = pv.produit_id
    ');
    DB::statement('
        UPDATE ventes_details vd
        SET variante_id = pv.id
        FROM produit_variantes pv
        WHERE vd.produit_id = pv.produit_id
    ');
    DB::statement('
        UPDATE confection_details cd
        SET variante_id = pv.id
        FROM produit_variantes pv
        WHERE cd.produit_id = pv.produit_id
    ');
    DB::statement('
        UPDATE transferts_stock ts
        SET variante_id = pv.id
        FROM produit_variantes pv
        WHERE ts.produit_id = pv.produit_id
    ');
    DB::statement('
        UPDATE confections c
        SET variante_id = pv.id
        FROM produit_variantes pv
        WHERE c.produit_id = pv.produit_id
    ');
    DB::statement('
        UPDATE produit_attribut_valeurs pav
        SET variante_id = pv.id
        FROM produit_variantes pv
        WHERE pav.produit_id = pv.produit_id
    ');
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
{
    // Supprimer variante_id des tables liées
    Schema::table('mouvements_stock', function (Blueprint $table) {
        $table->dropForeign(['variante_id']);
        $table->dropColumn('variante_id');
    });
    Schema::table('ventes_details', function (Blueprint $table) {
        $table->dropForeign(['variante_id']);
        $table->dropColumn('variante_id');
    });
    Schema::table('confection_details', function (Blueprint $table) {
        $table->dropForeign(['variante_id']);
        $table->dropColumn('variante_id');
    });
    Schema::table('transferts_stock', function (Blueprint $table) {
        $table->dropForeign(['variante_id']);
        $table->dropColumn('variante_id');
    });
    Schema::table('confections', function (Blueprint $table) {
        $table->dropForeign(['variante_id']);
        $table->dropColumn('variante_id');
    });
    Schema::table('produit_attribut_valeurs', function (Blueprint $table) {
        $table->dropForeign(['variante_id']);
        $table->dropColumn('variante_id');
    });

    // Vider produit_variantes
    DB::table('produit_variantes')->truncate();
}
};
