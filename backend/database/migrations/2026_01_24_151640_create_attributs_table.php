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
        Schema::create('attributs', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100); // Ex: "Longueur", "Qualité", "Épaisseur"
            $table->string('slug', 100)->unique();
            $table->enum('type_valeur', ['texte', 'nombre', 'liste'])->default('texte');
            $table->json('valeurs_possibles')->nullable(); // Pour type "liste": ["14\"", "18\"", "24\""]
            $table->string('unite', 20)->nullable(); // Ex: "pouces", "grammes", "cm"
            $table->boolean('obligatoire')->default(false);
            $table->integer('ordre')->default(0);
            $table->timestamps();
            
            $table->index('slug');
        });

        // Table pivot : Associer attributs aux catégories
        Schema::create('categorie_attribut', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categorie_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('attribut_id')->constrained('attributs')->onDelete('cascade');
            $table->boolean('obligatoire')->default(false);
            $table->integer('ordre')->default(0);
            $table->timestamps();
            
            $table->unique(['categorie_id', 'attribut_id']);
        });

        // Table : Valeurs d'attributs pour chaque produit
        Schema::create('produit_attribut_valeurs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produit_id')->constrained('produits')->onDelete('cascade');
            $table->foreignId('attribut_id')->constrained('attributs')->onDelete('cascade');
            $table->string('valeur', 255);
            $table->timestamps();
            
            $table->unique(['produit_id', 'attribut_id']);
            $table->index('produit_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produit_attribut_valeurs');
        Schema::dropIfExists('categorie_attribut');
        Schema::dropIfExists('attributs');
    }
};
