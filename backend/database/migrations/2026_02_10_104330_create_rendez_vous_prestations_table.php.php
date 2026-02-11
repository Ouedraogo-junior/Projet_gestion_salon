<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('rendez_vous_prestations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rendez_vous_id')->constrained('rendez_vous')->onDelete('cascade'); // ← Spécifier le nom exact
            $table->foreignId('type_prestation_id')->constrained('types_prestations')->onDelete('cascade');
            $table->integer('ordre')->default(1);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('rendez_vous_prestations');
    }
};
