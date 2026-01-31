<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\VenteController;
use App\Http\Controllers\Api\RendezVousController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PointageController;
use App\Http\Controllers\Api\DepenseController;
use App\Http\Controllers\Api\ConfectionController;
use App\Http\Controllers\Api\RapportController;
use App\Http\Controllers\Api\SalonController;
use App\Http\Controllers\Api\CategorieController;
use App\Http\Controllers\Api\AttributController;
use App\Http\Controllers\Api\ProduitController;
use App\Http\Controllers\Api\MouvementStockController;
use App\Http\Controllers\Api\TransfertStockController;
use App\Http\Controllers\Api\TypePrestationController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PublicController;

/*
|--------------------------------------------------------------------------
| API Routes - Application Salon Dreadlocks
|--------------------------------------------------------------------------
| RÔLES :
| - gestionnaire : Accès TOTAL (super admin)
| - gerant : Gestion opérationnelle (validation, config, rapports)
| - coiffeur : Opérations quotidiennes (clients, ventes, RDV)
|--------------------------------------------------------------------------
*/

// ============================================================
// ROUTES PUBLIQUES 
// ============================================================

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});



// Route pour obtenir le salon par défaut
Route::get('/public/salon-defaut', [PublicController::class, 'getSalonDefaut']);

// Routes publiques sans slug (utilise le salon par défaut)
Route::prefix('public')->name('public.')->group(function () {
    Route::get('/prestations', [PublicController::class, 'prestations'])->name('prestations.defaut');
    Route::get('/produits', [PublicController::class, 'produits'])->name('produits.defaut');
    Route::get('/info', [PublicController::class, 'salonInfo'])->name('info.defaut');
});

// Routes publiques avec slug spécifique
Route::prefix('public/{slug}')->name('public.slug.')->group(function () {
    Route::get('/prestations', [PublicController::class, 'prestations'])->name('prestations');
    Route::get('/produits', [PublicController::class, 'produits'])->name('produits');
    Route::get('/info', [PublicController::class, 'salonInfo'])->name('info');
});


Route::post('/rendez-vous/public', [RendezVousController::class, 'storePublic']);
Route::get('/rendez-vous/available-slots', [RendezVousController::class, 'availableSlots']);
Route::post('/rendez-vous/mes-rendez-vous', [RendezVousController::class, 'mesRendezVous']);
Route::post('/rendez-vous/{id}/cancel-public', [RendezVousController::class, 'cancelPublic']);
Route::get('/types-prestations/public', [TypePrestationController::class, 'indexPublic']);
Route::get('/salon/public', [SalonController::class, 'show']);

// ============================================================
// ROUTES PROTÉGÉES
// ============================================================

Route::middleware('auth:sanctum')->group(function () {
    
    // ========================================
    // AUTHENTIFICATION - Tous
    // ========================================
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/change-password', [UserController::class, 'changePassword']);
    });

    // ========================================
    // GESTIONNAIRE UNIQUEMENT - Admin total
    // ========================================
    Route::middleware('check.role:gestionnaire')->group(function () {
        
        // Users - CRUD complet
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
        Route::post('/users/{id}/toggle-active', [UserController::class, 'toggleActive']);
        Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword']);
        Route::patch('/users/{id}/salaire', [UserController::class, 'updateSalaire']);
        Route::get('/users/salaires', [UserController::class, 'getSalaires']);
        Route::get('/users/coiffeurs', [UserController::class, 'getCoiffeurs']);
        
        // Salon - Configuration
        Route::put('/salon', [SalonController::class, 'update']);
        Route::post('/salon/logo', [SalonController::class, 'uploadLogo']);
        Route::delete('/salon/logo', [SalonController::class, 'deleteLogo']);
        
        // Clients - Suppression
        Route::delete('/clients/{id}', [ClientController::class, 'destroy']);
        
        // Catégories - CRUD complet
        Route::post('/categories', [CategorieController::class, 'store']);
        Route::put('/categories/{categorie}', [CategorieController::class, 'update']);
        Route::delete('/categories/{categorie}', [CategorieController::class, 'destroy']);
        Route::post('/categories/{categorie}/attributs', [CategorieController::class, 'associerAttribut']);
        Route::delete('/categories/{categorie}/attributs', [CategorieController::class, 'dissocierAttribut']);
        Route::post('/categories/{categorie}/toggle-active', [CategorieController::class, 'toggleActive']);
        
        // Attributs - CRUD complet
        Route::post('/attributs', [AttributController::class, 'store']);
        Route::put('/attributs/{attribut}', [AttributController::class, 'update']);
        Route::delete('/attributs/{attribut}', [AttributController::class, 'destroy']);
        Route::post('/attributs/{attribut}/valeurs', [AttributController::class, 'ajouterValeurPossible']);
        Route::delete('/attributs/{attribut}/valeurs', [AttributController::class, 'supprimerValeurPossible']);
        
        // Produits - CRUD complet
        Route::post('/produits', [ProduitController::class, 'store']);
        Route::put('/produits/{produit}', [ProduitController::class, 'update']);
        Route::delete('/produits/{produit}', [ProduitController::class, 'destroy']);
        Route::post('/produits/{produit}/toggle-active', [ProduitController::class, 'toggleActive']);
        Route::post('/produits/{id}/photo', [ProduitController::class, 'uploadPhoto']);
        Route::delete('/produits/{id}/photo', [ProduitController::class, 'deletePhoto']);
        
        // Types prestations - CRUD complet
        Route::post('/types-prestations', [TypePrestationController::class, 'store']);
        Route::put('/types-prestations/{id}', [TypePrestationController::class, 'update']);
        Route::delete('/types-prestations/{id}', [TypePrestationController::class, 'destroy']);
        Route::patch('/types-prestations/{id}/toggle-actif', [TypePrestationController::class, 'toggleActif']);
        Route::post('/types-prestations/reorder', [TypePrestationController::class, 'reorder']);
        
        // Ventes - Annulation
        Route::delete('/ventes/{id}/cancel', [VenteController::class, 'cancel']);
        
        // Rendez-vous - Suppression
        Route::delete('/rendez-vous/{id}', [RendezVousController::class, 'destroy']);
        
        // Pointages - CRUD complet
        Route::put('/pointages/{id}', [PointageController::class, 'update']);
        Route::delete('/pointages/{id}', [PointageController::class, 'destroy']);
        
        // Dépenses - CRUD complet
        Route::post('/depenses', [DepenseController::class, 'store']);
        Route::put('/depenses/{depense}', [DepenseController::class, 'update']);
        Route::delete('/depenses/{depense}', [DepenseController::class, 'destroy']);
        
        // Confections - Suppression et annulation
        Route::put('/confections/{id}', [ConfectionController::class, 'update']);
        Route::delete('/confections/{id}', [ConfectionController::class, 'destroy']);
        Route::post('/confections/{id}/annuler', [ConfectionController::class, 'annuler']);
        
        // Transferts - Suppression
        Route::delete('/transferts/{transfert}', [TransfertStockController::class, 'destroy']);
    });

    // ========================================
    // GESTIONNAIRE + GÉRANT - Gestion avancée
    // ========================================
    Route::middleware('check.role:gestionnaire,gerant')->group(function () {
        
        // Transferts stock - Validation
        Route::get('/transferts/en-attente', [TransfertStockController::class, 'enAttente']); // AVANT /{transfert}
        Route::post('/transferts/{transfert}/valider', [TransfertStockController::class, 'valider']);
        Route::post('/transferts/valider-masse', [TransfertStockController::class, 'validerEnMasse']);
        
        // Rapports - Accès complet
        Route::get('/rapports/global', [RapportController::class, 'global']);
        Route::get('/rapports/ventes-detail', [RapportController::class, 'ventesDetail']);
        Route::get('/rapports/tresorerie', [RapportController::class, 'tresorerie']);
        Route::get('/rapports/comparaison-periodes', [RapportController::class, 'comparaisonPeriodes']);
        
        // Dépenses - Consultation stats
        Route::get('/depenses/stats/total-mois', [DepenseController::class, 'totalMois']);
        Route::get('/depenses/stats/par-categorie', [DepenseController::class, 'parCategorie']);
        
        // Mouvements stock - Export
        Route::get('/mouvements-stock/export', [MouvementStockController::class, 'export']);
        
        // Pointages - Stats
        Route::get('/pointages/stats', [PointageController::class, 'stats']);
    });

    // ========================================
    // GESTIONNAIRE + GÉRANT + COIFFEUR - Opérations quotidiennes
    // ========================================
    Route::middleware('check.role:gestionnaire,gerant,coiffeur')->group(function () {
        
        // Clients
        Route::get('/clients', [ClientController::class, 'index']);
        Route::post('/clients', [ClientController::class, 'store']);
        Route::get('/clients/{id}', [ClientController::class, 'show']);
        Route::put('/clients/{id}', [ClientController::class, 'update']);
        Route::post('/clients/{id}/photos', [ClientController::class, 'uploadPhoto']);
        Route::delete('/clients/{clientId}/photos/{photoId}', [ClientController::class, 'deletePhoto']);
        
        // Ventes
        Route::get('/ventes', [VenteController::class, 'index']);
        Route::get('/ventes/stats/summary', [VenteController::class, 'stats']); // AVANT /{id}
        Route::post('/ventes', [VenteController::class, 'store']);
        Route::get('/ventes/{id}', [VenteController::class, 'show']);
        Route::put('/ventes/{id}', [VenteController::class, 'update']);
        Route::get('/ventes/{id}/receipt', [VenteController::class, 'generateReceipt']);
        Route::post('/ventes/check-stock', [VenteController::class, 'checkStock']);
        Route::post('/ventes/calculate-points', [VenteController::class, 'calculatePointsReduction']);
        
        // Rendez-vous
        Route::get('/rendez-vous', [RendezVousController::class, 'index']);
        Route::post('/rendez-vous', [RendezVousController::class, 'store']);
        Route::get('/rendez-vous/{id}', [RendezVousController::class, 'show']);
        Route::put('/rendez-vous/{id}', [RendezVousController::class, 'update']);
        Route::post('/rendez-vous/{id}/confirm', [RendezVousController::class, 'confirm']);
        Route::post('/rendez-vous/{id}/cancel', [RendezVousController::class, 'cancel']);
        Route::post('/rendez-vous/{id}/complete', [RendezVousController::class, 'complete']);
        
        // Pointages
        Route::get('/pointages', [PointageController::class, 'index']);
        Route::get('/pointages/employees-aujourdhui', [PointageController::class, 'employeesAujourdhui']); // AVANT /{id}
        Route::post('/pointages', [PointageController::class, 'store']);
        Route::post('/pointages/{id}/depart', [PointageController::class, 'marquerDepart']);
        
        // Confections
        Route::get('/confections', [ConfectionController::class, 'index']);
        Route::get('/confections/statistiques', [ConfectionController::class, 'statistiques']); // AVANT /{id}
        Route::post('/confections', [ConfectionController::class, 'store']);
        Route::get('/confections/{id}', [ConfectionController::class, 'show']);
        Route::post('/confections/{id}/terminer', [ConfectionController::class, 'terminer']);
        
        // Mouvements stock
        Route::get('/mouvements-stock', [MouvementStockController::class, 'index']);
        Route::post('/mouvements-stock', [MouvementStockController::class, 'store']);
        Route::get('/mouvements-stock/{mouvement}', [MouvementStockController::class, 'show']);
        Route::post('/mouvements-stock/ajuster', [MouvementStockController::class, 'ajuster']);
        
        // Transferts stock
        Route::get('/transferts', [TransfertStockController::class, 'index']);
        Route::get('/transferts/en-attente', [TransfertStockController::class, 'enAttente']); // AVANT /{transfert}
        Route::post('/transferts', [TransfertStockController::class, 'store']);
        Route::get('/transferts/{transfert}', [TransfertStockController::class, 'show']);
        
        // Dépenses - Consultation
        Route::get('/depenses', [DepenseController::class, 'index']);
        Route::get('/depenses/{depense}', [DepenseController::class, 'show']);
    });

    // ========================================
    // LECTURE SEULE - Tous les authentifiés
    // ========================================
    
    // Users
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    
    // Salon
    Route::get('/salon', [SalonController::class, 'show']);
    
    // Catégories
    Route::get('/categories', [CategorieController::class, 'index']);
    Route::get('/categories/{categorie}', [CategorieController::class, 'show']);
    Route::get('/categories/{categorie}/attributs', [CategorieController::class, 'attributs']);
    
    // Attributs
    Route::get('/attributs', [AttributController::class, 'index']);
    Route::get('/attributs/{attribut}', [AttributController::class, 'show']);
    
    // Produits
    Route::get('/produits', [ProduitController::class, 'index']);
    Route::get('/produits/alertes', [ProduitController::class, 'alertes']); // AVANT /{produit}
    Route::get('/produits/{produit}', [ProduitController::class, 'show']);
    Route::get('/produits/{produit}/mouvements', [ProduitController::class, 'mouvements']);
    
    // Types prestations
    Route::get('/types-prestations', [TypePrestationController::class, 'index']);
    Route::get('/types-prestations/stats', [TypePrestationController::class, 'stats']); // AVANT /{id}
    Route::get('/types-prestations/{id}', [TypePrestationController::class, 'show']);
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/count', [NotificationController::class, 'count']); // AVANT /{id}
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']); // AVANT /{id}
    Route::delete('/notifications/read/all', [NotificationController::class, 'deleteRead']); // AVANT /{id}
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
});

// ============================================================
// ROUTE DE TEST
// ============================================================

Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'API Salon - Système de permissions par rôle ✅',
        'version' => '2.0.0',
        'roles' => [
            'gestionnaire' => 'Accès TOTAL (super admin)',
            'gerant' => 'Gestion opérationnelle (validation, config, rapports)',
            'coiffeur' => 'Opérations quotidiennes (clients, ventes, RDV)'
        ],
        'modules' => [
            'auth' => 'OK',
            'salon' => 'OK',
            'users' => 'OK',
            'categories' => 'OK',
            'attributs' => 'OK',
            'produits' => 'OK',
            'mouvements_stock' => 'OK',
            'transferts' => 'OK',
            'types_prestations' => 'OK',
            'clients' => 'OK',
            'ventes' => 'OK',
            'rendez_vous' => 'OK',
            'pointages' => 'OK',
            'depenses' => 'OK',
            'confections' => 'OK',
            'rapports' => 'OK',
            'notifications' => 'OK'
        ],
        'timestamp' => now()
    ]);
});