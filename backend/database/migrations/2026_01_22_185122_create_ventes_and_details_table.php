<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table ventes (structure améliorée)
        Schema::create('ventes', function (Blueprint $table) {
            $table->id();
            $table->string('numero_facture', 50)->unique();
            
            // CLIENT (peut être null pour client anonyme)
            $table->foreignId('client_id')->nullable()->constrained('clients')->onDelete('set null');
            // ✅ AJOUTÉ: Informations client anonyme (si client_id = null)
            $table->string('client_nom', 100)->nullable();
            $table->string('client_telephone', 20)->nullable();
            
            // COIFFEUR (seulement si prestation, peut être null pour vente produits uniquement)
            $table->foreignId('coiffeur_id')->nullable()->constrained('users')->onDelete('set null');
            
            // ✅ AJOUTÉ: Utilisateur qui a enregistré la vente (toujours rempli)
            $table->foreignId('vendeur_id')->constrained('users')->onDelete('restrict');
            
            // RENDEZ-VOUS (optionnel)
            $table->foreignId('rendez_vous_id')->nullable()->constrained('rendez_vous')->onDelete('set null');
            
            // ✅ AJOUTÉ: Type de vente
            $table->enum('type_vente', [
                'prestations',      // Seulement prestations
                'produits',         // Seulement produits
                'mixte'            // Prestations + produits
            ])->default('mixte');
            
            $table->timestamp('date_vente')->useCurrent();
            
            // MONTANTS
            $table->decimal('montant_prestations', 10, 2)->default(0);
            $table->decimal('montant_produits', 10, 2)->default(0);
            $table->decimal('montant_total_ht', 10, 2);
            
            // RÉDUCTIONS
            $table->decimal('montant_reduction', 10, 2)->default(0);
            $table->enum('type_reduction', ['fidelite', 'promo', 'manuelle', 'aucune'])->nullable();
            
            $table->decimal('montant_total_ttc', 10, 2);
            
            // PAIEMENT
            $table->enum('mode_paiement', [
                'especes',
                'orange_money',
                'moov_money',
                'carte',
                'mixte'
            ]);
            $table->decimal('montant_paye', 10, 2);
            $table->decimal('montant_rendu', 10, 2)->default(0);
            $table->enum('statut_paiement', ['paye', 'partiel', 'impaye'])->default('paye');
            $table->decimal('solde_restant', 10, 2)->default(0);
            
            // DIVERS
            $table->boolean('recu_imprime')->default(false);
            $table->integer('points_gagnes')->default(0);
            $table->integer('points_utilises')->default(0);
            $table->text('notes')->nullable();
            $table->enum('sync_status', ['synced', 'pending', 'conflict'])->default('synced');
            
            $table->timestamps();
            $table->softDeletes();
            
            // Index
            $table->index('numero_facture');
            $table->index('client_id');
            $table->index('coiffeur_id');
            $table->index('vendeur_id');
            $table->index('type_vente');
            $table->index('date_vente');
            $table->index('statut_paiement');
            $table->index('sync_status');
        });
        
        // Table ventes_details (structure améliorée)
        Schema::create('ventes_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vente_id')->constrained('ventes')->onDelete('cascade');
            
            // TYPE ET RÉFÉRENCE
            $table->enum('type_article', ['prestation', 'produit']);
            $table->string('article_nom', 255);
            
            // ✅ AJOUTÉ: Référence flexible selon le type
            $table->foreignId('prestation_id')->nullable()->constrained('types_prestations')->nullOnDelete();

            $table->foreignId('produit_id')->nullable()->constrained('produits')->onDelete('set null');
            
            // ✅ AJOUTÉ: Détails produit (pour traçabilité même si produit supprimé)
            $table->string('produit_reference', 50)->nullable();
            
            // QUANTITÉ ET PRIX
            $table->integer('quantite')->default(1);
            $table->decimal('prix_unitaire', 10, 2);
            $table->decimal('prix_total', 10, 2);
            
            // ✅ AJOUTÉ: Réduction sur ligne
            $table->decimal('reduction', 10, 2)->default(0);
            
            $table->timestamps();
            
            // Index
            $table->index('vente_id');
            $table->index(['type_article', 'prestation_id']);
            $table->index(['type_article', 'produit_id']);
        });
        
        // ✅ AJOUTÉ: Table pour les paiements mixtes
        Schema::create('ventes_paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vente_id')->constrained('ventes')->onDelete('cascade');
            $table->enum('mode_paiement', [
                'especes',
                'orange_money',
                'moov_money',
                'carte'
            ]);
            $table->decimal('montant', 10, 2);
            $table->string('reference_transaction', 100)->nullable(); // Pour mobile money
            $table->timestamps();
            
            $table->index('vente_id');
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('ventes_paiements');
        Schema::dropIfExists('ventes_details');
        Schema::dropIfExists('ventes');
    }
};