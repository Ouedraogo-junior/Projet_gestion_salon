// src/types/rendezVousPaiement.types.ts

export interface RendezVousPaiement {
  id: number;
  rendez_vous_id: number;
  type_paiement: 'acompte' | 'solde';
  montant: number;
  mode_paiement: 'especes' | 'orange_money' | 'moov_money' | 'carte';
  reference_transaction?: string;
  date_paiement: string;
  user_id: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  user?: {
    id: number;
    nom: string;
    prenom: string;
  };
}

export interface PayerAcompteDTO {
  montant: number;
  mode_paiement: 'especes' | 'orange_money' | 'moov_money' | 'carte';
  reference_transaction?: string;
  notes?: string;
}

export interface FinaliserRendezVousDTO {
  articles: Array<{
    type: 'prestation' | 'produit';
    id: number;
    quantite: number;
    prix_unitaire: number;
    reduction?: number;
    source_stock?: 'vente' | 'utilisation';
  }>;
  paiements: Array<{
    mode: 'especes' | 'orange_money' | 'moov_money' | 'carte';
    montant: number;
    reference?: string;
  }>;
  reduction?: {
    type: 'fixe' | 'pourcentage';
    valeur: number;
  };
  points_utilises?: number;
  notes?: string;
}

export interface HistoriquePaiementsResponse {
  success: boolean;
  data: RendezVousPaiement[];
}