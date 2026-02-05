<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->decimal('taux_change', 10, 4)->nullable()->after('devise_achat');
            $table->decimal('prix_achat_devise_origine', 12, 2)->nullable()->after('taux_change');
            $table->decimal('prix_achat_stock_total', 12, 2)->nullable()->after('prix_achat_devise_origine');
            $table->integer('quantite_stock_commande')->nullable()->after('prix_achat_stock_total');
        });
    }

    public function down()
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->dropColumn([
                'taux_change',
                'prix_achat_devise_origine', 
                'prix_achat_stock_total',
                'quantite_stock_commande'
            ]);
        });
    }
};