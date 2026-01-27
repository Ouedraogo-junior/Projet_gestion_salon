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
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100);
            $table->string('prenom', 100);
            $table->string('telephone', 20)->unique()->comment('Format: +226XXXXXXXX');
            $table->string('email', 255)->nullable();
            $table->date('date_naissance')->nullable();
            $table->text('adresse')->nullable();
            $table->date('date_premiere_visite')->default(DB::raw('CURRENT_DATE'));
            $table->date('date_derniere_visite')->nullable();
            $table->integer('points_fidelite')->default(0);
            $table->decimal('montant_total_depense', 12, 2)->default(0)->comment('Lifetime value');
            $table->text('notes')->nullable()->comment('Préférences, allergies, etc.');
            $table->boolean('is_active')->default(true);
            $table->enum('sync_status', ['synced', 'pending', 'conflict'])->default('synced');
            $table->timestamps();
            $table->softDeletes();
            
            // Index pour optimisation
            $table->index('telephone');
            $table->index(['nom', 'prenom']);
            $table->index('date_derniere_visite');
            $table->index('points_fidelite');
            $table->index('is_active');
            $table->index('sync_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};