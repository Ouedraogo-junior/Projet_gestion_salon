// src/services/salonApi.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export interface Salon {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  email: string | null;
  horaires: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalonUpdateData {
  nom: string;
  adresse: string;
  telephone: string;
  email?: string;
  horaires?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const salonApi = {
  /**
   * Récupérer les infos du salon (accessible sans authentification)
   */
  async getSalon(): Promise<ApiResponse<Salon>> {
    const response = await api.get('/salon/public');
    return response.data;
  },
};