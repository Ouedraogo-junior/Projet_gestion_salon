// src/lib/axios.ts

import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';

// URL de base de ton API Laravel
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Création de l'instance Axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important pour Sanctum (cookies CSRF)
});

// Intercepteur de requête : Ajouter le token à chaque requête
axiosInstance.interceptors.request.use(
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

// Intercepteur de réponse : Gérer les erreurs globalement
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si 401 (non autorisé), déconnecter l'utilisateur
    if (error.response?.status === 401) {
      tokenStorage.clear();
      window.location.href = '/login';
    }

    // Si 403 (interdit), rediriger vers une page d'erreur
    if (error.response?.status === 403) {
      console.error('Accès interdit');
    }

    // Si 500 (erreur serveur)
    if (error.response?.status >= 500) {
      console.error('Erreur serveur');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;