// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, AuthContextType } from '../types/auth';
import { authService } from '../services/authService';
import { tokenStorage } from '../utils/tokenStorage';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}



export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = tokenStorage.getToken();
      const savedUser = tokenStorage.getUser();

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);

        // Vérifier si le token est toujours valide
        try {
          const freshUser = await authService.getCurrentUser();
          setUser(freshUser);
          tokenStorage.setUser(freshUser);
        } catch (error) {
          // Token invalide, nettoyer
          //console.error('Token invalide lors de la vérification:', error);
          tokenStorage.clear();
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Connexion
const login = async (credentials: LoginCredentials) => {
  try {
    //console.log('🔐 Tentative de connexion avec:', credentials.telephone);
    
    const response = await authService.login(credentials);
    
    //console.log('✅ Réponse du serveur:', response);

    // Vérifier que la réponse contient bien user et token
    if (!response.user || !response.token) {
      throw new Error('Réponse du serveur invalide');
    }

    // Sauvegarder le token et l'utilisateur
    tokenStorage.setToken(response.token);
    tokenStorage.setUser(response.user);
    setToken(response.token);
    setUser(response.user);

    //console.log('✅ Connexion réussie pour:', response.user.nom);
    
  } catch (error: any) {
    console.error('❌ Erreur de connexion:', error);
    
    // Meilleure gestion des erreurs Laravel
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.data?.errors) {
      const firstError = Object.values(error.response.data.errors)[0];
      throw new Error(Array.isArray(firstError) ? firstError[0] : 'Erreur de validation');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Erreur de connexion. Vérifiez vos identifiants.');
    }
  }
};

  // Déconnexion
  const logout = async () => {
    try {
      await authService.logout();
      //console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('⚠️ Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le localStorage et le state
      tokenStorage.clear();
      setToken(null);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    setUser,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};