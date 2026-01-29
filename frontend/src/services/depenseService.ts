// src/services/depenseService.ts
import axios from '@/lib/axios';
import { Depense, DepenseFormData, DepenseFilters, PaginatedDepenses, DepenseStats } from '@/types/depense';

const API_URL = '/depenses';

export const depenseService = {
  getAll: async (filters?: DepenseFilters): Promise<PaginatedDepenses> => {
    const params = new URLSearchParams();
    if (filters?.mois) params.append('mois', filters.mois.toString());
    if (filters?.annee) params.append('annee', filters.annee.toString());
    if (filters?.categorie && filters.categorie !== 'tous') params.append('categorie', filters.categorie);
    if (filters?.page) params.append('page', filters.page.toString());

    const { data } = await axios.get(`${API_URL}?${params}`);
    return data;
  },

  getById: async (id: number): Promise<Depense> => {
    const { data } = await axios.get(`${API_URL}/${id}`);
    return data;
  },

  create: async (depense: DepenseFormData): Promise<Depense> => {
    const { data } = await axios.post(API_URL, depense);
    return data;
  },

  update: async (id: number, depense: Partial<DepenseFormData>): Promise<Depense> => {
    const { data } = await axios.put(`${API_URL}/${id}`, depense);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },

  getTotalMois: async (mois?: number, annee?: number): Promise<number> => {
    const params = new URLSearchParams();
    if (mois) params.append('mois', mois.toString());
    if (annee) params.append('annee', annee.toString());

    const { data } = await axios.get(`${API_URL}/stats/total-mois?${params}`);
    return data.total || 0; // Retourner 0 si undefined
  },

  getStatsParCategorie: async (mois?: number, annee?: number): Promise<DepenseStats[]> => {
    const params = new URLSearchParams();
    if (mois) params.append('mois', mois.toString());
    if (annee) params.append('annee', annee.toString());

    const { data } = await axios.get(`${API_URL}/stats/par-categorie?${params}`);
    return data || []; // Retourner [] si undefined
  },
};