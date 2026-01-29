// src/types/pointage.types.ts

export interface Pointage {
  id: number;
  user_id: number;
  pointeur_id: number | null;
  date_pointage: string;
  heure_arrivee: string;
  heure_depart: string | null;
  minutes_travailles: number | null;
  statut: 'present' | 'retard' | 'absent' | 'conge';
  type_pointage: 'manuel' | 'automatique' | 'badge';
  commentaire: string | null;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: {
    id: number;
    nom: string;
    prenom: string;
    nom_complet: string;
    role: string;
  };
  pointeur?: {
    id: number;
    nom: string;
    prenom: string;
    nom_complet: string;
  };
  
  // Accesseurs
  heures_travaillees?: string; // Format HH:MM
  statut_libelle?: string;
  is_en_cours?: boolean;
}

export interface CreatePointageDTO {
  user_id: number;
  date_pointage?: string;
  heure_arrivee?: string;
  statut?: 'present' | 'retard' | 'absent' | 'conge';
  commentaire?: string;
}

export interface UpdatePointageDTO {
  heure_arrivee?: string;
  heure_depart?: string;
  statut?: 'present' | 'retard' | 'absent' | 'conge';
  commentaire?: string;
}

export interface PointageFilters {
  user_id?: number;
  date?: string;
  date_debut?: string;
  date_fin?: string;
  mois?: number;
  annee?: number;
  statut?: 'present' | 'retard' | 'absent' | 'conge';
  aujourdhui?: boolean;
  per_page?: number;
}

export interface PointageStats {
  total_jours: number;
  presents: number;
  retards: number;
  absents: number;
  conges: number;
  total_minutes: number;
  total_heures: number;
  par_employe?: EmployeeStats[];
}

export interface EmployeeStats {
  user: {
    id: number;
    nom: string;
    prenom: string;
    nom_complet: string;
    role: string;
  };
  total_jours: number;
  presents: number;
  retards: number;
  absents: number;
  conges: number;
  total_heures: number;
}

export interface EmployeeAujourdhui {
  id: number;
  nom_complet: string;
  role: string;
  a_pointe: boolean;
  pointage: Pointage | null;
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