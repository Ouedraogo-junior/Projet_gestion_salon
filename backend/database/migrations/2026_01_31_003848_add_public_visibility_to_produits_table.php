<?php
// database/migrations/xxxx_add_public_visibility_to_produits.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->boolean('visible_public')->default(true)->after('is_active');
            $table->index('visible_public');
        });
    }

    public function down(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->dropIndex(['visible_public']);
            $table->dropColumn('visible_public');
        });
    }
};