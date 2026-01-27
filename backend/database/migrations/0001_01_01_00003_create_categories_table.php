<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100)->unique();
            $table->string('slug', 100)->unique();
            $table->text('description')->nullable();
            $table->string('icone', 50)->nullable(); // Pour afficher une icône
            $table->string('couleur', 20)->nullable(); // Code couleur hexadécimal
            $table->boolean('is_active')->default(true);
            $table->integer('ordre')->default(0); // Pour trier les catégories
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('is_active');
            $table->index('ordre');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};