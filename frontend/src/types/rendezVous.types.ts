// src/types/rendezVous.types.ts

export interface RendezVous {
  id: number;
  client_id: number;
  coiffeur_id: number | null;
  type_prestation_id: number;
  date_heure: string;
  duree_minutes: number;
  prix_estime: number | null;
  statut: 'en_attente' | 'confirme' | 'en_cours' | 'termine' | 'annule' | 'no_show';
  notes: string | null;
  acompte_demande: boolean;
  acompte_montant: number | null;
  acompte_paye: boolean;
  sms_confirmation_envoye: boolean;
  sms_rappel_24h_envoye: boolean;
  sms_rappel_2h_envoye: boolean;
  motif_annulation: string | null;
  date_annulation: string | null;
  created_at: string;
  updated_at: string;
  
  // Relations
  client?: {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
  };
  coiffeur?: {
    id: number;
    nom: string;
    prenom: string;
    specialite?: string;
  };
  typePrestation?: {
    id: number;
    nom: string;
    description?: string;
    prix_base: number;
    duree_estimee_minutes: number; 
    };
}

export interface RendezVousPublic {
  id: number;
  type_prestation: {
    id: number;
    nom: string;
    description?: string;
  };
  coiffeur?: {
    nom: string;
    prenom: string;
  };
  date_heure: string;
  date_formattee: string;
  heure_formattee: string;
  duree_minutes: number;
  prix_estime: number;
  statut: string;
  statut_formate: string;
  statut_couleur: string;
  notes?: string;
  acompte_demande: boolean;
  acompte_montant?: number;
  acompte_paye: boolean;
  peut_annuler: boolean;
  heures_avant_rdv: number;
  est_passe: boolean;
  token_annulation: string;
}

export interface CreneauDisponible {
  heure: string;
  datetime: string;
  disponible: boolean;
}

export interface CreateRendezVousDTO {
  client_id?: number;
  nom?: string;
  prenom?: string;
  telephone: string;
  email?: string;
  type_prestation_id: number;
  date_heure: string;
  notes?: string;
}

export interface CreateRendezVousGerantDTO {
  client_id: number;
  coiffeur_id?: number;
  type_prestation_id: number;
  date_heure: string;
  duree_minutes: number;
  prix_estime?: number;
  statut?: 'en_attente' | 'confirme';
  notes?: string;
  acompte_demande?: boolean;
  acompte_montant?: number;
  acompte_paye?: boolean;
}

export interface MesRendezVousResponse {
  success: boolean;
  data: {
    client: {
      nom: string;
      prenom: string;
      telephone: string;
      points_fidelite: number;
    } | null;
    rendez_vous: {
      a_venir: RendezVousPublic[];
      passes: RendezVousPublic[];
      total: number;
    };
  };
  message?: string;
}

export interface RendezVousFilters {
  statut?: string;
  coiffeur_id?: number;
  client_id?: number;
  date?: string;
  date_debut?: string;
  date_fin?: string;
  a_venir?: boolean;
}