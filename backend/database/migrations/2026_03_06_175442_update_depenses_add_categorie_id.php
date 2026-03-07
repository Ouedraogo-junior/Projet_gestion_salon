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
        Schema::table('depenses', function (Blueprint $table) {
            $table->foreignId('categorie_depense_id')
                ->nullable()
                ->after('categorie')
                ->constrained('categories_depenses')
                ->nullOnDelete();

            $table->dropColumn('categorie');
        });
    }

    public function down(): void
    {
        Schema::table('depenses', function (Blueprint $table) {
            $table->string('categorie', 255)->after('description');
            $table->dropForeign(['categorie_depense_id']);
            $table->dropColumn('categorie_depense_id');
        });
    }
};
