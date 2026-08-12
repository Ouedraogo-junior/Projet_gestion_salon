<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('realisations', function (Blueprint $table) {
            $table->boolean('is_epingle')->default(false)->after('is_public');
            $table->index('is_epingle');
        });
    }

    public function down(): void
    {
        Schema::table('realisations', function (Blueprint $table) {
            $table->dropIndex(['is_epingle']);
            $table->dropColumn('is_epingle');
        });
    }
};