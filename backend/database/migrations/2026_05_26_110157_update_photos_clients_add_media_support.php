<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('photos_clients', function (Blueprint $table) {
            $table->renameColumn('photo_url', 'media_url');
            $table->enum('type_media', ['photo', 'video'])->default('photo')->after('media_url');
            $table->string('nom_coiffure', 255)->nullable()->after('description');
            $table->decimal('montant_coiffure', 10, 2)->nullable()->after('nom_coiffure');
        });
    }

    public function down()
    {
        Schema::table('photos_clients', function (Blueprint $table) {
            $table->renameColumn('media_url', 'photo_url');
            $table->dropColumn(['type_media', 'nom_coiffure', 'montant_coiffure']);
        });
    }
};
