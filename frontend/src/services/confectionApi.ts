// src/services/confectionApi.ts
import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';
import type {
  Confection,
  CreateConfectionData,
  UpdateConfectionData,
  ConfectionFilters,
  ConfectionPaginatedResponse,
  ConfectionStatistiques,
  ApiResponse,
} from '../types/confection';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Service API pour les confections
export const confectionApi = {
  /**
   * Récupérer la liste des confections avec filtres
   */
  async getAll(filters?: ConfectionFilters): Promise<ApiResponse<ConfectionPaginatedResponse>> {
    const response = await api.get('/confections', { params: filters });
    return response.data;
  },

  /**
   * Récupérer une confection par ID
   */
  async getById(id: number): Promise<ApiResponse<Confection>> {
    const response = await api.get(`/confections/${id}`);
    return response.data;
  },

  /**
   * Créer une nouvelle confection
   */
  async create(data: CreateConfectionData): Promise<ApiResponse<Confection>> {
    const response = await api.post('/confections', data);
    return response.data;
  },

  /**
   * Mettre à jour une confection (uniquement si en_cours)
   */
  async update(id: number, data: UpdateConfectionData): Promise<ApiResponse<Confection>> {
    const response = await api.put(`/confections/${id}`, data);
    return response.data;
  },

  /**
   * Supprimer une confection
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/confections/${id}`);
    return response.data;
  },

  /**
   * Terminer une confection et créer le produit
   */
  async terminer(id: number): Promise<ApiResponse<Confection>> {
    const response = await api.post(`/confections/${id}/terminer`);
    return response.data;
  },

  /**
   * Annuler une confection
   */
  async annuler(id: number, motif?: string): Promise<ApiResponse<Confection>> {
    const response = await api.post(`/confections/${id}/annuler`, { motif });
    return response.data;
  },

  /**
   * Obtenir les statistiques des confections
   */
  async getStatistiques(dateDebut?: string, dateFin?: string): Promise<ApiResponse<ConfectionStatistiques>> {
    const response = await api.get('/confections/statistiques', {
      params: {
        date_debut: dateDebut,
        date_fin: dateFin,
      },
    });
    return response.data;
  },
};

export default confectionApi;