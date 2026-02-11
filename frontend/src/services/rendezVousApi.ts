// src/services/rendezVousApi.ts

import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';
import type {
  RendezVous,
  RendezVousPublic,
  CreateRendezVousDTO,
  CreateRendezVousGerantDTO,
  MesRendezVousResponse,
  CreneauDisponible,
  RendezVousFilters,
} from '../types/rendezVous.types';
import type { PayerAcompteDTO, FinaliserRendezVousDTO } from '../types/rendezVousPaiement.types';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Instance avec auth
const apiAuth = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiAuth.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Instance sans auth (publique)
const apiPublic = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Fonction de normalisation snake_case -> camelCase
const normalizeRendezVous = (rdv: any): RendezVous => ({
  ...rdv,
  typePrestation: rdv.type_prestation,
});

export const rendezVousApi = {
  // ============ ROUTES PUBLIQUES ============
  
  /**
   * Prendre un rendez-vous (public)
   */
  async prendreRendezVous(data: CreateRendezVousDTO): Promise<ApiResponse<any>> {
    const response = await apiPublic.post('/rendez-vous/public', data);
    return response.data;
  },

  /**
   * Récupérer mes rendez-vous par téléphone (public)
   */
  async getMesRendezVous(telephone: string): Promise<MesRendezVousResponse> {
    const response = await apiPublic.post('/rendez-vous/mes-rendez-vous', {
      telephone,
    });
    return response.data;
  },

  /**
   * Annuler un rendez-vous (public)
   */
  async annulerRendezVousPublic(
    id: number,
    telephone: string,
    motif?: string
  ): Promise<ApiResponse<any>> {
    const response = await apiPublic.post(`/rendez-vous/${id}/cancel-public`, {
      telephone,
      motif_annulation: motif,
    });
    return response.data;
  },

  /**
   * Récupérer les créneaux disponibles
   */
  async getCreneauxDisponibles(
    date: string,
    typePrestationId: number,
    coiffeurId?: number
  ): Promise<ApiResponse<{ date: string; creneaux: CreneauDisponible[] }>> {
    const response = await apiPublic.get('/rendez-vous/available-slots', {
      params: {
        date,
        type_prestation_id: typePrestationId,
        coiffeur_id: coiffeurId,
      },
    });
    return response.data;
  },

  // ============ ROUTES AUTHENTIFIÉES (GÉRANT) ============

  /**
   * Liste des rendez-vous avec filtres
   */
   async getAll(filters?: RendezVousFilters): Promise<ApiResponse<{ data: RendezVous[] }>> {
    const response = await apiAuth.get('/rendez-vous', { params: filters });
    return {
      ...response.data,
      data: {
        ...response.data.data,
        data: response.data.data.data.map(normalizeRendezVous),
      },
    };
  },

  /**
   * Détails d'un rendez-vous
   */
  async getOne(id: number): Promise<ApiResponse<RendezVous>> {
    const response = await apiAuth.get(`/rendez-vous/${id}`);
    return {
      ...response.data,
      data: normalizeRendezVous(response.data.data),
    };
  },

  /**
   * Créer un rendez-vous (gérant)
   */
  async create(data: CreateRendezVousGerantDTO): Promise<ApiResponse<RendezVous>> {
    const response = await apiAuth.post('/rendez-vous', data);
    return response.data;
  },

  /**
   * Modifier un rendez-vous
   */
  async update(id: number, data: Partial<CreateRendezVousGerantDTO>): Promise<ApiResponse<RendezVous>> {
    const response = await apiAuth.put(`/rendez-vous/${id}`, data);
    return response.data;
  },

  /**
   * Supprimer un rendez-vous
   */
  async delete(id: number): Promise<ApiResponse<any>> {
    const response = await apiAuth.delete(`/rendez-vous/${id}`);
    return response.data;
  },

  /**
   * Confirmer un rendez-vous
   */
  async confirmer(id: number, data?: { coiffeur_id?: number; notes?: string }): Promise<ApiResponse<RendezVous>> {
    const response = await apiAuth.post(`/rendez-vous/${id}/confirm`, data);
    return response.data;
  },

  /**
   * Annuler un rendez-vous (gérant)
   */
  async annuler(id: number, motif: string): Promise<ApiResponse<RendezVous>> {
    const response = await apiAuth.post(`/rendez-vous/${id}/cancel`, {
      motif_annulation: motif,
    });
    return response.data;
  },

  /**
   * Marquer comme terminé
   */
  async terminer(id: number): Promise<ApiResponse<RendezVous>> {
    const response = await apiAuth.post(`/rendez-vous/${id}/complete`);
    return response.data;
  },

  /**
   * Mettre à jour l'acompte d'un rendez-vous
   */
  async updateAcompte(id: number, acompte_montant: number): Promise<ApiResponse<RendezVous>> {
    const response = await apiAuth.patch(`/rendez-vous/${id}/acompte`, {
      acompte_montant,
    });
    return response.data;
  },

  /**
   * Marquer l'acompte comme payé
   */
  async marquerAcomptePaye(id: number): Promise<ApiResponse<RendezVous>> {
    const response = await apiAuth.post(`/rendez-vous/${id}/marquer-acompte-paye`);
    return response.data;
  },

  // ============ GESTION PAIEMENTS ============

  /**
   * Payer l'acompte d'un rendez-vous
   */
  async payerAcompte(id: number, data: PayerAcompteDTO): Promise<ApiResponse<any>> {
    const response = await apiAuth.post(`/rendez-vous/${id}/payer-acompte`, data);
    return response.data;
  },

  /**
   * Marquer le rendez-vous comme en cours (client arrivé)
   */
  async marquerEnCours(id: number): Promise<ApiResponse<any>> {
    const response = await apiAuth.patch(`/rendez-vous/${id}/marquer-en-cours`);
    return response.data;
  },

  /**
   * Finaliser le rendez-vous (créer vente + payer solde)
   */
  async finaliserRendezVous(id: number, data: FinaliserRendezVousDTO): Promise<ApiResponse<any>> {
    const response = await apiAuth.post(`/rendez-vous/${id}/finaliser`, data);
    return response.data;
  },

  /**
   * Récupérer l'historique des paiements
   */
  async getHistoriquePaiements(id: number): Promise<any> {
    const response = await apiAuth.get(`/rendez-vous/${id}/historique-paiements`);
    return response.data;
  },

  /**
   * Liste des rendez-vous avec paiements (NOUVELLE MÉTHODE)
   */
  async getListeAvecPaiements(params?: { 
    search?: string; 
    date_debut?: string; 
    date_fin?: string;
    page?: number;
  }): Promise<any> {
    const response = await apiAuth.get('/rendez-vous/liste-avec-paiements', { params });
    return response.data;
  },

  /**
   * Générer le reçu d'acompte (PDF)
   */
  getRecuAcompteUrl(id: number): string {
    const token = tokenStorage.getToken();
    return `${API_URL}/rendez-vous/${id}/recu-acompte?token=${token}`;
  },

  /**
   * Générer le reçu final (PDF)
   */
  getRecuFinalUrl(id: number): string {
    const token = tokenStorage.getToken();
    return `${API_URL}/rendez-vous/${id}/recu-final?token=${token}`;
  },
};