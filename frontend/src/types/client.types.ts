// src/types/client.types.ts

export interface Client {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  date_naissance?: string;
  adresse?: string;
  date_premiere_visite: string;
  date_derniere_visite?: string;
  points_fidelite: number;
  montant_total_depense: number;
  notes?: string;
  is_active: boolean;
  sync_status: 'synced' | 'pending' | 'conflict';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  
  // Relations
  photos?: PhotoClient[];
}

export interface PhotoClient {
  id: number;
  client_id: number;
  vente_id?: number;
  rendez_vous_id?: number;
  photo_url: string;
  type_photo: 'avant' | 'apres';
  description?: string;
  date_prise: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateClientDTO {
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  date_naissance?: string;
  adresse?: string;
  notes?: string;
}

export interface UpdateClientDTO {
  nom?: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  date_naissance?: string;
  adresse?: string;
  notes?: string;
  is_active?: boolean;
}

export interface ClientFilters {
  search?: string;
  is_active?: boolean;
  min_points?: number;
  date_debut?: string;
  date_fin?: string;
  sort_by?: 'nom' | 'prenom' | 'created_at' | 'date_derniere_visite' | 'points_fidelite' | 'montant_total_depense';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface ClientStats {
  points_fidelite: number;
  montant_total_depense: number;
  date_premiere_visite: string;
  date_derniere_visite?: string;
}

export interface UploadPhotoDTO {
  photo: File;
  type_photo: 'avant' | 'apres';
  description?: string;
  vente_id?: number;
  rendez_vous_id?: number;
  is_public?: boolean;
}