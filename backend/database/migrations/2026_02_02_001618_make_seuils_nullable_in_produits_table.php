<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            // Rendre les seuils nullable
            $table->integer('seuil_alerte')->nullable()->change();
            $table->integer('seuil_critique')->nullable()->change();
            $table->integer('seuil_alerte_utilisation')->nullable()->change();
            $table->integer('seuil_critique_utilisation')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->integer('seuil_alerte')->default(20)->change();
            $table->integer('seuil_critique')->default(10)->change();
            $table->integer('seuil_alerte_utilisation')->default(15)->change();
            $table->integer('seuil_critique_utilisation')->default(5)->change();
        });
    }
};