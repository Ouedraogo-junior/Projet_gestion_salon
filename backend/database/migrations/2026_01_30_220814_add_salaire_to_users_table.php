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
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('salaire_mensuel', 10, 2)->nullable()->after('specialite')->comment('Salaire mensuel en FCFA');
            $table->index('salaire_mensuel');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['salaire_mensuel']);
            $table->dropColumn('salaire_mensuel');
        });
    }
};