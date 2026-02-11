<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('rendez_vous', function (Blueprint $table) {
            $table->dropForeign(['type_prestation_id']);
            $table->dropColumn('type_prestation_id');
        });
    }

    public function down()
    {
        Schema::table('rendez_vous', function (Blueprint $table) {
            $table->foreignId('type_prestation_id')
                ->nullable()
                ->after('client_id')
                ->constrained('types_prestations')
                ->onDelete('cascade');
        });
    }
};