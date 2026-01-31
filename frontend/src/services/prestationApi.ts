// src/services/prestationApi.ts - VERSION OPTIMALE

import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';
import type {
  TypePrestation,
  CreateTypePrestationDTO,
  UpdateTypePrestationDTO,
  ReorderItemDTO,
  PrestationStats,
  TypePrestationFilters,
  ApiResponse,
  PaginatedResponse,
} from '../types/prestation.types';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Instance axios avec authentification
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token - Utilise tokenStorage
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ Erreur 401 - Session expirée');
      // Nettoyer le token invalide
      tokenStorage.clear();
      // Optionnel: Redirection automatique vers login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const prestationApi = {
  /**
   * Liste des types de prestations
   */
  async getAll(
    filters?: TypePrestationFilters
  ): Promise<ApiResponse<PaginatedResponse<TypePrestation> | TypePrestation[]>> {
    const response = await api.get('/types-prestations', { params: filters });
    return response.data;
  },

  /**
   * Récupérer toutes les prestations actives (pour modal de sélection)
   */
  async getAllActive(): Promise<ApiResponse<TypePrestation[]>> {
    const response = await api.get('/types-prestations', {
      params: { actif: true, all: true, sort_by: 'ordre', sort_order: 'asc' },
    });
    return response.data;
  },

  /**
   * Détails d'une prestation
   */
  async getOne(id: number): Promise<ApiResponse<TypePrestation>> {
    const response = await api.get(`/types-prestations/${id}`);
    return response.data;
  },

  /**
   * Créer une prestation
   */
  async create(data: CreateTypePrestationDTO): Promise<ApiResponse<TypePrestation>> {
    const response = await api.post('/types-prestations', data);
    return response.data;
  },

  /**
   * Modifier une prestation
   */
  async update(id: number, data: UpdateTypePrestationDTO): Promise<ApiResponse<TypePrestation>> {
    const response = await api.put(`/types-prestations/${id}`, data);
    return response.data;
  },

  /**
   * Supprimer une prestation
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/types-prestations/${id}`);
    return response.data;
  },

  /**
   * Activer/Désactiver une prestation
   */
  async toggleActif(id: number): Promise<ApiResponse<TypePrestation>> {
    const response = await api.patch(`/types-prestations/${id}/toggle-actif`);
    return response.data;
  },

  /**
   * Réorganiser les prestations
   */
  async reorder(ordres: ReorderItemDTO[]): Promise<ApiResponse<void>> {
    const response = await api.post('/types-prestations/reorder', { ordres });
    return response.data;
  },

  /**
   * Statistiques des prestations
   */
  async getStats(dateDebut?: string, dateFin?: string): Promise<ApiResponse<PrestationStats[]>> {
    const response = await api.get('/types-prestations/stats', {
      params: { date_debut: dateDebut, date_fin: dateFin },
    });
    return response.data;
  },

  async getAllPublic(): Promise<ApiResponse<TypePrestation[]>> {
    const response = await axios.get(`${API_URL}/types-prestations/public`);
    return response.data;
  },
};