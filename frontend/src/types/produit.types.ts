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
  attribut_id: number;
  valeur: string;
  attribut: Attribut;
}

export type Devise = 
  | 'FCFA'      // Franc CFA (Burkina Faso)
  | 'EUR'       // Euro
  | 'USD'       // Dollar Américain
  | 'GBP'       // Livre Sterling
  | 'CNY'       // Yuan Chinois
  | 'AED'       // Dirham des Émirats (Dubaï)
  | 'MAD'       // Dirham Marocain
  | 'XOF';      // Franc CFA (alternatif)

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


export interface Produit {
  id: number;
  nom: string;
  reference?: string;
  description?: string;
  categorie_id: number;
  categorie?: Categorie;
  marque?: string;
  fournisseur?: string;
  prix_achat: number;
  prix_vente: number;
  prix_promo?: number;
  date_debut_promo?: string;
  date_fin_promo?: string;
  stock_vente: number;
  stock_utilisation: number;
  stock_reserve: number; // ✅ AJOUT
  seuil_alerte: number;
  seuil_critique: number;
  seuil_alerte_utilisation: number;
  seuil_critique_utilisation: number;
  seuil_alerte_reserve?: number; // ✅ AJOUT
  seuil_critique_reserve?: number; // ✅ AJOUT
  type_stock_principal: 'vente' | 'utilisation' | 'mixte' | 'reserve'; // ✅ AJOUT 'reserve'
  photo_url?: string;
  quantite_min_commande?: number;
  delai_livraison_jours?: number;
  is_active: boolean;
  valeurs_attributs?: ProduitAttributValeur[];
  created_at: string;
  updated_at: string;
  date_commande?: string;
  devise_achat?: Devise;
  frais_cmb?: number;
  frais_transit?: number;
  moyen_paiement?: MoyenPaiement;
  date_reception?: string;
  montant_total_achat?: number;
}

export interface MouvementStock {
  id: number;
  produit_id: number;
  produit?: Produit;
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
  produit_id: number;
  produit?: Produit;
  type_transfert: 
    | 'vente_vers_utilisation' 
    | 'utilisation_vers_vente'
    | 'reserve_vers_vente' // ✅ AJOUT
    | 'reserve_vers_utilisation' // ✅ AJOUT
    | 'vente_vers_reserve' // ✅ AJOUT
    | 'utilisation_vers_reserve'; // ✅ AJOUT
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

// Types pour les requêtes/filtres
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
  type_stock_principal?: 'vente' | 'utilisation' | 'mixte' | 'reserve'; // ✅ AJOUT 'reserve'
  actifs_only?: boolean;
  alerte_stock_vente?: boolean;
  alerte_stock_utilisation?: boolean;
  alerte_stock_reserve?: boolean; // ✅ AJOUT
  critique_stock_vente?: boolean;
  en_promotion?: boolean;
  sort_by?: 'nom' | 'reference' | 'prix_vente' | 'prix_achat' | 'stock_vente' | 'stock_utilisation' | 'stock_reserve' | 'created_at'; // ✅ AJOUT 'stock_reserve'
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface TransfertFilters {
  produit_id?: number;
  type_transfert?: 
    | 'vente_vers_utilisation' 
    | 'utilisation_vers_vente'
    | 'reserve_vers_vente' // ✅ AJOUT
    | 'reserve_vers_utilisation' // ✅ AJOUT
    | 'vente_vers_reserve' // ✅ AJOUT
    | 'utilisation_vers_reserve'; // ✅ AJOUT
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
  type_stock?: 'vente' | 'utilisation' | 'reserve'; // ✅ AJOUT 'reserve'
  type_mouvement?: 'entree' | 'sortie' | 'ajustement' | 'inventaire';
  date_debut?: string;
  date_fin?: string;
  per_page?: number;
  page?: number;
}

// Types pour les formulaires
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

export interface ProduitFormData {
  nom: string;
  reference?: string;
  description?: string;
  categorie_id: number;
  marque?: string;
  fournisseur?: string;
  prix_achat: number;
  prix_vente: number;
  prix_promo?: number;
  date_debut_promo?: string;
  date_fin_promo?: string;
  stock_vente?: number;
  stock_utilisation?: number;
  stock_reserve?: number; // ✅ AJOUT
  seuil_alerte?: number;
  seuil_critique?: number;
  seuil_alerte_utilisation?: number;
  seuil_critique_utilisation?: number;
  seuil_alerte_reserve?: number; // ✅ AJOUT
  seuil_critique_reserve?: number; // ✅ AJOUT
  type_stock_principal: 'vente' | 'utilisation' | 'mixte' | 'reserve'; // ✅ AJOUT 'reserve'
  photo_url?: string;
  quantite_min_commande?: number;
  delai_livraison_jours?: number;
  is_active?: boolean;
  attributs?: Record<number, string>;
}

export interface TransfertFormData {
  produit_id: number;
  type_transfert: 
    | 'vente_vers_utilisation' 
    | 'utilisation_vers_vente'
    | 'reserve_vers_vente' // ✅ AJOUT
    | 'reserve_vers_utilisation' // ✅ AJOUT
    | 'vente_vers_reserve' // ✅ AJOUT
    | 'utilisation_vers_reserve'; // ✅ AJOUT
  quantite: number;
  motif?: string;
  auto_valider?: boolean;
  seuil_alerte?: number; // ✅ AJOUT (pour transferts depuis réserve)
  seuil_critique?: number; // ✅ AJOUT (pour transferts depuis réserve)
}

// Types pour les réponses API
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
  alertes_reserve: number; // ✅ AJOUT
  critiques_vente: number;
  critiques_utilisation: number;
  critiques_reserve: number; // ✅ AJOUT
}

export interface TransfertStats {
  total_transferts: number;
  en_attente: number;
  valides: number;
  vente_vers_utilisation: number;
  utilisation_vers_vente: number;
  reserve_vers_vente: number; // ✅ AJOUT
  reserve_vers_utilisation: number; // ✅ AJOUT
  vente_vers_reserve: number; // ✅ AJOUT
  utilisation_vers_reserve: number; // ✅ AJOUT
  montant_total: number;
  quantite_totale: number;
}