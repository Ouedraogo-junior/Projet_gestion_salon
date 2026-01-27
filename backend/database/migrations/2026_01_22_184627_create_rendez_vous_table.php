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
        Schema::create('rendez_vous', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('coiffeur_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('type_prestation_id')->constrained('types_prestations')->onDelete('restrict');
            $table->timestamp('date_heure');
            $table->integer('duree_minutes');
            $table->decimal('prix_estime', 10, 2)->nullable();
            $table->enum('statut', [
                'en_attente',
                'confirme',
                'en_cours',
                'termine',
                'annule',
                'no_show'
            ])->default('en_attente');
            $table->text('notes')->nullable();
            $table->boolean('acompte_demande')->default(false);
            $table->decimal('acompte_montant', 10, 2)->nullable();
            $table->boolean('acompte_paye')->default(false);
            $table->boolean('sms_confirmation_envoye')->default(false);
            $table->boolean('sms_rappel_24h_envoye')->default(false);
            $table->boolean('sms_rappel_2h_envoye')->default(false);
            $table->text('motif_annulation')->nullable();
            $table->timestamp('date_annulation')->nullable();
            $table->enum('sync_status', ['synced', 'pending', 'conflict'])->default('synced');
            $table->timestamps();
            $table->softDeletes();
            
            // Index
            $table->index('client_id');
            $table->index('coiffeur_id');
            $table->index('type_prestation_id');
            $table->index('date_heure');
            $table->index('statut');
            $table->index(['date_heure', 'coiffeur_id']); // Pour détection conflits
            $table->index('sync_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rendez_vous');
    }
};
