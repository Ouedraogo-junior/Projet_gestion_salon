// src/types/prestation.types.ts

export interface TypePrestation {
  id: number;
  nom: string;
  description: string | null;
  duree_estimee_minutes: number | null;
  prix_base: number;
  actif: boolean;
  ordre: number;
  created_at: string;
  updated_at: string;
  duree_formattee?: string;
  prix_formatte?: string;
}

export interface CreateTypePrestationDTO {
  nom: string;
  description?: string;
  duree_estimee_minutes?: number;
  prix_base: number;
  actif?: boolean;
  ordre?: number;
}

export interface UpdateTypePrestationDTO {
  nom: string;
  description?: string;
  duree_estimee_minutes?: number;
  prix_base: number;
  actif?: boolean;
  ordre?: number;
}

export interface ReorderItemDTO {
  id: number;
  ordre: number;
}

export interface PrestationStats {
  id: number;
  nom: string;
  nombre_ventes: number;
  montant_total: number;
}

export interface TypePrestationFilters {
  search?: string;
  actif?: boolean;
  sort_by?: 'nom' | 'prix_base' | 'ordre' | 'created_at';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  all?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}