// src/services/userApi.ts
import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';


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
  role: 'gerant' | 'coiffeur' | 'gestionnaire';
  specialite: string | null;
  salaire_mensuel: number | null;
  photo_url: string | null;
  is_active: boolean;
  nom_complet: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreateData {
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  password: string;
  role: 'gerant' | 'coiffeur' | 'gestionnaire';
  specialite?: string;
  is_active?: boolean;
}

export interface UserUpdateData {
  nom?: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  role?: 'gerant' | 'coiffeur' | 'gestionnaire';
  specialite?: string;
  is_active?: boolean;
}

export interface UserFilters {
  role?: string;
  is_active?: boolean;
  search?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface SalaireData {
  salaire_mensuel: number;
}

export interface SalairesResponse {
  employes: User[];
  total_mensuel: number;
  total_annuel: number;
  nombre_employes: number;
}

export interface ProfilUpdateData {
  nom?: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  specialite?: string;
}

export interface ChangePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
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
  async getAll(filters?: UserFilters): Promise<ApiResponse<User[]>> {
    const response = await api.get('/users', { params: filters });
    return response.data;
  },

  /**
   * Récupérer un utilisateur par ID
   */
  async getOne(id: number): Promise<ApiResponse<User>> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Créer un utilisateur (gérant uniquement)
   */
  async create(userData: UserCreateData): Promise<ApiResponse<User>> {
    const response = await api.post('/users', userData);
    return response.data;
  },

  /**
   * Mettre à jour un utilisateur (gérant uniquement)
   */
  async update(id: number, userData: UserUpdateData): Promise<ApiResponse<User>> {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Supprimer un utilisateur - soft delete (gérant uniquement)
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  /**
   * Activer/Désactiver un utilisateur (gérant uniquement)
   */
  async toggleActive(id: number): Promise<ApiResponse<User>> {
    const response = await api.post(`/users/${id}/toggle-active`);
    return response.data;
  },

  /**
   * Réinitialiser le mot de passe d'un utilisateur (gérant uniquement)
   */
  async resetPassword(
    id: number,
    password: string,
    password_confirmation: string
  ): Promise<ApiResponse<void>> {
    const response = await api.post(`/users/${id}/reset-password`, {
      password,
      password_confirmation,
    });
    return response.data;
  },

  /**
   * Changer son propre mot de passe
   */
  async changePassword(
    current_password: string,
    password: string,
    password_confirmation: string
  ): Promise<ApiResponse<void>> {
    const response = await api.post('/auth/change-password', {
      current_password,
      password,
      password_confirmation,
    });
    return response.data;
  },


  /**
   * Mettre à jour le salaire d'un utilisateur (gérant uniquement)
   */
  async updateSalaire(id: number, salaire_mensuel: number): Promise<ApiResponse<User>> {
    const response = await api.patch(`/users/${id}/salaire`, { salaire_mensuel });
    return response.data;
  },

  /**
   * Récupérer tous les salaires (gérant uniquement)
   */
  async getSalaires(): Promise<ApiResponse<SalairesResponse>> {
    const response = await api.get('/users/salaires');
    return response.data;
  },

  /**
   * Récupérer les coiffeurs pour les ventes
   */
  async getCoiffeursActifs(): Promise<ApiResponse<User[]>> {
    const response = await api.get('/users/coiffeurs');
    return response.data;
  },

  /**
   * Mettre à jour son propre profil
   */
  async updateProfil(data: ProfilUpdateData): Promise<ApiResponse<User>> {
    const response = await api.put('/profil', data);
    return response.data;
  },

  /**
   * Changer son propre mot de passe
   */
  async changeMyPassword(data: ChangePasswordData): Promise<ApiResponse<void>> {
    const response = await api.post('/profil/change-password', data);
    return response.data;
  },

  /**
   * Uploader sa photo de profil
   */
  async uploadPhoto(file: File): Promise<ApiResponse<User>> {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await api.post('/profil/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Supprimer sa photo de profil
   */
  async deletePhoto(): Promise<ApiResponse<User>> {
    const response = await api.delete('/profil/photo');
    return response.data;
  },
  
};