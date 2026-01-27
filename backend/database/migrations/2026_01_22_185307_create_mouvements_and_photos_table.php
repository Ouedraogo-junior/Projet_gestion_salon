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
        // Table mouvements_stock
        Schema::create('mouvements_stock', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produit_id')->constrained('produits')->onDelete('cascade');
            $table->enum('type_mouvement', ['entree', 'sortie', 'ajustement', 'inventaire']);
            $table->integer('quantite');
            $table->integer('stock_avant');
            $table->integer('stock_apres');
            $table->text('motif')->nullable();
            $table->foreignId('vente_id')->nullable()->constrained('ventes')->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            // Index
            $table->index('produit_id');
            $table->index('type_mouvement');
            $table->index('created_at');
        });

        // Table photos_clients
        Schema::create('photos_clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('vente_id')->nullable()->constrained('ventes')->onDelete('set null');
            $table->foreignId('rendez_vous_id')->nullable()->constrained('rendez_vous')->onDelete('set null');
            $table->string('photo_url', 255);
            $table->enum('type_photo', ['avant', 'apres']);
            $table->text('description')->nullable();
            $table->date('date_prise')->default(DB::raw('CURRENT_DATE'));
            $table->boolean('is_public')->default(false)->comment('Pour portfolio public');
            $table->timestamps();
            
            // Index
            $table->index('client_id');
            $table->index('type_photo');
            $table->index('is_public');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('photos_clients');
        Schema::dropIfExists('mouvements_stock');
    }
};