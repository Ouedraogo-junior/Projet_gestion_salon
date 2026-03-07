// src/types/depense.ts

export interface CategorieDepense {
  id: number;
  nom: string;
  slug: string;
  couleur?: string;
  icone?: string;
  is_active: boolean;
  ordre: number;
  created_at: string;
  updated_at: string;
}

export interface CategorieDepenseFormData {
  nom: string;
  couleur?: string;
  icone?: string;
  ordre?: number;
  is_active?: boolean;
}

export interface Depense {
  id: number;
  libelle: string;
  montant: number;
  description?: string;
  categorie_depense_id: number;
  categorie_depense?: CategorieDepense;
  date_depense: string;
  user_id: number;
  user?: {
    id: number;
    nom: string;
    prenom: string;
  };
  created_at: string;
  updated_at: string;
}

export interface DepenseFormData {
  libelle: string;
  montant: number;
  description?: string;
  categorie_depense_id: number;
  date_depense: string;
}

export interface DepenseFilters {
  mois?: number;
  annee?: number;
  categorie_depense_id?: number;
  page?: number;
}

export interface DepenseStats {
  categorie: CategorieDepense;
  total: number;
}

export interface PaginatedDepenses {
  data: Depense[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}