// src/services/clientApi.ts
import axios from '../lib/axios';
import type {
  Client,
  CreateClientDTO,
  UpdateClientDTO,
  ClientFilters,
  ClientStats,
  PhotoClient,
  UploadPhotoDTO,
} from '../types/client.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const clientApi = {
  /**
   * Récupérer la liste des clients avec filtres
   */
  async getClients(filters?: ClientFilters): Promise<PaginatedResponse<Client>> {
    // Nettoyer les filtres pour enlever les valeurs vides
    const cleanFilters: Record<string, any> = {};
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          cleanFilters[key] = value;
        }
      });
    }

    const { data } = await axios.get('/clients', { params: cleanFilters });
    return data;
  },

  /**
   * Récupérer un client par ID
   */
  async getClient(id: number): Promise<ApiResponse<{ client: Client; statistiques: ClientStats }>> {
    const { data } = await axios.get(`/clients/${id}`); // CORRIGÉ: backticks → parenthèses
    return data;
  },

  /**
   * Créer un nouveau client
   */
  async createClient(clientData: CreateClientDTO): Promise<ApiResponse<Client>> {
    const { data } = await axios.post('/clients', clientData);
    return data;
  },

  /**
   * Mettre à jour un client
   */
  async updateClient(id: number, clientData: UpdateClientDTO): Promise<ApiResponse<Client>> {
    const { data } = await axios.put(`/clients/${id}`, clientData); // CORRIGÉ
    return data;
  },

  /**
   * Supprimer un client
   */
  async deleteClient(id: number): Promise<ApiResponse<void>> {
    const { data } = await axios.delete(`/clients/${id}`); // CORRIGÉ
    return data;
  },

  /**
   * Upload une photo pour un client
   */
  async uploadPhoto(clientId: number, photoData: UploadPhotoDTO): Promise<ApiResponse<PhotoClient>> {
    const formData = new FormData();
    formData.append('photo', photoData.photo);
    formData.append('type_photo', photoData.type_photo);
    if (photoData.description) {
      formData.append('description', photoData.description);
    }
    if (photoData.vente_id) {
      formData.append('vente_id', photoData.vente_id.toString());
    }
    if (photoData.rendez_vous_id) {
      formData.append('rendez_vous_id', photoData.rendez_vous_id.toString());
    }
    if (photoData.is_public !== undefined) {
      formData.append('is_public', photoData.is_public ? '1' : '0');
    }

    const { data } = await axios.post(`/clients/${clientId}/photos`, formData, { // CORRIGÉ
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Supprimer une photo
   */
  async deletePhoto(clientId: number, photoId: number): Promise<ApiResponse<void>> {
    const { data } = await axios.delete(`/clients/${clientId}/photos/${photoId}`); // CORRIGÉ
    return data;
  },

  /**
   * Recherche rapide de clients (pour autocomplete)
   */
  async searchClients(search: string): Promise<ApiResponse<Client[]>> {
    const { data } = await axios.get('/clients/search', {
      params: { search }
    });
    return data;
  },
};