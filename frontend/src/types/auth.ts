// src/types/auth.ts

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string;
  role: 'gerant' | 'coiffeur' | 'gestionnaire';
  photo_url?: string;
  specialite?: string;
  is_active: boolean;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  telephone: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User) => void;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}