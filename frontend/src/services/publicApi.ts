// src/services/publicApi.ts

import axios from 'axios';
import type {
  SalonPublicInfo,
  PrestationPublique,
  ProduitPublic,
  ProduitPublicDetail,
  PhotoPublique,
} from '@/types/public.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

type ApiResponse<T> = { success: boolean; data: T };

export const publicApiService = {
  getSalonDefaut: (): Promise<ApiResponse<SalonPublicInfo>> =>
    publicApi.get('/public/salon-defaut').then((r) => r.data),

  getSalonInfo: (slug?: string): Promise<ApiResponse<SalonPublicInfo>> =>
    publicApi.get(slug ? `/public/${slug}/info` : '/public/info').then((r) => r.data),

  getPrestations: (slug?: string): Promise<ApiResponse<PrestationPublique[]>> =>
    publicApi.get(slug ? `/public/${slug}/prestations` : '/public/prestations').then((r) => r.data),

  getProduits: (slug?: string): Promise<ApiResponse<ProduitPublic[]>> =>
    publicApi.get(slug ? `/public/${slug}/produits` : '/public/produits').then((r) => r.data),

  getProduitDetails: (id: number): Promise<ApiResponse<ProduitPublicDetail>> =>
    publicApi.get(`/public/produits/${id}`).then((r) => r.data),

  getPhotosPubliques: (slug?: string): Promise<ApiResponse<PhotoPublique[]>> =>
    publicApi.get(slug ? `/public/${slug}/photos` : '/public/photos').then((r) => r.data),
};

