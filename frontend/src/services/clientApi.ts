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
  async getClients(filters?: ClientFilters): Promise<PaginatedResponse<Client>> {
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

  async getClient(id: number): Promise<ApiResponse<{ client: Client; statistiques: ClientStats }>> {
    const { data } = await axios.get(`/clients/${id}`);
    return data;
  },

  async createClient(clientData: CreateClientDTO): Promise<ApiResponse<Client>> {
    const { data } = await axios.post('/clients', clientData);
    return data;
  },

  async updateClient(id: number, clientData: UpdateClientDTO): Promise<ApiResponse<Client>> {
    const { data } = await axios.put(`/clients/${id}`, clientData);
    return data;
  },

  async deleteClient(id: number): Promise<ApiResponse<void>> {
    const { data } = await axios.delete(`/clients/${id}`);
    return data;
  },

  async uploadPhoto(clientId: number, photoData: UploadPhotoDTO): Promise<ApiResponse<PhotoClient>> {
    const formData = new FormData();
    formData.append('media', photoData.media);
    formData.append('type_photo', photoData.type_photo);
    formData.append('type_media', photoData.type_media);
    if (photoData.description)     formData.append('description', photoData.description);
    if (photoData.nom_coiffure)    formData.append('nom_coiffure', photoData.nom_coiffure);
    if (photoData.montant_coiffure !== undefined)
      formData.append('montant_coiffure', photoData.montant_coiffure.toString());
    if (photoData.vente_id)        formData.append('vente_id', photoData.vente_id.toString());
    if (photoData.rendez_vous_id)  formData.append('rendez_vous_id', photoData.rendez_vous_id.toString());
    if (photoData.is_public !== undefined)
      formData.append('is_public', photoData.is_public ? '1' : '0');

    // ← Pas de headers, Axios gère le multipart/form-data + boundary automatiquement
    const { data } = await axios.post(`/clients/${clientId}/photos`, formData);
    return data;
  },

  async deletePhoto(clientId: number, photoId: number): Promise<ApiResponse<void>> {
    const { data } = await axios.delete(`/clients/${clientId}/photos/${photoId}`);
    return data;
  },

  async searchClients(search: string): Promise<ApiResponse<Client[]>> {
    const { data } = await axios.get('/clients/search', { params: { search } });
    return data;
  },
};