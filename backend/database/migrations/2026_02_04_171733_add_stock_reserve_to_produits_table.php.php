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
            $table->integer('stock_reserve')->default(0)->after('stock_utilisation');
            $table->integer('seuil_alerte_reserve')->nullable()->after('seuil_critique_utilisation');
            $table->integer('seuil_critique_reserve')->nullable()->after('seuil_alerte_reserve');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->dropColumn(['stock_reserve', 'seuil_alerte_reserve', 'seuil_critique_reserve']);
        });
    }
};
