// src/services/userApi.ts
import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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

// Types
export interface User {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string | null;
  role: 'gerant' | 'coiffeur' | 'receptionniste';
  specialite: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const userApi = {
  /**
   * Récupérer les coiffeurs actifs
   */
  async getCoiffeurs(): Promise<ApiResponse<User[]>> {
    const response = await api.get('/users', {
      params: {
        role: 'coiffeur',
        is_active: true
      }
    });
    return response.data;
  },

  /**
   * Récupérer tous les utilisateurs actifs
   */
  async getAll(): Promise<ApiResponse<User[]>> {
    const response = await api.get('/users');
    return response.data;
  },

  /**
   * Récupérer un utilisateur par ID
   */
  async getOne(id: number): Promise<ApiResponse<User>> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
};