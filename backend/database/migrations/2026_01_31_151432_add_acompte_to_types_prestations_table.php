<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('types_prestations', function (Blueprint $table) {
            $table->boolean('acompte_requis')->default(false)->after('prix_base');
            $table->decimal('acompte_montant', 10, 2)->nullable()->after('acompte_requis');
            $table->decimal('acompte_pourcentage', 5, 2)->nullable()->after('acompte_montant');
        });
    }

    public function down(): void
    {
        Schema::table('types_prestations', function (Blueprint $table) {
            $table->dropColumn(['acompte_requis', 'acompte_montant', 'acompte_pourcentage']);
        });
    }
};