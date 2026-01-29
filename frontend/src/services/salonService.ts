// src/services/salonService.ts
import axiosInstance from '@/lib/axios';

export interface Salon {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  email: string | null;
  horaires: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalonUpdateData {
  nom: string;
  adresse: string;
  telephone: string;
  email?: string;
  horaires?: string;
}

export const salonService = {
  // Récupérer les infos du salon
  getSalon: async () => {
    const { data } = await axiosInstance.get('/salon');
    return data;
  },

  // Mettre à jour les infos du salon
  updateSalon: async (salonData: SalonUpdateData) => {
    const { data } = await axiosInstance.put('/salon', salonData);
    return data;
  },

  // Upload du logo
  uploadLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    
    const { data } = await axiosInstance.post('/salon/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Supprimer le logo
  deleteLogo: async () => {
    const { data } = await axiosInstance.delete('/salon/logo');
    return data;
  },
};