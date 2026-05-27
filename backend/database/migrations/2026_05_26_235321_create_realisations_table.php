<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('realisations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->nullable()->constrained('clients')->onDelete('set null');
            $table->string('nom_coiffure', 255)->nullable();
            $table->decimal('montant_coiffure', 10, 2)->nullable();
            $table->text('description')->nullable();
            $table->date('date_prise')->default(DB::raw('CURRENT_DATE'));
            $table->boolean('is_public')->default(true);
            $table->timestamps();

            $table->index('client_id');
            $table->index('is_public');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('realisations');
    }
};
