// src/types/public.types.ts

export interface SalonPublicInfo {
  id: number;
  nom: string;
  slug: string;
  telephone: string;
  adresse: string;
  description?: string;
  horaires?: string;
  photo_url?: string;
  logo_url?: string;
}

export interface PrestationPublique {
  id: number;
  nom: string;
  description?: string;
  duree_estimee_minutes?: number;
  prix_base: number;
  ordre: number;
}

export interface PhotoPublique {
  id: number;
  photo_url: string;
  description?: string;
  date_prise: string;
}

// ── Attributs ─────────────────────────────────────────────────────────────────

export interface AttributPublic {
  id: number;
  nom: string;
  type_valeur: 'texte' | 'nombre' | 'liste';
  unite?: string;
}

export interface ValeurAttributPublic {
  id: number;
  attribut_id: number;
  valeur: string;
  attribut: AttributPublic;
}

// ── Variantes & Produits ──────────────────────────────────────────────────────

export interface VariantePublique {
  id: number;
  reference?: string;
  prix_vente: number;
  prix_promo?: number;
  date_debut_promo?: string;
  date_fin_promo?: string;
  stock_vente: number;
  type_stock_principal: string;
  prix_actuel: number;
  en_promo: boolean;
  valeurs_attributs: ValeurAttributPublic[];
}

/** Utilisé dans la liste produits — données de la variante représentante aplaties */
export interface ProduitPublic {
  id: number;
  nom: string;
  description?: string;
  marque?: string;
  photo_url?: string;
  prix_vente: number;
  prix_promo?: number;
  date_debut_promo?: string;
  date_fin_promo?: string;
  stock_vente: number;
  prix_actuel: number;
  en_promo: boolean;
  variantes_count: number;
}

export interface CategoriePublique {
  id: number;
  nom: string;
  couleur?: string;
}

/** Utilisé dans le modal détails */
export interface ProduitPublicDetail {
  id: number;
  nom: string;
  description?: string;
  marque?: string;
  photo_url?: string;
  categorie?: CategoriePublique;
  variantes: VariantePublique[];
}

// ── Panier ────────────────────────────────────────────────────────────────────

export interface CartItem {
  /** clé unique : "produitId-varianteId" */
  key: string;
  produit_id: number;
  produit_nom: string;
  produit_photo?: string;
  variante_id: number;
  variante_label: string;
  prix_unitaire: number;
  quantite: number;
  stock_max: number;
}