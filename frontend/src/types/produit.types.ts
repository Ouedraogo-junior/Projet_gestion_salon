// src/types/produits.types.ts

export interface Categorie {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  icone?: string;
  couleur?: string;
  is_active: boolean;
  ordre: number;
  produits_count?: number;
  attributs_count?: number;
  attributs?: Attribut[];
  created_at: string;
  updated_at: string;
}

export interface Attribut {
  id: number;
  nom: string;
  slug: string;
  type_valeur: 'texte' | 'nombre' | 'liste';
  valeurs_possibles?: string[];
  unite?: string;
  obligatoire: boolean;
  ordre: number;
  categories_count?: number;
  pivot?: {
    obligatoire: boolean;
    ordre: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ProduitAttributValeur {
  id: number;
  variante_id: number;
  attribut_id: number;
  valeur: string;
  valeur_formatee?: string;
  attribut: Attribut;
}

export type Devise =
  | 'FCFA'
  | 'EUR'
  | 'USD'
  | 'GBP'
  | 'CNY'
  | 'AED'
  | 'MAD'
  | 'XOF';

export type MoyenPaiement =
  | 'especes'
  | 'virement'
  | 'cheque'
  | 'mobile_money'
  | 'carte_bancaire'
  | 'western_union'
  | 'transferwise'
  | 'crypto'
  | 'credit';

// ============================================================
// VARIANTE
// ============================================================

export interface ProduitVariante {
  id: number;
  produit_id: number;
  reference?: string;
  type_stock_principal: 'vente' | 'utilisation' | 'mixte' | 'reserve';

  // Prix
  prix_achat: number;
  prix_vente: number;
  prix_promo?: number;
  date_debut_promo?: string;
  date_fin_promo?: string;
  prix_actuel?: number;
  en_promotion?: boolean;

  // Marges
  marge_montant?: number;
  marge_pourcentage?: number;
  gain_total_commande?: number;
  gain_total_stock_actuel?: number;

  // Stocks
  stock_vente: number;
  stock_utilisation: number;
  stock_reserve: number;
  stock_total?: number;
  seuil_alerte?: number;
  seuil_critique?: number;
  seuil_alerte_utilisation?: number;
  seuil_critique_utilisation?: number;
  seuil_alerte_reserve?: number;
  seuil_critique_reserve?: number;
  alerte_stock_vente?: 'ok' | 'alerte' | 'critique';
  alerte_stock_utilisation?: 'ok' | 'alerte' | 'critique';
  alerte_stock_reserve?: 'ok' | 'alerte' | 'critique';

  // Achat / Import
  devise_achat?: Devise;
  taux_change?: number;
  prix_achat_devise_origine?: number;
  prix_achat_stock_total?: number;
  quantite_stock_commande?: number;
  frais_cmb?: number;
  frais_transit?: number;
  frais_bancaires?: number;
  frais_courtier?: number;
  frais_transport_local?: number;
  montant_total_achat?: number;
  moyen_paiement?: MoyenPaiement;
  date_commande?: string;
  date_reception?: string;
  cbm?: number;
  poids_kg?: number;
  quantite_min_commande?: number;
  delai_livraison_jours?: number;

  // Valorisation
  valeur_stock_vente?: number;
  valeur_stock_utilisation?: number;
  valeur_stock_reserve?: number;
  valeur_stock_total?: number;

  // Validation
  statut_validation: 'en_attente' | 'valide' | 'rejete';
  motif_rejet?: string | null;
  valide_le?: string | null;
  cree_par?: number | null;
  valide_par?: number | null;
  createur?: { id: number; name: string };
  validateur?: { id: number; name: string };

  // Attributs
  attributs?: ProduitAttributValeur[];

  // Relations (si chargées)
  mouvements_recents?: MouvementStock[];
  transferts?: TransfertStock[];

  produit?: {
    id: number;
    nom: string;
    marque?: string;
    photo_url?: string;
    categorie_id?: number;
  };

  is_active: boolean;
  sync_status?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// PRODUIT PARENT
// ============================================================

export interface Produit {
  id: number;
  nom: string;
  description?: string;
  categorie_id: number;
  categorie?: Categorie;
  marque?: string;
  fournisseur?: string;
  photo_url?: string;
  visible_public: boolean;
  is_active: boolean;
  salon_id?: number;

  // Agrégats calculés côté backend/frontend
  prix_min?: number;
  prix_max?: number;
  stock_total?: number;
  has_variantes?: boolean;

  // Variantes
  variantes?: ProduitVariante[];

  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// ============================================================
// MOUVEMENTS & TRANSFERTS
// ============================================================

export interface MouvementStock {
  id: number;
  variante_id: number;
  variante?: ProduitVariante;
  type_stock: 'vente' | 'utilisation' | 'reserve';
  type_mouvement: 'entree' | 'sortie' | 'ajustement' | 'inventaire';
  quantite: number;
  stock_avant: number;
  stock_apres: number;
  motif?: string;
  vente_id?: number;
  transfert_id?: number;
  confection_id?: number;
  user_id?: number;
  user?: {
    id: number;
    nom_complet: string;
  };
  created_at: string;
  updated_at: string;
}

export interface TransfertStock {
  id: number;
  numero_transfert: string;
  variante_id: number;
  variante?: ProduitVariante;
  type_transfert:
    | 'vente_vers_utilisation'
    | 'utilisation_vers_vente'
    | 'reserve_vers_vente'
    | 'reserve_vers_utilisation'
    | 'vente_vers_reserve'
    | 'utilisation_vers_reserve';
  quantite: number;
  prix_unitaire: number;
  montant_total: number;
  motif?: string;
  user_id: number;
  user?: {
    id: number;
    nom_complet: string;
  };
  valide: boolean;
  valideur_id?: number;
  valideur?: {
    id: number;
    nom_complet: string;
  };
  date_validation?: string;
  mouvements?: MouvementStock[];
  created_at: string;
  updated_at: string;
}

// ============================================================
// FILTRES
// ============================================================

export interface CategorieFilters {
  search?: string;
  actives_only?: boolean;
  with_produits?: boolean;
  with_attributs?: boolean;
}

export interface AttributFilters {
  search?: string;
  type_valeur?: 'texte' | 'nombre' | 'liste';
  obligatoires_only?: boolean;
  with_categories?: boolean;
}

export interface ProduitFilters {
  search?: string;
  categorie_id?: number;
  type_stock_principal?: 'vente' | 'utilisation' | 'mixte' | 'reserve';
  actifs_only?: boolean;
  alerte_stock_vente?: boolean;
  alerte_stock_utilisation?: boolean;
  alerte_stock_reserve?: boolean;
  critique_stock_vente?: boolean;
  en_promotion?: boolean;
  sort_by?: 'nom' | 'created_at';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
  statut_validation?: 'en_attente' | 'valide' | 'rejete';
  variante_id?: number;
}

export interface TransfertFilters {
  variante_id?: number;
  type_transfert?:
    | 'vente_vers_utilisation'
    | 'utilisation_vers_vente'
    | 'reserve_vers_vente'
    | 'reserve_vers_utilisation'
    | 'vente_vers_reserve'
    | 'utilisation_vers_reserve';
  en_attente?: boolean;
  valides?: boolean;
  user_id?: number;
  date_debut?: string;
  date_fin?: string;
  per_page?: number;
  page?: number;
  include_stats?: boolean;
}

export interface MouvementFilters {
  variante_id?: number;
  type_stock?: 'vente' | 'utilisation' | 'reserve';
  type_mouvement?: 'entree' | 'sortie' | 'ajustement' | 'inventaire';
  date_debut?: string;
  date_fin?: string;
  per_page?: number;
  page?: number;
}

// ============================================================
// FORMULAIRES
// ============================================================

export interface VarianteFormData {
  id?: number;
  reference?: string;
  type_stock_principal: 'vente' | 'utilisation' | 'mixte' | 'reserve';
  devise_achat?: Devise;
  taux_change?: number;
  prix_achat_stock_total?: number;
  quantite_stock_commande?: number;
  prix_achat_devise_origine?: number;
  montant_total_achat?: number;
  frais_cmb?: number;
  frais_transit?: number;
  frais_bancaires?: number;
  frais_courtier?: number;
  frais_transport_local?: number;
  cbm?: number;
  poids_kg?: number;
  moyen_paiement?: MoyenPaiement;
  date_commande?: string;
  date_reception?: string;
  prix_achat: number;
  prix_vente: number;
  prix_promo?: number;
  date_debut_promo?: string;
  date_fin_promo?: string;
  stock_vente?: number;
  stock_utilisation?: number;
  stock_reserve?: number;
  seuil_alerte?: number;
  seuil_critique?: number;
  seuil_alerte_utilisation?: number;
  seuil_critique_utilisation?: number;
  seuil_alerte_reserve?: number;
  seuil_critique_reserve?: number;
  quantite_min_commande?: number;
  delai_livraison_jours?: number;
  is_active?: boolean;
  attributs?: Record<number, string>;
}

export interface ProduitFormData {
  nom: string;
  description?: string;
  categorie_id: number;
  marque?: string;
  fournisseur?: string;
  visible_public?: boolean;
  salon_id?: number;
  variantes: VarianteFormData[];
}

export interface TransfertFormData {
  variante_id: number;
  type_transfert:
    | 'vente_vers_utilisation'
    | 'utilisation_vers_vente'
    | 'reserve_vers_vente'
    | 'reserve_vers_utilisation'
    | 'vente_vers_reserve'
    | 'utilisation_vers_reserve';
  quantite: number;
  motif?: string;
  auto_valider?: boolean;
}

export interface CategorieFormData {
  nom: string;
  description?: string;
  icone?: string;
  couleur?: string;
  is_active?: boolean;
  ordre?: number;
}

export interface AttributFormData {
  nom: string;
  type_valeur: 'texte' | 'nombre' | 'liste';
  valeurs_possibles?: string[];
  unite?: string;
  obligatoire?: boolean;
  ordre?: number;
}

// ============================================================
// RÉPONSES API
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  message: string;
}

export interface AlertesStats {
  total_alertes: number;
  alertes_vente: number;
  alertes_utilisation: number;
  alertes_reserve: number;
  critiques_vente: number;
  critiques_utilisation: number;
  critiques_reserve: number;
}

export interface TransfertStats {
  total_transferts: number;
  en_attente: number;
  valides: number;
  vente_vers_utilisation: number;
  utilisation_vers_vente: number;
  reserve_vers_vente: number;
  reserve_vers_utilisation: number;
  vente_vers_reserve: number;
  utilisation_vers_reserve: number;
  montant_total: number;
  quantite_totale: number;
}