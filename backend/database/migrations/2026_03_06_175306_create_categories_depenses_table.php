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
        Schema::create('categories_depenses', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100)->unique();
            $table->string('slug', 100)->unique();
            $table->string('couleur', 20)->nullable();
            $table->string('icone', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('ordre')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_active');
            $table->index('ordre');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories_depenses');
    }
};
