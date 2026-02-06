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
            $table->decimal('cbm', 10, 4)->nullable()->comment('Volume en m³');
            $table->decimal('poids_kg', 10, 2)->nullable()->comment('Poids en kg');
            $table->decimal('frais_bancaires', 10, 2)->nullable()->comment('Frais bancaires (devise achat)');
            $table->decimal('frais_courtier', 10, 2)->nullable()->comment('Frais courtier (devise achat)');
            $table->decimal('frais_transport_local', 10, 2)->nullable()->comment('Transport local (devise achat)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->dropColumn([
                'cbm',
                'poids_kg',
                'frais_bancaires',
                'frais_courtier',
                'frais_transport_local',
            ]);
        });
    }
};