<?php
// database/migrations/2025_02_01_000002_add_salon_id_to_types_prestations.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('types_prestations', function (Blueprint $table) {
            $table->foreignId('salon_id')->default(1)->after('id')->constrained('salons')->onDelete('cascade');
            $table->index('salon_id');
        });
    }

    public function down(): void
    {
        Schema::table('types_prestations', function (Blueprint $table) {
            $table->dropForeign(['salon_id']);
            $table->dropIndex(['salon_id']);
            $table->dropColumn('salon_id');
        });
    }
};