<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('produits', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 255);
            $table->string('reference', 50)->nullable()->unique();
            $table->text('description')->nullable();
            
            // Remplacer l'enum par une clé étrangère
            $table->foreignId('categorie_id')
                  ->constrained('categories')
                  ->onDelete('restrict'); // Empêche la suppression d'une catégorie utilisée
            
            $table->string('marque', 100)->nullable();
            $table->string('fournisseur', 100)->nullable();
            $table->decimal('prix_achat', 10, 2);
            $table->decimal('prix_vente', 10, 2);
            $table->decimal('prix_promo', 10, 2)->nullable();
            $table->date('date_debut_promo')->nullable();
            $table->date('date_fin_promo')->nullable();
            $table->integer('stock_actuel')->default(0);
            $table->integer('seuil_alerte')->default(5);
            $table->integer('seuil_critique')->default(2);
            $table->string('photo_url', 255)->nullable();
            $table->integer('quantite_min_commande')->nullable();
            $table->integer('delai_livraison_jours')->nullable();
            $table->boolean('is_active')->default(true);
            $table->enum('sync_status', ['synced', 'pending', 'conflict'])->default('synced');
            $table->timestamps();
            $table->softDeletes();
            
            // Index
            $table->index('nom');
            $table->index('categorie_id');
            $table->index('stock_actuel');
            $table->index('is_active');
            $table->index('sync_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produits');
    }
};