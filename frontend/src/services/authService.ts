// src/services/authService.ts
import axiosInstance from '../lib/axios';
import { LoginCredentials, LoginResponse, User } from '../types/auth';

export const authService = {
  // Connexion
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    // ✅ Appel API avec la bonne route
    const response = await axiosInstance.post('/auth/login', credentials);
    
    // ✅ CORRECTION : Adapter la structure de réponse Laravel
    // Laravel renvoie : { success: true, data: { user, access_token, token_type } }
    // On transforme en : { user, token }
    return {
      user: response.data.data.user,
      token: response.data.data.access_token
    };
  },

  // Déconnexion
  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  // Récupérer l'utilisateur connecté
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get('/auth/me');
    
    // ✅ CORRECTION : Laravel renvoie { success: true, data: user }
    return response.data.data;
  },

  // Vérifier si le token est valide
  verifyToken: async (): Promise<boolean> => {
    try {
      await axiosInstance.get('/auth/me');
      return true;
    } catch (error) {
      return false;
    }
  },

  // Rafraîchir les données de l'utilisateur
  refreshUser: async (): Promise<User> => {
    const response = await axiosInstance.get('/auth/me');
    return response.data.data;
  },

  // Rafraîchir le token
  refreshToken: async (): Promise<LoginResponse> => {
    const response = await axiosInstance.post('/auth/refresh');
    return {
      user: response.data.data.user,
      token: response.data.data.access_token
    };
  }
};