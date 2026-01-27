<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\VenteController;
use App\Http\Controllers\Api\RendezVousController;

// ===== CONTROLLERS MODULE PRODUITS =====
use App\Http\Controllers\Api\CategorieController;
use App\Http\Controllers\Api\AttributController;
use App\Http\Controllers\Api\ProduitController;
use App\Http\Controllers\Api\MouvementStockController;
use App\Http\Controllers\Api\TransfertStockController;

/*
|--------------------------------------------------------------------------
| API Routes - Application Salon Dreadlocks
|--------------------------------------------------------------------------
| Organisation : Module par module
| Authentification : Sanctum (sauf routes publiques)
| Version : 1.0.0
|--------------------------------------------------------------------------
*/

// ============================================================
// ROUTES PUBLIQUES (Authentification)
// ============================================================

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// ============================================================
// ROUTES PROTÉGÉES (Authentification requise)
// ============================================================

Route::middleware('auth:sanctum')->group(function () {
    
    // ========================================
    // AUTHENTIFICATION
    // ========================================
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::get('/me', [AuthController::class, 'me']);
    });

    // ========================================
    // MODULE PRODUITS - CATÉGORIES
    // ========================================
    Route::prefix('categories')->group(function () {
        Route::get('/', [CategorieController::class, 'index']); // Liste avec filtres
        Route::post('/', [CategorieController::class, 'store']); // Créer
        Route::get('/{categorie}', [CategorieController::class, 'show']); // Détails
        Route::put('/{categorie}', [CategorieController::class, 'update']); // Modifier
        Route::delete('/{categorie}', [CategorieController::class, 'destroy']); // Supprimer
        
        // Gestion attributs
        Route::get('/{categorie}/attributs', [CategorieController::class, 'attributs']); // Liste attributs
        Route::post('/{categorie}/attributs', [CategorieController::class, 'associerAttribut']); // Associer
        Route::delete('/{categorie}/attributs', [CategorieController::class, 'dissocierAttribut']); // Dissocier
        
        // Actions
        Route::post('/{categorie}/toggle-active', [CategorieController::class, 'toggleActive']); // Activer/Désactiver
    });

    // ========================================
    // MODULE PRODUITS - ATTRIBUTS
    // ========================================
    Route::prefix('attributs')->group(function () {
        Route::get('/', [AttributController::class, 'index']); // Liste avec filtres
        Route::post('/', [AttributController::class, 'store']); // Créer
        Route::get('/{attribut}', [AttributController::class, 'show']); // Détails
        Route::put('/{attribut}', [AttributController::class, 'update']); // Modifier
        Route::delete('/{attribut}', [AttributController::class, 'destroy']); // Supprimer
        
        // Gestion valeurs possibles (type liste)
        Route::post('/{attribut}/valeurs', [AttributController::class, 'ajouterValeurPossible']); // Ajouter valeur
        Route::delete('/{attribut}/valeurs', [AttributController::class, 'supprimerValeurPossible']); // Supprimer valeur
    });

    // ========================================
    // MODULE PRODUITS - PRODUITS
    // ========================================
    Route::prefix('produits')->group(function () {
        // Liste et recherche
        Route::get('/', [ProduitController::class, 'index']); // Liste avec filtres avancés
        Route::get('/alertes', [ProduitController::class, 'alertes']); // Produits en alerte stock
        
        // CRUD
        Route::post('/', [ProduitController::class, 'store']); // Créer avec attributs
        Route::get('/{produit}', [ProduitController::class, 'show']); // Détails complets
        Route::put('/{produit}', [ProduitController::class, 'update']); // Modifier
        Route::delete('/{produit}', [ProduitController::class, 'destroy']); // Supprimer
        
        // Actions
        Route::post('/{produit}/toggle-active', [ProduitController::class, 'toggleActive']); // Activer/Désactiver
        Route::get('/{produit}/mouvements', [ProduitController::class, 'mouvements']); // Historique mouvements
    });

    // ========================================
    // MODULE PRODUITS - MOUVEMENTS STOCK
    // ========================================
    Route::prefix('mouvements-stock')->group(function () {
        Route::get('/', [MouvementStockController::class, 'index']); // Liste avec filtres
        Route::post('/', [MouvementStockController::class, 'store']); // Créer mouvement manuel
        Route::get('/{mouvement}', [MouvementStockController::class, 'show']); // Détails
        
        // Actions spéciales
        Route::post('/ajuster', [MouvementStockController::class, 'ajuster']); // Ajustement rapide
        Route::get('/export', [MouvementStockController::class, 'export']); // Export CSV
    });

    // ========================================
    // MODULE PRODUITS - TRANSFERTS STOCK
    // ========================================
    Route::prefix('transferts')->group(function () {
        Route::get('/', [TransfertStockController::class, 'index']); // Liste avec filtres
        Route::post('/', [TransfertStockController::class, 'store']); // Créer transfert
        Route::get('/{transfert}', [TransfertStockController::class, 'show']); // Détails
        Route::delete('/{transfert}', [TransfertStockController::class, 'destroy']); // Annuler (si non validé)
        
        // Validation (Gérant uniquement)
        Route::post('/{transfert}/valider', [TransfertStockController::class, 'valider']); // Valider
        Route::get('/en-attente', [TransfertStockController::class, 'enAttente']); // Liste en attente
        Route::post('/valider-masse', [TransfertStockController::class, 'validerEnMasse']); // Validation multiple
    });

    // ========================================
    // MODULE CLIENTS
    // ========================================
    Route::prefix('clients')->group(function () {
        Route::get('/', [ClientController::class, 'index']); // Liste + recherche
        Route::post('/', [ClientController::class, 'store']); // Créer
        Route::get('/{id}', [ClientController::class, 'show']); // Détails
        Route::put('/{id}', [ClientController::class, 'update']); // Modifier
        Route::delete('/{id}', [ClientController::class, 'destroy']); // Supprimer
        
        // Photos
        Route::post('/{id}/photos', [ClientController::class, 'uploadPhoto']);
        Route::delete('/{clientId}/photos/{photoId}', [ClientController::class, 'deletePhoto']);
    });

    // ========================================
    // MODULE VENTES
    // ========================================
    Route::prefix('ventes')->group(function () {
        Route::get('/', [VenteController::class, 'index']); // Liste + filtres
        Route::post('/', [VenteController::class, 'store']); // Créer vente
        Route::get('/stats', [VenteController::class, 'stats']); // Statistiques
        Route::get('/{id}', [VenteController::class, 'show']); // Détails
        Route::put('/{id}', [VenteController::class, 'update']); // Modifier (limité)
        Route::post('/{id}/cancel', [VenteController::class, 'cancel']); // Annuler
        Route::get('/{id}/receipt', [VenteController::class, 'generateReceipt']); // Reçu PDF
    });

    // ========================================
    // MODULE RENDEZ-VOUS
    // ========================================
    Route::prefix('rendez-vous')->group(function () {
        Route::get('/', [RendezVousController::class, 'index']); // Liste + filtres
        Route::post('/', [RendezVousController::class, 'store']); // Créer
        Route::get('/available-slots', [RendezVousController::class, 'availableSlots']); // Créneaux dispo
        Route::get('/{id}', [RendezVousController::class, 'show']); // Détails
        Route::put('/{id}', [RendezVousController::class, 'update']); // Modifier
        Route::delete('/{id}', [RendezVousController::class, 'destroy']); // Supprimer
        
        // Actions
        Route::post('/{id}/confirm', [RendezVousController::class, 'confirm']);
        Route::post('/{id}/cancel', [RendezVousController::class, 'cancel']);
        Route::post('/{id}/complete', [RendezVousController::class, 'complete']);
    });

    // ========================================
    // ROUTES ADMIN/GÉRANT SEULEMENT
    // ========================================
    Route::middleware(['check.role:admin,gerant'])->group(function () {
        
        // Statistiques globales
        Route::get('/dashboard/stats', function () {
            return response()->json(['message' => 'Dashboard stats - Phase 2']);
        });
        
        // Rapports
        Route::get('/reports/sales', function () {
            return response()->json(['message' => 'Sales reports - Phase 2']);
        });
    });
});

// ============================================================
// ROUTE DE TEST
// ============================================================

Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'API Salon Dreadlocks - Module Produits Complet',
        'version' => '1.0.0',
        'modules' => [
            'auth' => 'OK',
            'categories' => 'OK',
            'attributs' => 'OK',
            'produits' => 'OK',
            'mouvements_stock' => 'OK',
            'transferts' => 'OK',
            'clients' => 'OK',
            'ventes' => 'OK',
            'rendez_vous' => 'OK',
        ],
        'timestamp' => now()
    ]);
});