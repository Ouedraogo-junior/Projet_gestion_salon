// src/types/public.types.ts
export interface SalonPublicInfo {
  id: number;
  nom: string;
  telephone: string;
  adresse: string;
  description?: string;
  horaires?: string;
  photo_url?: string;
}

export interface PrestationPublique {
  id: number;
  nom: string;
  description?: string;
  duree_estimee_minutes?: number;
  prix_base: number;
  ordre: number;
}

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