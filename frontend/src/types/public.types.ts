// src/types/public.types.ts

export interface SalonPublicInfo {
  id: number;
  nom: string;
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

// Interface pour les attributs d'un produit
export interface AttributPublic {
  id: number;
  nom: string;
  type_valeur: 'texte' | 'nombre' | 'liste';
  unite?: string;
}

// Interface pour les valeurs d'attributs
export interface ValeurAttributPublic {
  id: number;
  attribut_id: number;
  valeur: string;
  attribut: AttributPublic;
}

// Interface pour la catégorie
export interface CategoriePublique {
  id: number;
  nom: string;
  couleur?: string;
}

// Interface produit de base (liste)
export interface ProduitPublic {
  id: number;
  nom: string;
  description?: string;
  marque?: string;
  prix_vente: number;
  prix_promo?: number;
  date_debut_promo?: string;
  date_fin_promo?: string;
  photo_url?: string;
  stock_vente: number;
  prix_actuel: number;
  en_promo: boolean;
}

// Interface produit détaillé (avec attributs)
export interface ProduitDetailsPublic extends ProduitPublic {
  categorie?: CategoriePublique;
  valeurs_attributs?: ValeurAttributPublic[];
}

export interface PhotoPublique {
  id: number;
  photo_url: string;
  description?: string;
  date_prise: string;
}