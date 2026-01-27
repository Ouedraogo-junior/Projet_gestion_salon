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
        Schema::table('mouvements_stock', function (Blueprint $table) {
            $table->enum('type_stock', ['vente', 'utilisation'])->default('vente')->after('produit_id');
            $table->foreignId('transfert_id')->nullable()->constrained('transferts_stock')->onDelete('set null')->after('vente_id');
            $table->foreignId('confection_id')->nullable()->constrained('confections')->onDelete('set null')->after('transfert_id');
            
            $table->index('type_stock');
            $table->index('transfert_id');
            $table->index('confection_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mouvements_stock', function (Blueprint $table) {
            //
        });
    }
};
