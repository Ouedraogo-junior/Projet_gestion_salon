// src/utils/tokenStorage.ts

const TOKEN_KEY = 'salon_auth_token';
const USER_KEY = 'salon_user_data';

export const tokenStorage = {
  // Sauvegarder le token
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Récupérer le token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Supprimer le token
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Sauvegarder les données utilisateur
  setUser: (user: any): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Récupérer les données utilisateur
  getUser: (): any | null => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  // Supprimer les données utilisateur
  removeUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },

  // Tout nettoyer
  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};