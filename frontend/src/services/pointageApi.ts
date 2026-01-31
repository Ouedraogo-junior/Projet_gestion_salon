// src/services/pointageApi.ts

import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';
import type {
  Pointage,
  CreatePointageDTO,
  UpdatePointageDTO,
  PointageFilters,
  PointageStats,
  EmployeeAujourdhui,
  ApiResponse,
  PaginatedResponse,
} from '../types/pointage.types';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur auth
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

// Intercepteur erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ Erreur 401 - Session expirée');
      tokenStorage.clear();
    }
    return Promise.reject(error);
  }
);

export const pointageApi = {
  /**
   * Liste des pointages
   */
  async getAll(
    filters?: PointageFilters
  ): Promise<ApiResponse<PaginatedResponse<Pointage>>> {
    const response = await api.get('/pointages', { params: filters });
    return response.data;
  },

  /**
   * Créer un pointage (arrivée)
   */
  async create(data: CreatePointageDTO): Promise<ApiResponse<Pointage>> {
    const response = await api.post('/pointages', data);
    return response.data;
  },

  /**
   * Modifier un pointage
   */
  async update(id: number, data: UpdatePointageDTO): Promise<ApiResponse<Pointage>> {
    const response = await api.put(`/pointages/${id}`, data);
    return response.data;
  },

  /**
   * Marquer le départ
   */
  async marquerDepart(id: number, heureDepart?: string): Promise<ApiResponse<Pointage>> {
    const response = await api.post(`/pointages/${id}/depart`, {
      heure_depart: heureDepart,
    });
    return response.data;
  },

  /**
   * Supprimer un pointage
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/pointages/${id}`);
    return response.data;
  },

  /**
   * Statistiques
   */
  async getStats(
    dateDebut: string,
    dateFin: string,
    userId?: number
  ): Promise<ApiResponse<PointageStats>> {
    const response = await api.get('/pointages/stats', {
      params: {
        date_debut: dateDebut,
        date_fin: dateFin,
        user_id: userId,
      },
    });
    return response.data;
  },

  /**
   * Employés avec pointage du jour
   */
  async getEmployeesAujourdhui(): Promise<ApiResponse<EmployeeAujourdhui[]>> {
    const response = await api.get('/pointages/employees-aujourdhui');
    return response.data;
  },
};