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
        Schema::table('produits', function (Blueprint $table) {
            // Renommer stock_actuel en stock_vente
            $table->renameColumn('stock_actuel', 'stock_vente');
            
            // Ajouter stock_utilisation
            $table->integer('stock_utilisation')->default(0)->after('stock_vente');
            
            // Seuils spécifiques par type de stock
            $table->integer('seuil_alerte_utilisation')->default(5)->after('seuil_critique');
            $table->integer('seuil_critique_utilisation')->default(2)->after('seuil_alerte_utilisation');
            
            // Type de produit par défaut
            $table->enum('type_stock_principal', ['vente', 'utilisation', 'mixte'])->default('mixte')->after('categorie_id');
            
            // Index
            $table->index('stock_utilisation');
            $table->index('type_stock_principal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            //
        });
    }
};
