// src/services/depenseService.ts

import axios from '@/lib/axios';
import {
  Depense, DepenseFormData, DepenseFilters,
  PaginatedDepenses, DepenseStats,
  CategorieDepense, CategorieDepenseFormData
} from '@/types/depense';

const API_URL = '/depenses';
const CAT_URL = '/categories-depenses';

export const categorieDepenseService = {
  getAll: async (): Promise<CategorieDepense[]> => {
    const { data } = await axios.get(CAT_URL);
    return data;
  },

  create: async (categorie: CategorieDepenseFormData): Promise<CategorieDepense> => {
    const { data } = await axios.post(CAT_URL, categorie);
    return data;
  },

  update: async (id: number, categorie: Partial<CategorieDepenseFormData>): Promise<CategorieDepense> => {
    const { data } = await axios.put(`${CAT_URL}/${id}`, categorie);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${CAT_URL}/${id}`);
  },
};

export const depenseService = {
  getAll: async (filters?: DepenseFilters): Promise<PaginatedDepenses> => {
    const params = new URLSearchParams();
    if (filters?.mois) params.append('mois', filters.mois.toString());
    if (filters?.annee) params.append('annee', filters.annee.toString());
    if (filters?.categorie_depense_id) params.append('categorie_depense_id', filters.categorie_depense_id.toString());
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
    return data.total || 0;
  },

  getStatsParCategorie: async (mois?: number, annee?: number): Promise<DepenseStats[]> => {
    const params = new URLSearchParams();
    if (mois) params.append('mois', mois.toString());
    if (annee) params.append('annee', annee.toString());
    const { data } = await axios.get(`${API_URL}/stats/par-categorie?${params}`);
    return data || [];
  },
};