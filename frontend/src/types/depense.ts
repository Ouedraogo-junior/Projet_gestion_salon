// src/types/depense.ts
export interface Depense {
  id: number;
  libelle: string;
  montant: number;
  description?: string;
  categorie: string;
  date_depense: string;
  user_id: number;
  user?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface DepenseFormData {
  libelle: string;
  montant: number;
  description?: string;
  categorie: string;
  date_depense: string;
}

export interface DepenseFilters {
  mois?: number;
  annee?: number;
  categorie?: string;
  page?: number;
}

export interface DepenseStats {
  categorie: string;
  total: number;
}

export interface PaginatedDepenses {
  data: Depense[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}