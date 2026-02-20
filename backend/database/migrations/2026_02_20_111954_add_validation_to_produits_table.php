<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->enum('statut_validation', ['en_attente', 'valide', 'rejete'])
                  ->default('en_attente')
                  ->after('salon_id');
            $table->foreignId('valide_par')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete()
                  ->after('statut_validation');
            $table->timestamp('valide_le')->nullable()->after('valide_par');
            $table->text('motif_rejet')->nullable()->after('valide_le');
            $table->foreignId('cree_par')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete()
                  ->after('motif_rejet');
        });
    }

    public function down(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->dropForeign(['valide_par']);
            $table->dropForeign(['cree_par']);
            $table->dropColumn(['statut_validation', 'valide_par', 'valide_le', 'motif_rejet', 'cree_par']);
        });
    }
};