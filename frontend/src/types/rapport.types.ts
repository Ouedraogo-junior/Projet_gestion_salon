// src/types/rapport.types.ts

export type PeriodeType = 'jour' | 'semaine' | 'mois' | 'annee' | 'personnalisee';

export interface PeriodeFilters {
  type: PeriodeType;
  date_debut: string; // ISO format YYYY-MM-DD
  date_fin: string;
  annee?: number;
  mois?: number; // 1-12
  semaine?: number; // 1-53
}

// ========================================
// RAPPORT GLOBAL
// ========================================

export interface PeriodeInfo {
  type: PeriodeType;
  date_debut: string;
  date_fin: string;
  libelle: string; // "Janvier 2026", "Semaine 5", "15/01/2026 - 21/01/2026"
}

export interface ChiffreAffaires {
  total: number;
  ventes_directes: number; // Montant payé des ventes
  confections_vendues: number; // CA des produits confectionnés vendus
  prestations: number;
  produits: number;
  acomptes_rdv: number; // Acomptes reçus sur RDV
}

export interface DepenseCategorie {
  categorie: string;
  montant: number;
  pourcentage: number;
}

export interface Depenses {
  total: number;
  par_categorie: DepenseCategorie[];
  confections: number; // Coûts de production confections
}

export interface Benefice {
  brut: number; // CA - Coûts confections
  net: number; // CA - Toutes dépenses
  marge_brute_pct: number;
  marge_nette_pct: number;
}

export interface Statistiques {
  nb_ventes: number;
  nb_clients: number; // Clients uniques
  panier_moyen: number;
  nb_rdv_honores: number;
  taux_annulation_rdv: number;
}

export interface RapportGlobal {
  periode: PeriodeInfo;
  chiffre_affaires: ChiffreAffaires;
  depenses: Depenses;
  benefice: Benefice;
  statistiques: Statistiques;
}

// ========================================
// DÉTAIL DES VENTES
// ========================================

export interface VenteParJour {
  date: string; // YYYY-MM-DD
  montant: number;
  nb_ventes: number;
}

export interface VenteParModePaiement {
  mode: string;
  montant: number;
  nb_transactions: number;
}

export interface VenteParType {
  type: 'prestations' | 'produits' | 'mixte';
  montant: number;
  nb_ventes: number;
}

export interface TopPrestation {
  id: number;
  nom: string;
  nb_ventes: number;
  montant_total: number;
}

export interface TopProduit {
  id: number;
  nom: string;
  quantite_vendue: number;
  montant_total: number;
}

export interface VentesDetail {
  par_jour: VenteParJour[];
  par_mode_paiement: VenteParModePaiement[];
  par_type: VenteParType[];
  top_prestations: TopPrestation[];
  top_produits: TopProduit[];
}

// ========================================
// TRÉSORERIE
// ========================================

export interface Encaissements {
  especes: number;
  orange_money: number;
  moov_money: number;
  carte: number;
  acomptes_rdv: number;
  total: number;
}

export interface Decaissements {
  depenses_operationnelles: number;
  achats_stock: number;
  confections: number;
  total: number;
}

export interface Creances {
  ventes_impayes: number; // Montant total des impayés
  nb_factures: number; // Nombre de factures impayées
}

export interface Tresorerie {
  encaissements: Encaissements;
  decaissements: Decaissements;
  solde_net: number;
  creances: Creances;
}

// ========================================
// COMPARAISON PÉRIODES
// ========================================

export interface Evolution {
  ca_pct: number; // % d'évolution du CA
  benefice_pct: number;
  depenses_pct: number;
  nb_ventes_pct: number;
}

export interface ComparaisonPeriodes {
  periode_actuelle: RapportGlobal;
  periode_precedente: RapportGlobal;
  evolution: Evolution;
}

// ========================================
// RÉPONSES API
// ========================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ========================================
// HELPERS / UTILS
// ========================================

export interface PeriodePreset {
  label: string;
  value: PeriodeType;
  getRange: () => { date_debut: string; date_fin: string };
}

export const PERIODES_PRESETS: PeriodePreset[] = [
  {
    label: "Aujourd'hui",
    value: 'jour',
    getRange: () => {
      const today = new Date();
      return {
        date_debut: today.toISOString().split('T')[0],
        date_fin: today.toISOString().split('T')[0],
      };
    },
  },
  {
    label: 'Cette semaine',
    value: 'semaine',
    getRange: () => {
      const today = new Date();
      const first = today.getDate() - today.getDay() + 1; // Lundi
      const last = first + 6; // Dimanche
      
      const monday = new Date(today.setDate(first));
      const sunday = new Date(today.setDate(last));
      
      return {
        date_debut: monday.toISOString().split('T')[0],
        date_fin: sunday.toISOString().split('T')[0],
      };
    },
  },
  {
    label: 'Ce mois',
    value: 'mois',
    getRange: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      return {
        date_debut: firstDay.toISOString().split('T')[0],
        date_fin: lastDay.toISOString().split('T')[0],
      };
    },
  },
  {
    label: 'Cette année',
    value: 'annee',
    getRange: () => {
      const today = new Date();
      return {
        date_debut: `${today.getFullYear()}-01-01`,
        date_fin: `${today.getFullYear()}-12-31`,
      };
    },
  },
];

// ========================================
// TYPES POUR GRAPHIQUES (optionnel)
// ========================================

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }>;
}

export interface PieChartData {
  labels: string[];
  data: number[];
  colors?: string[];
}