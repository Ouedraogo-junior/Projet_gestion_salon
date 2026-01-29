<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salons', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100);
            $table->string('adresse', 255);
            $table->string('telephone', 20);
            $table->string('email', 255)->nullable();
            $table->text('horaires')->nullable()->comment('Horaires d\'ouverture');
            $table->string('logo_url', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salons');
    }
};