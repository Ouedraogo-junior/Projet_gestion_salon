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

// ===== CONTROLLERS MODULE PRODUITS =====
use App\Http\Controllers\Api\CategorieController;
use App\Http\Controllers\Api\AttributController;
use App\Http\Controllers\Api\ProduitController;
use App\Http\Controllers\Api\MouvementStockController;
use App\Http\Controllers\Api\TransfertStockController;

// ===== CONTROLLERS MODULE PRESTATIONS =====
use App\Http\Controllers\Api\TypePrestationController;

/*
|--------------------------------------------------------------------------
| API Routes - Application Salon Dreadlocks
|--------------------------------------------------------------------------
| Organisation : Module par module
| Authentification : Sanctum (sauf routes publiques)
| Version : 1.1.0
|--------------------------------------------------------------------------
*/

// ============================================================
// ROUTES PUBLIQUES 
// ============================================================

// Authentification
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});


// Route publique pour prise de RDV (sans auth)
Route::post('/rendez-vous/public', [RendezVousController::class, 'storePublic']);
Route::get('/rendez-vous/available-slots', [RendezVousController::class, 'availableSlots']);
Route::post('/rendez-vous/mes-rendez-vous', [RendezVousController::class, 'mesRendezVous']);
Route::post('/rendez-vous/{id}/cancel-public', [RendezVousController::class, 'cancelPublic']);

// Routes publiques (sans auth)
Route::get('/types-prestations/public', [TypePrestationController::class, 'indexPublic']);

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
    // MODULE PRESTATIONS - TYPES DE PRESTATIONS
    // ========================================
    Route::prefix('types-prestations')->group(function () {
        // Liste et recherche
        Route::get('/', [TypePrestationController::class, 'index']); // Liste avec filtres
        Route::get('/stats', [TypePrestationController::class, 'stats']); // Statistiques
        
        // CRUD
        Route::post('/', [TypePrestationController::class, 'store']); // Créer
        Route::get('/{id}', [TypePrestationController::class, 'show']); // Détails
        Route::put('/{id}', [TypePrestationController::class, 'update']); // Modifier
        Route::delete('/{id}', [TypePrestationController::class, 'destroy']); // Supprimer
        
        // Actions
        Route::patch('/{id}/toggle-actif', [TypePrestationController::class, 'toggleActif']); // Activer/Désactiver
        Route::post('/reorder', [TypePrestationController::class, 'reorder']); // Réorganiser
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
        // Liste et statistiques
        Route::get('/', [VenteController::class, 'index']); // Liste avec filtres
        Route::get('/stats/summary', [VenteController::class, 'stats']); // Statistiques
        
        // CRUD
        Route::post('/', [VenteController::class, 'store']); // Créer vente
        Route::get('/{id}', [VenteController::class, 'show']); // Détails
        Route::put('/{id}', [VenteController::class, 'update']); // Modifier (notes uniquement)
        
        // Actions
        Route::delete('/{id}/cancel', [VenteController::class, 'cancel']); // Annuler (admin)
        Route::get('/{id}/receipt', [VenteController::class, 'generateReceipt']); // Reçu PDF
        
        // Utilitaires
        Route::post('/check-stock', [VenteController::class, 'checkStock']); // Vérifier stock
        Route::post('/calculate-points', [VenteController::class, 'calculatePointsReduction']); // Calculer réduction points
    });

    // ========================================
    // MODULE RENDEZ-VOUS
    // ========================================
    Route::prefix('rendez-vous')->group(function () {
        Route::get('/', [RendezVousController::class, 'index']); // Liste + filtres
        Route::post('/', [RendezVousController::class, 'store']); // Créer (gérant)
        Route::get('/{id}', [RendezVousController::class, 'show']); // Détails
        Route::put('/{id}', [RendezVousController::class, 'update']); // Modifier
        Route::delete('/{id}', [RendezVousController::class, 'destroy']); // Supprimer
        
        // Actions
        Route::post('/{id}/confirm', [RendezVousController::class, 'confirm']); // Confirmer
        Route::post('/{id}/cancel', [RendezVousController::class, 'cancel']); // Annuler
        Route::post('/{id}/complete', [RendezVousController::class, 'complete']); // Terminer
    });


    // ========================================
    // MODULE POINTAGES
    // ========================================

    Route::prefix('pointages')->group(function () {
        Route::get('/', [PointageController::class, 'index']);
        Route::post('/', [PointageController::class, 'store']);
        Route::put('/{id}', [PointageController::class, 'update']);
        Route::post('/{id}/depart', [PointageController::class, 'marquerDepart']);
        Route::delete('/{id}', [PointageController::class, 'destroy']);
        Route::get('/stats', [PointageController::class, 'stats']);
        Route::get('/employees-aujourdhui', [PointageController::class, 'employeesAujourdhui']);
    });

    // ========================================
    // MODULE UTILISATEURS
    // ========================================
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']); // Liste avec filtres
        Route::get('/{id}', [UserController::class, 'show']); // Détails
    });


    // ========================================
    // MODULE DÉPENSES
    // ========================================
    Route::prefix('depenses')->group(function () {
        // Routes stats AVANT les routes resource
        Route::get('stats/total-mois', [DepenseController::class, 'totalMois']);
        Route::get('stats/par-categorie', [DepenseController::class, 'parCategorie']);
        
        // Routes CRUD (apiResource après)
        Route::get('/', [DepenseController::class, 'index']);
        Route::post('/', [DepenseController::class, 'store']);
        Route::get('{depense}', [DepenseController::class, 'show']);
        Route::put('{depense}', [DepenseController::class, 'update']);
        Route::delete('{depense}', [DepenseController::class, 'destroy']);
    });


    // ========================================
    // MODULE CONFECTIONS DE PRODUITS
    // ========================================
    Route::prefix('confections')->group(function () {
    
        // Liste et statistiques
        Route::get('/', [ConfectionController::class, 'index']);
        Route::get('/statistiques', [ConfectionController::class, 'statistiques']);
        
        // CRUD
        Route::post('/', [ConfectionController::class, 'store']);
        Route::get('/{id}', [ConfectionController::class, 'show']);
        Route::put('/{id}', [ConfectionController::class, 'update']);
        Route::delete('/{id}', [ConfectionController::class, 'destroy']);
        
        // Actions spécifiques
        Route::post('/{id}/terminer', [ConfectionController::class, 'terminer']);
        Route::post('/{id}/annuler', [ConfectionController::class, 'annuler']);
    });



        // ========================================
        // ROUTES RAPPORTS
        // ========================================
    Route::prefix('rapports')->group(function () {
        Route::get('/global', [RapportController::class, 'global']);
        Route::get('/ventes-detail', [RapportController::class, 'ventesDetail']);
        Route::get('/tresorerie', [RapportController::class, 'tresorerie']);
        Route::get('/comparaison-periodes', [RapportController::class, 'comparaisonPeriodes']);
        });
});

// ============================================================
// ROUTE DE TEST
// ============================================================

Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'API Salon Dreadlocks - Module Prestations Intégré ✅',
        'version' => '1.2.0',
        'modules' => [
            'auth' => 'OK',
            'categories' => 'OK',
            'attributs' => 'OK',
            'produits' => 'OK',
            'mouvements_stock' => 'OK',
            'transferts' => 'OK',
            'types_prestations' => 'OK ✅ (Nouveau)',
            'clients' => 'OK',
            'ventes' => 'OK',
            'rendez_vous' => 'OK',
        ],
        'timestamp' => now()
    ]);
});