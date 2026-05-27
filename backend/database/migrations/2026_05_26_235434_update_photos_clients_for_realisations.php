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
         Schema::table('photos_clients', function (Blueprint $table) {
            $table->foreignId('realisation_id')->nullable()->after('id')
                ->constrained('realisations')->onDelete('cascade');
            $table->foreignId('client_id')->nullable()->change();
            $table->dropColumn(['nom_coiffure', 'montant_coiffure', 'description', 'is_public']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('photos_clients', function (Blueprint $table) {
            $table->dropForeign(['realisation_id']);
            $table->dropColumn('realisation_id');
            $table->foreignId('client_id')->nullable(false)->change();
            $table->string('nom_coiffure', 255)->nullable();
            $table->decimal('montant_coiffure', 10, 2)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(true);
        });
    }
};
