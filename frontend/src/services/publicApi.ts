// src/services/publicApi.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const publicApiService = {
  // Obtenir le salon par défaut
  getSalonDefaut: async () => {
    const response = await publicApi.get('/public/salon-defaut');
    return response.data;
  },

  // Info salon (avec ou sans slug)
  getSalonInfo: async (slug?: string) => {
    const url = slug ? `/public/${slug}/info` : '/public/info';
    const response = await publicApi.get(url);
    return response.data;
  },

  // Prestations (avec ou sans slug)
  getPrestations: async (slug?: string) => {
    const url = slug ? `/public/${slug}/prestations` : '/public/prestations';
    const response = await publicApi.get(url);
    return response.data;
  },

  // Produits (avec ou sans slug)
  getProduits: async (slug?: string) => {
    const url = slug ? `/public/${slug}/produits` : '/public/produits';
    const response = await publicApi.get(url);
    return response.data;
  },
};