<?php
// database/migrations/xxxx_add_slug_to_salons.php (si pas déjà existant)

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('salons', function (Blueprint $table) {
            $table->string('slug')->unique()->nullable()->after('nom');
            $table->index('slug');
        });

        // Générer les slugs pour les salons existants
        DB::table('salons')->get()->each(function ($salon) {
            DB::table('salons')
                ->where('id', $salon->id)
                ->update(['slug' => Str::slug($salon->nom)]);
        });
    }

    public function down(): void
    {
        Schema::table('salons', function (Blueprint $table) {
            $table->dropIndex(['slug']);
            $table->dropColumn('slug');
        });
    }
};