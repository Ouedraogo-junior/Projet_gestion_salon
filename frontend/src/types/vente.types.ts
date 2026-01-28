// src/types/vente.types.ts

export type TypeArticle = 'prestation' | 'produit';
export type ModePaiement = 'especes' | 'orange_money' | 'moov_money' | 'carte' | 'mixte';
export type StatutPaiement = 'paye' | 'partiel' | 'impaye';
export type TypeVente = 'prestations' | 'produits' | 'mixte';
export type TypeReduction = 'fidelite' | 'promo' | 'manuelle' | 'aucune';
export type SourceStock = 'vente' | 'utilisation';

export interface Client {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  points_fidelite: number;
}

export interface NouveauClient {
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
}

export interface ClientAnonyme {
  nom: string;
  telephone?: string;
}

export interface Produit {
  id: number;
  nom: string;
  reference?: string;
  description?: string;
  prix_vente: number;
  prix_promo?: number;
  stock_vente: number;
  stock_utilisation: number;
  categorie: {
    id: number;
    nom: string;
  };
  photo_url?: string;
  is_active: boolean;
}

export interface TypePrestation {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  duree_minutes: number;
  categorie?: string;
}

export interface ArticlePanier {
  id: number;
  type: TypeArticle;
  nom: string;
  prix_unitaire: number;
  quantite: number;
  reduction: number;
  source_stock?: SourceStock;
  reference?: string; // Pour les produits
}

export interface Paiement {
  mode: ModePaiement;
  montant: number;
  reference?: string; // Pour mobile money
}

export interface Reduction {
  type: 'pourcentage' | 'montant';
  valeur: number;
  motif?: string;
}

export interface VenteDetail {
  id: number;
  vente_id: number;
  type_article: TypeArticle;
  article_nom: string;
  prestation_id?: number;
  produit_id?: number;
  produit_reference?: string;
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
  reduction: number;
  prestation?: TypePrestation;
  produit?: Produit;
}

export interface Vente {
  id: number;
  numero_facture: string;
  client_id?: number;
  client_nom?: string;
  client_telephone?: string;
  coiffeur_id?: number;
  vendeur_id: number;
  rendez_vous_id?: number;
  type_vente: TypeVente;
  date_vente: string;
  montant_prestations: number;
  montant_produits: number;
  montant_total_ht: number;
  montant_reduction: number;
  type_reduction?: TypeReduction;
  montant_total_ttc: number;
  mode_paiement: ModePaiement;
  montant_paye: number;
  montant_rendu: number;
  statut_paiement: StatutPaiement;
  solde_restant: number;
  recu_imprime: boolean;
  points_gagnes: number;
  points_utilises: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  client?: Client;
  vendeur?: { id: number; name: string };
  coiffeur?: { id: number; name: string };
  details?: VenteDetail[];
  paiements?: Paiement[];
}

export interface CreateVenteDTO {
  // Client (un seul type)
  client_id?: number;
  nouveau_client?: NouveauClient;
  client_anonyme?: ClientAnonyme;
  
  // Personnel
  coiffeur_id?: number;
  rendez_vous_id?: number;
  
  // Articles
  articles: Array<{
    id: number;
    type: TypeArticle;
    quantite: number;
    prix_unitaire: number;
    reduction?: number;
    source_stock?: SourceStock;
  }>;
  
  // Réduction globale
  reduction?: Reduction;
  
  // Paiements
  paiements: Paiement[];
  
  // Points de fidélité
  points_utilises?: number;
  
  // Notes
  notes?: string;
}

export interface VenteFilters {
  search?: string;
  client_id?: number;
  vendeur_id?: number;
  coiffeur_id?: number;
  type_vente?: TypeVente;
  mode_paiement?: ModePaiement;
  statut_paiement?: StatutPaiement;
  date_debut?: string;
  date_fin?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface VenteStats {
  ca_total: number;
  ca_prestations: number;
  ca_produits: number;
  nombre_ventes: number;
  panier_moyen: number;
  par_mode_paiement: Array<{
    mode_paiement: ModePaiement;
    total: number;
    nombre: number;
  }>;
  par_type_vente: Array<{
    type_vente: TypeVente;
    total: number;
    nombre: number;
  }>;
  impayes_count: number;
  impayes_montant: number;
}

export interface StockCheckResult {
  disponible: boolean;
  message?: string;
  stock_disponible: number;
}

export interface PointsCalculation {
  possible: boolean;
  reduction_max: number;
  points_max_utilisables: number;
  taux_conversion?: string;
  message?: string;
}