// src/types/confection.ts

import type { Categorie, Attribut, Produit, MouvementStock } from './produit.types';

export type StatutConfection = 'en_cours' | 'terminee' | 'annulee';
export type DestinationConfection = 'vente' | 'utilisation' | 'mixte';

// Interface User compatible avec le projet
export interface User {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string | null;
  role: 'gerant' | 'coiffeur' | 'receptionniste';
  specialite: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Confection {
  id: number;
  numero_confection: string;
  produit_id: number | null;
  user_id: number;
  categorie_id: number;
  nom_produit: string;
  quantite_produite: number;
  destination: DestinationConfection;
  description: string | null;
  date_confection: string;
  cout_matiere_premiere: number;
  cout_main_oeuvre: number;
  cout_total: number;
  prix_vente_unitaire: number | null;
  statut: StatutConfection;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: User;
  categorie?: Categorie;
  produit?: Produit;
  details?: ConfectionDetail[];
  attributs?: ConfectionAttribut[];
  mouvements?: MouvementStock[];
  
  // Attributs calculés
  statut_libelle?: string;
  destination_libelle?: string;
  marge_unitaire?: number;
  taux_marge?: number;
}

export interface ConfectionDetail {
  id: number;
  confection_id: number;
  produit_id: number;
  quantite_utilisee: number;
  prix_unitaire: number;
  prix_total: number;
  created_at: string;
  updated_at: string;
  
  // Relation
  produit?: Produit;
}

export interface ConfectionAttribut {
  id: number;
  confection_id: number;
  attribut_id: number;
  valeur: string;
  created_at: string;
  updated_at: string;
  
  // Relation
  attribut?: Attribut;
}

// Données pour créer une confection
export interface CreateConfectionData {
  user_id: number;
  categorie_id: number;
  nom_produit: string;
  quantite_produite: number;
  destination: DestinationConfection;
  description?: string;
  date_confection: string;
  cout_main_oeuvre?: number;
  prix_vente_unitaire?: number;
  details: CreateConfectionDetailData[];
  attributs?: CreateConfectionAttributData[];
}

export interface CreateConfectionDetailData {
  produit_id: number;
  quantite_utilisee: number;
  prix_unitaire: number;
}

export interface CreateConfectionAttributData {
  attribut_id: number;
  valeur: string;
}

// Données pour mettre à jour une confection
export interface UpdateConfectionData {
  nom_produit?: string;
  quantite_produite?: number;
  destination?: DestinationConfection;
  description?: string;
  cout_main_oeuvre?: number;
  prix_vente_unitaire?: number;
}

// Paramètres de filtrage
export interface ConfectionFilters {
  statut?: StatutConfection;
  destination?: DestinationConfection;
  user_id?: number;
  date_debut?: string;
  date_fin?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

// Réponse paginée (compatible avec le format du projet)
export interface ConfectionPaginatedResponse {
  data: Confection[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// Statistiques
export interface ConfectionStatistiques {
  total_confections: number;
  en_cours: number;
  terminees: number;
  annulees: number;
  par_destination: {
    vente: number;
    utilisation: number;
    mixte: number;
  };
  quantite_totale_produite: number;
  cout_total: number;
  valeur_potentielle: number;
}

// Réponse API standard (compatible avec le format du projet)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}