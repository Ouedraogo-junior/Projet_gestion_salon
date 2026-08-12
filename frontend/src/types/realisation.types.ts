export interface MediaRealisation {
  id: number;
  realisation_id: number;
  client_id?: number;
  media_url: string;
  type_media: 'photo' | 'video';
  type_photo: 'avant' | 'apres';
  date_prise: string;
}

export interface Realisation {
  id: number;
  client_id?: number;
  nom_coiffure?: string;
  montant_coiffure?: number;
  description?: string;
  date_prise: string;
  is_public: boolean;
  is_epingle: boolean;
  created_at: string;
  updated_at: string;
  medias: MediaRealisation[];
  client?: { id: number; nom: string; prenom: string };
}

export interface CreateRealisationDTO {
  nom_coiffure?: string;
  montant_coiffure?: number;
  description?: string;
  date_prise?: string;
  is_public?: boolean;
  // is_epingle?: boolean;
  client_id?: number;
  medias: File[];
  types_photo: ('avant' | 'apres')[];
  types_media: ('photo' | 'video')[];
}

export interface UpdateRealisationDTO {
  nom_coiffure?: string;
  montant_coiffure?: number;
  description?: string;
  date_prise?: string;
  is_public?: boolean;
  // is_epingle?: boolean;
  client_id?: number;
}

export interface AddMediasDTO {
  medias: File[];
  types_photo: ('avant' | 'apres')[];
  types_media: ('photo' | 'video')[];
}

export interface RealisationFilters {
  search?: string;
  is_public?: boolean;
  client_id?: number;
  per_page?: number;
  page?: number;
}

export interface PaginatedRealisations {
  data: Realisation[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}