// src/types/rendezVous.types.ts
import type { RendezVousPaiement } from './rendezVousPaiement.types';
import type { TypePrestation } from './prestation.types'; 
import type { VenteDetail } from './vente.types';

export interface RendezVous {
  id: number;
  client_id: number;
  coiffeur_id: number | null;
  coiffeurs?: Array<{
    id: number;
    nom: string;
    prenom: string;
    specialite?: string;
  }>;
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

  vente?: {
    id: number;
    montant_total_ttc: number;
    montant_total_ht: number;
    montant_prestations: number;
    montant_produits: number;
    details?: VenteDetail[];
  };
  
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
  
  // ANCIEN (à garder pour rétro-compatibilité si des RDV existants l'utilisent)
  typePrestation?: {
    id: number;
    nom: string;
    description?: string;
    prix_base: number;
    duree_estimee_minutes: number; 
  };
  
  // NOUVEAU (système multi-prestations)
  prestations?: TypePrestation[];
  
  paiements?: RendezVousPaiement[];
}

export interface RendezVousPublic {
  id: number;
  
  // ANCIEN (single)
  type_prestation?: {
    id: number;
    nom: string;
    description?: string;
  };
  
  // NOUVEAU (multi)
  prestations?: TypePrestation[];
  
  coiffeur?: {
    nom: string;
    prenom: string;
  };
  
  coiffeurs?: Array<{
    id: number;
    nom: string;
    prenom: string;
  }>;
  
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

// ANCIEN (API publique - single prestation)
export interface CreateRendezVousDTO {
  client_id?: number;
  nom?: string;
  prenom?: string;
  telephone: string;
  email?: string;
  type_prestation_id?: number; // ANCIEN
  type_prestation_ids?: number[]; // NOUVEAU
  date_heure: string;
  notes?: string;
}

// NOUVEAU (API gérant - multi-prestations)
export interface CreateRendezVousGerantDTO {
  client_id: number;
  coiffeur_id?: number;
  coiffeur_ids?: number[];
  type_prestation_ids: number[]; // ← MULTI
  date_heure: string;
  duree_minutes?: number;
  prix_estime?: number;
  statut?: 'en_attente' | 'confirme';
  notes?: string;
  acompte_demande?: boolean;
  acompte_montant?: number;
  acompte_paye?: boolean;
  mode_paiement?: 'especes' | 'carte' | 'cheque' | 'virement' | 'orange_money' | 'moov_money';
  reference_transaction?: string;
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

export interface PrestationSelectionnee {
  id: number;
  nom: string;
  prix_unitaire: number;
  duree_minutes: number;
  coiffeur_id?: number;
}