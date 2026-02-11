<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\CompteArreteMail;

// Models
use App\Models\Vente;
use App\Models\Depense;
use App\Models\RendezVous;
use App\Models\Confection;
use App\Models\VenteDetail;
use App\Models\TypePrestation;
use App\Models\Produit;

class RapportController extends Controller
{
    /**
     * Rapport global : CA, Dépenses, Bénéfices
     * GET /api/rapports/global
     */
    public function global(Request $request)
{
    $validated = $request->validate([
        'type' => 'required|in:jour,semaine,mois,annee,personnalisee',
        'date_debut' => 'required|date',
        'date_fin' => 'required|date|after_or_equal:date_debut',
        'annee' => 'nullable|integer|min:2020',
        'mois' => 'nullable|integer|min:1|max:12',
        'semaine' => 'nullable|integer|min:1|max:53',
    ]);

    $dateDebut = Carbon::parse($validated['date_debut'])->startOfDay();
    $dateFin = Carbon::parse($validated['date_fin'])->endOfDay();

    // ========================================
    // 1. CHIFFRE D'AFFAIRES
    // ========================================
    
    $ventesStats = Vente::whereBetween('date_vente', [$dateDebut, $dateFin])
        ->whereIn('statut_paiement', ['paye', 'partiel'])
        ->selectRaw('
            SUM(montant_paye) as total_encaisse,
            SUM(montant_prestations) as total_prestations,
            SUM(montant_produits) as total_produits,
            COUNT(*) as nb_ventes
        ')
        ->first();

    $caVentesDirectes = $ventesStats->total_encaisse ?? 0;
    $caPrestations = $ventesStats->total_prestations ?? 0;
    $caProduits = $ventesStats->total_produits ?? 0;

    $caConfectionsVendues = VenteDetail::join('ventes', 'ventes_details.vente_id', '=', 'ventes.id')
        ->join('produits', 'ventes_details.produit_id', '=', 'produits.id')
        ->join('confections', 'confections.produit_id', '=', 'produits.id')
        ->whereBetween('ventes.date_vente', [$dateDebut, $dateFin])
        ->whereIn('ventes.statut_paiement', ['paye', 'partiel'])
        ->sum(DB::raw('ventes_details.quantite * ventes_details.prix_unitaire'));

    $caAcomptesRdv = RendezVous::whereBetween('date_heure', [$dateDebut, $dateFin])
        ->where('acompte_paye', true)
        ->sum('acompte_montant');

    $caTotal = $caVentesDirectes + $caAcomptesRdv;

    // ========================================
    // 2. DÉPENSES
    // ========================================
    
    $depensesStats = Depense::whereBetween('date_depense', [$dateDebut, $dateFin])
        ->selectRaw('
            SUM(montant) as total,
            categorie,
            SUM(montant) as montant_categorie
        ')
        ->groupBy('categorie')
        ->get();

    $totalDepenses = $depensesStats->sum('total');
    
    $depensesParCategorie = $depensesStats->map(function ($item) use ($totalDepenses) {
        return [
            'categorie' => $item->categorie,
            'montant' => (float) $item->montant_categorie,
            'pourcentage' => $totalDepenses > 0 
                ? round(($item->montant_categorie / $totalDepenses) * 100, 2) 
                : 0,
        ];
    });

    $coutsConfections = Confection::whereBetween('date_confection', [$dateDebut, $dateFin])
        ->where('statut', 'terminee')
        ->sum('cout_total');

    // ========================================
    // 2.1 SALAIRES (NOUVEAU)
    // ========================================
    
    $employes = User::where('is_active', true)
        ->whereNotNull('salaire_mensuel')
        ->get();
    
    $totalSalairesMensuel = $employes->sum('salaire_mensuel');
    
    // Calculer la proportion de salaire pour la période
    $joursPeriode = $dateFin->diffInDays($dateDebut) + 1;
    $joursMois = $dateDebut->daysInMonth;
    $salairesProportionnels = ($totalSalairesMensuel / $joursMois) * $joursPeriode;

    $salairesDetail = $employes->map(function($emp) use ($joursPeriode, $joursMois) {
        return [
            'id' => $emp->id,
            'nom_complet' => $emp->nom_complet,
            'role' => $emp->role,
            'salaire_mensuel' => (float) $emp->salaire_mensuel,
            'salaire_periode' => round(($emp->salaire_mensuel / $joursMois) * $joursPeriode, 0)
        ];
    });

    $totalDepensesGlobal = $totalDepenses + $coutsConfections + $salairesProportionnels;

    // ========================================
    // 3. BÉNÉFICES
    // ========================================
    
    $beneficeBrut = $caTotal - $coutsConfections;
    $beneficeNet = $caTotal - $totalDepensesGlobal;
    
    $margeBrutePct = $caTotal > 0 ? round(($beneficeBrut / $caTotal) * 100, 2) : 0;
    $margeNettePct = $caTotal > 0 ? round(($beneficeNet / $caTotal) * 100, 2) : 0;

    // ========================================
    // 4. STATISTIQUES GÉNÉRALES
    // ========================================
    
    $nbVentes = $ventesStats->nb_ventes ?? 0;
    
    $nbClientsUniques = Vente::whereBetween('date_vente', [$dateDebut, $dateFin])
        ->whereNotNull('client_id')
        ->distinct('client_id')
        ->count('client_id');

    $panierMoyen = $nbVentes > 0 ? round($caVentesDirectes / $nbVentes, 0) : 0;

    $rdvStats = RendezVous::whereBetween('date_heure', [$dateDebut, $dateFin])
        ->selectRaw("
            COUNT(*) as total_rdv,
            SUM(CASE WHEN statut = 'termine' THEN 1 ELSE 0 END) as rdv_honores,
            SUM(CASE WHEN statut = 'annule' THEN 1 ELSE 0 END) as rdv_annules
        ")
        ->first();

    $totalRdv = $rdvStats->total_rdv ?? 0;
    $rdvHonores = $rdvStats->rdv_honores ?? 0;
    $rdvAnnules = $rdvStats->rdv_annules ?? 0;
    $tauxAnnulation = $totalRdv > 0 ? round(($rdvAnnules / $totalRdv) * 100, 2) : 0;

    // ========================================
    // 5. CONSTRUCTION RÉPONSE
    // ========================================
    
    return response()->json([
        'success' => true,
        'data' => [
            'periode' => [
                'type' => $validated['type'],
                'date_debut' => $dateDebut->format('Y-m-d'),
                'date_fin' => $dateFin->format('Y-m-d'),
                'libelle' => $this->getLibellePeriode($validated['type'], $dateDebut, $dateFin),
                'jours' => $joursPeriode,
            ],
            'chiffre_affaires' => [
                'total' => (float) $caTotal,
                'ventes_directes' => (float) $caVentesDirectes,
                'confections_vendues' => (float) $caConfectionsVendues,
                'prestations' => (float) $caPrestations,
                'produits' => (float) $caProduits,
                'acomptes_rdv' => (float) $caAcomptesRdv,
            ],
            'depenses' => [
                'total' => (float) $totalDepensesGlobal,
                'par_categorie' => $depensesParCategorie,
                'confections' => (float) $coutsConfections,
                'salaires' => (float) $salairesProportionnels,
                'salaires_mensuel_total' => (float) $totalSalairesMensuel,
            ],
            'salaires_detail' => [
                'employes' => $salairesDetail,
                'nombre_employes' => $employes->count(),
                'total_periode' => (float) $salairesProportionnels,
            ],
            'benefice' => [
                'brut' => (float) $beneficeBrut,
                'net' => (float) $beneficeNet,
                'marge_brute_pct' => (float) $margeBrutePct,
                'marge_nette_pct' => (float) $margeNettePct,
            ],
            'statistiques' => [
                'nb_ventes' => (int) $nbVentes,
                'nb_clients' => (int) $nbClientsUniques,
                'panier_moyen' => (float) $panierMoyen,
                'nb_rdv_honores' => (int) $rdvHonores,
                'taux_annulation_rdv' => (float) $tauxAnnulation,
            ],
        ],
        'message' => 'Rapport global généré avec succès',
    ]);
}

    /**
     * Détail des ventes par période
     * GET /api/rapports/ventes-detail
     */
    public function ventesDetail(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:jour,semaine,mois,annee,personnalisee',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
        ]);

        $dateDebut = Carbon::parse($validated['date_debut'])->startOfDay();
        $dateFin = Carbon::parse($validated['date_fin'])->endOfDay();

        // Ventes par jour
        $parJour = Vente::whereBetween('date_vente', [$dateDebut, $dateFin])
            ->whereIn('statut_paiement', ['paye', 'partiel'])
            ->selectRaw('
                DATE(date_vente) as date,
                SUM(montant_paye) as montant,
                COUNT(*) as nb_ventes
            ')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'montant' => (float) $item->montant,
                    'nb_ventes' => (int) $item->nb_ventes,
                ];
            });

        // Ventes par mode de paiement
        $parModePaiement = Vente::whereBetween('date_vente', [$dateDebut, $dateFin])
            ->whereIn('statut_paiement', ['paye', 'partiel'])
            ->selectRaw('
                mode_paiement as mode,
                SUM(montant_paye) as montant,
                COUNT(*) as nb_transactions
            ')
            ->groupBy('mode_paiement')
            ->get()
            ->map(function ($item) {
                return [
                    'mode' => $item->mode,
                    'montant' => (float) $item->montant,
                    'nb_transactions' => (int) $item->nb_transactions,
                ];
            });

        // Ventes par type
        $parType = Vente::whereBetween('date_vente', [$dateDebut, $dateFin])
            ->whereIn('statut_paiement', ['paye', 'partiel'])
            ->selectRaw('
                type_vente as type,
                SUM(montant_paye) as montant,
                COUNT(*) as nb_ventes
            ')
            ->groupBy('type_vente')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->type,
                    'montant' => (float) $item->montant,
                    'nb_ventes' => (int) $item->nb_ventes,
                ];
            });

        // Top prestations
        $topPrestations = collect(DB::select("
            SELECT 
                tp.id,
                tp.nom,
                COUNT(vd.id)::integer as nb_ventes,
                SUM(vd.prix_total)::numeric as montant_total
            FROM ventes_details vd
            INNER JOIN ventes v ON vd.vente_id = v.id
            INNER JOIN types_prestations tp ON vd.prestation_id = tp.id
            WHERE v.date_vente BETWEEN ? AND ?
            AND v.statut_paiement IN ('paye', 'partiel')
            AND vd.type_article = 'prestation'
            AND vd.prestation_id IS NOT NULL
            GROUP BY tp.id, tp.nom
            ORDER BY montant_total DESC
            LIMIT 10
        ", [$dateDebut, $dateFin]))
        ->map(function ($item) {
            return [
                'id' => (int) $item->id,
                'nom' => $item->nom,
                'nb_ventes' => (int) $item->nb_ventes,
                'montant_total' => (float) $item->montant_total,
            ];
        });


        // Top produits
        $topProduits = collect(DB::select("
            SELECT 
                p.id,
                p.nom,
                SUM(vd.quantite)::integer as quantite_vendue,
                SUM(vd.prix_total)::numeric as montant_total
            FROM ventes_details vd
            INNER JOIN ventes v ON vd.vente_id = v.id
            INNER JOIN produits p ON vd.produit_id = p.id
            WHERE v.date_vente BETWEEN ? AND ?
            AND v.statut_paiement IN ('paye', 'partiel')
            AND vd.type_article = 'produit'
            AND vd.produit_id IS NOT NULL
            GROUP BY p.id, p.nom
            ORDER BY montant_total DESC
            LIMIT 10
        ", [$dateDebut, $dateFin]))
        ->map(function ($item) {
            return [
                'id' => (int) $item->id,
                'nom' => $item->nom,
                'quantite_vendue' => (int) $item->quantite_vendue,
                'montant_total' => (float) $item->montant_total,
            ];
        });


        // Liste détaillée de toutes les transactions
        $transactions = Vente::with(['client', 'vendeur', 'details.prestation', 'details.produit'])
            ->whereBetween('date_vente', [$dateDebut, $dateFin])
            ->whereIn('statut_paiement', ['paye', 'partiel'])
            ->orderBy('date_vente', 'desc')
            ->get()
            ->map(function ($vente) {
                return [
                    'id' => 'vente-' . $vente->id,  // ← CHANGEMENT ICI
                    'type' => $vente->type_vente,
                    'montant' => (float) $vente->montant_paye,
                    'mode_paiement' => $vente->mode_paiement,
                    'date' => $vente->date_vente,
                    'vendeur' => $vente->vendeur ? [
                        'id' => $vente->vendeur->id,
                        'prenom' => $vente->vendeur->prenom,
                        'nom' => $vente->vendeur->nom,
                    ] : null,
                    'client' => $vente->client ? [
                        'id' => $vente->client->id,
                        'prenom' => $vente->client->prenom,
                        'nom' => $vente->client->nom,
                        'telephone' => $vente->client->telephone,
                    ] : null,
                    'prestations' => $vente->details
                        ->where('type_article', 'prestation')
                        ->map(function ($detail) {
                            return [
                                'nom' => $detail->prestation?->nom ?? 'N/A',
                                'quantite' => (int) $detail->quantite,
                                'prix_total' => (float) $detail->prix_total,
                            ];
                        })
                        ->values(),
                    'produits' => $vente->details
                        ->where('type_article', 'produit')
                        ->map(function ($detail) {
                            return [
                                'nom' => $detail->produit?->nom ?? 'N/A',
                                'quantite' => (int) $detail->quantite,
                                'prix_total' => (float) $detail->prix_total,
                            ];
                        })
                        ->values(),
                ];
            });

        // Acomptes de rendez-vous
        $acomptesRdv = RendezVous::with(['client', 'prestations'])
            ->whereBetween('date_heure', [$dateDebut, $dateFin])
            ->where('acompte_paye', true)
            ->orderBy('date_heure', 'desc')
            ->get()
            ->map(function ($rdv) {
                return [
                    'id' => 'rdv-' . $rdv->id,  // ← CHANGEMENT ICI
                    'type' => 'acompte',
                    'montant' => (float) $rdv->acompte_montant,
                    'mode_paiement' => $rdv->mode_paiement ?? 'N/A',
                    'date' => $rdv->date_heure,
                    'vendeur' => null,
                    'client' => $rdv->client ? [
                        'id' => $rdv->client->id,
                        'prenom' => $rdv->client->prenom,
                        'nom' => $rdv->client->nom,
                        'telephone' => $rdv->client->telephone,
                    ] : null,
                    'prestations' => $rdv->prestations->map(function ($prestation) {
                        return [
                            'nom' => $prestation->nom,
                            'quantite' => 1,
                            'prix_total' => (float) $prestation->prix_base,
                        ];
                    })->values(),
                    'produits' => [],
                ];
            });

        // Fusionner toutes les transactions
        $toutesTransactions = $transactions->concat($acomptesRdv)->sortByDesc('date')->values();    

        // Log::info('🔍 TOP PRODUITS FINAL ENVOYÉ AU FRONTEND:', ['data' => $topProduits]);
        // Log::info('🔍 TOP PRESTATIONS FINAL ENVOYÉ AU FRONTEND:', ['data' => $topPrestations]);

        return response()->json([
            'success' => true,
            'data' => [
                'par_jour' => $parJour,
                'par_mode_paiement' => $parModePaiement,
                'par_type' => $parType,
                'top_prestations' => $topPrestations,
                'top_produits' => $topProduits,
                'transactions' => $toutesTransactions,
            ],
            'message' => 'Détail des ventes généré avec succès',
        ]);
    }

    /**
     * Trésorerie : Encaissements et décaissements
     * GET /api/rapports/tresorerie
     */
    public function tresorerie(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:jour,semaine,mois,annee,personnalisee',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
        ]);

        $dateDebut = Carbon::parse($validated['date_debut'])->startOfDay();
        $dateFin = Carbon::parse($validated['date_fin'])->endOfDay();

        // ========================================
        // ENCAISSEMENTS (argent rentré)
        // ========================================
        
        // Uniquement les montants RÉELLEMENT PAYÉS
        $encaissements = Vente::whereBetween('date_vente', [$dateDebut, $dateFin])
            ->whereIn('statut_paiement', ['paye', 'partiel'])
            ->selectRaw('
                mode_paiement,
                SUM(montant_paye) as montant
            ')
            ->groupBy('mode_paiement')
            ->get()
            ->keyBy('mode_paiement');

        $especes = $encaissements->get('especes')->montant ?? 0;
        $orangeMoney = $encaissements->get('orange_money')->montant ?? 0;
        $moovMoney = $encaissements->get('moov_money')->montant ?? 0;
        $carte = $encaissements->get('carte')->montant ?? 0;
        
        // Mode mixte : on récupère depuis la table paiements si elle existe
        // Sinon on compte le montant_paye du mode 'mixte'
        $mixte = $encaissements->get('mixte')->montant ?? 0;
        
        $totalEncaissements = $especes + $orangeMoney + $moovMoney + $carte + $mixte;

        // Acomptes RDV
        $acomptesRdv = RendezVous::whereBetween('date_heure', [$dateDebut, $dateFin])
            ->where('acompte_paye', true)
            ->sum('acompte_montant');

        $totalEncaissements += $acomptesRdv;

        // ========================================
        // DÉCAISSEMENTS (argent sorti)
        // ========================================
        
        $depensesOperationnelles = Depense::whereBetween('date_depense', [$dateDebut, $dateFin])
            ->sum('montant');

        // Achats de stock (mouvements entree)
        $achatsStock = DB::table('mouvements_stock')
            ->whereBetween('mouvements_stock.created_at', [$dateDebut, $dateFin])
            ->where('type_mouvement', 'entree')
            ->join('produits', 'mouvements_stock.produit_id', '=', 'produits.id')
            ->sum(DB::raw('mouvements_stock.quantite * produits.prix_achat'));

        $coutsConfections = Confection::whereBetween('date_confection', [$dateDebut, $dateFin])
            ->where('statut', 'terminee')
            ->sum('cout_total');

        $employes = User::where('is_active', true)
            ->whereNotNull('salaire_mensuel')                                       
            ->get();

        $totalSalairesMensuel = $employes->sum('salaire_mensuel');
        $joursPeriode = $dateFin->diffInDays($dateDebut) + 1;
        $joursMois = $dateDebut->daysInMonth;
        $salairesProportionnels = ($totalSalairesMensuel / $joursMois) * $joursPeriode;    


        $totalDecaissements = $depensesOperationnelles + $achatsStock + $coutsConfections + $salairesProportionnels;
        // ========================================
        // SOLDE & CRÉANCES
        // ========================================
        
        $soldeNet = $totalEncaissements - $totalDecaissements;

        // Créances : ventes impayées ou partiellement payées
        $creances = Vente::whereBetween('date_vente', [$dateDebut, $dateFin])
            ->whereIn('statut_paiement', ['impaye', 'partiel'])
            ->selectRaw('
                COUNT(*) as nb_factures,
                SUM(solde_restant) as montant_total
            ')
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'encaissements' => [
                    'especes' => (float) $especes,
                    'orange_money' => (float) $orangeMoney,
                    'moov_money' => (float) $moovMoney,
                    'carte' => (float) $carte,
                    'acomptes_rdv' => (float) $acomptesRdv,
                    'total' => (float) $totalEncaissements,
                ],
                'decaissements' => [
                    'depenses_operationnelles' => (float) $depensesOperationnelles,
                    'achats_stock' => (float) $achatsStock,
                    'confections' => (float) $coutsConfections,
                    'salaires' => (float) $salairesProportionnels,
                    'total' => (float) $totalDecaissements,
                ],
                'solde_net' => (float) $soldeNet,
                'creances' => [
                    'ventes_impayes' => (float) ($creances->montant_total ?? 0),
                    'nb_factures' => (int) ($creances->nb_factures ?? 0),
                ],
            ],
            'message' => 'Rapport de trésorerie généré avec succès',
        ]);
    }

    /**
     * Comparaison avec période précédente
     * GET /api/rapports/comparaison-periodes
     */
    public function comparaisonPeriodes(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:jour,semaine,mois,annee,personnalisee',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
        ]);

        $dateDebut = Carbon::parse($validated['date_debut'])->startOfDay();
        $dateFin = Carbon::parse($validated['date_fin'])->endOfDay();

        // Calculer la période précédente (même durée)
        $duree = $dateDebut->diffInDays($dateFin) + 1;
        $dateDebutPrecedente = $dateDebut->copy()->subDays($duree);
        $dateFinPrecedente = $dateFin->copy()->subDays($duree);

        // Récupérer les rapports pour les deux périodes
        $requestActuelle = new Request([
            'type' => $validated['type'],
            'date_debut' => $dateDebut->format('Y-m-d'),
            'date_fin' => $dateFin->format('Y-m-d'),
        ]);

        $requestPrecedente = new Request([
            'type' => $validated['type'],
            'date_debut' => $dateDebutPrecedente->format('Y-m-d'),
            'date_fin' => $dateFinPrecedente->format('Y-m-d'),
        ]);

        $rapportActuel = json_decode($this->global($requestActuelle)->content(), true)['data'];
        $rapportPrecedent = json_decode($this->global($requestPrecedente)->content(), true)['data'];

        // Calculer les évolutions
        $caActuel = $rapportActuel['chiffre_affaires']['total'];
        $caPrecedent = $rapportPrecedent['chiffre_affaires']['total'];
        $caPct = $caPrecedent > 0 
            ? round((($caActuel - $caPrecedent) / $caPrecedent) * 100, 2) 
            : 0;

        $beneficeActuel = $rapportActuel['benefice']['net'];
        $beneficePrecedent = $rapportPrecedent['benefice']['net'];
        $beneficePct = $beneficePrecedent > 0 
            ? round((($beneficeActuel - $beneficePrecedent) / $beneficePrecedent) * 100, 2) 
            : 0;

        $depensesActuel = $rapportActuel['depenses']['total'];
        $depensesPrecedent = $rapportPrecedent['depenses']['total'];
        $depensesPct = $depensesPrecedent > 0 
            ? round((($depensesActuel - $depensesPrecedent) / $depensesPrecedent) * 100, 2) 
            : 0;

        $nbVentesActuel = $rapportActuel['statistiques']['nb_ventes'];
        $nbVentesPrecedent = $rapportPrecedent['statistiques']['nb_ventes'];
        $nbVentesPct = $nbVentesPrecedent > 0 
            ? round((($nbVentesActuel - $nbVentesPrecedent) / $nbVentesPrecedent) * 100, 2) 
            : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'periode_actuelle' => $rapportActuel,
                'periode_precedente' => $rapportPrecedent,
                'evolution' => [
                    'ca_pct' => (float) $caPct,
                    'benefice_pct' => (float) $beneficePct,
                    'depenses_pct' => (float) $depensesPct,
                    'nb_ventes_pct' => (float) $nbVentesPct,
                ],
            ],
            'message' => 'Comparaison de périodes générée avec succès',
        ]);
    }


    public function compteArrete(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
        ]);

        $date = Carbon::parse($validated['date'])->format('d/m/Y');
        $user = $request->user();
        
        // Récupérer l'email du gestionnaire
        $gestionnaire = User::where('role', 'gestionnaire')
            ->where('is_active', true)
            ->first();
        
        if (!$gestionnaire || !$gestionnaire->email) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun gestionnaire avec email trouvé',
            ], 404);
        }

        try {
            // Envoyer l'email
            Mail::to($gestionnaire->email)->send(new CompteArreteMail([
                'date' => $date,
                'emetteur' => $user->nom . ' ' . $user->prenom,
                'role' => $user->role,
            ]));

            // Log pour debug
            \Log::info('Compte arrêté envoyé', [
                'destinataire' => $gestionnaire->email,
                'emetteur' => $user->nom_complet,
                'date' => $date,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Compte arrêté envoyé avec succès',
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur envoi email compte arrêté', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi de l\'email',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Helper : Générer le libellé de la période
     */
    private function getLibellePeriode(string $type, Carbon $dateDebut, Carbon $dateFin): string
    {
        switch ($type) {
            case 'jour':
                return $dateDebut->locale('fr')->isoFormat('dddd D MMMM YYYY');
            
            case 'semaine':
                return 'Semaine ' . $dateDebut->weekOfYear . ' - ' . $dateDebut->year;
            
            case 'mois':
                return $dateDebut->locale('fr')->isoFormat('MMMM YYYY');
            
            case 'annee':
                return 'Année ' . $dateDebut->year;
            
            case 'personnalisee':
                return $dateDebut->format('d/m/Y') . ' - ' . $dateFin->format('d/m/Y');
            
            default:
                return '';
        }
    }
}