import axios from '../lib/axios';
import type {
  Realisation,
  CreateRealisationDTO,
  UpdateRealisationDTO,
  AddMediasDTO,
  RealisationFilters,
  PaginatedRealisations,
  MediaRealisation,
} from '../types/realisation.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T;
}

export const realisationApi = {
  async getRealisations(filters?: RealisationFilters): Promise<PaginatedResponse<PaginatedRealisations>> {
    const clean: Record<string, any> = {};
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== '' && v !== undefined && v !== null) clean[k] = v;
      });
    }
    const { data } = await axios.get('/realisations', { params: clean });
    return data;
  },

  async getRealisation(id: number): Promise<ApiResponse<Realisation>> {
    const { data } = await axios.get(`/realisations/${id}`);
    return data;
  },

  async createRealisation(dto: CreateRealisationDTO): Promise<ApiResponse<Realisation>> {
    const formData = new FormData();
    if (dto.nom_coiffure)     formData.append('nom_coiffure', dto.nom_coiffure);
    if (dto.montant_coiffure !== undefined)
      formData.append('montant_coiffure', dto.montant_coiffure.toString());
    if (dto.description)      formData.append('description', dto.description);
    if (dto.date_prise)       formData.append('date_prise', dto.date_prise);
    if (dto.client_id)        formData.append('client_id', dto.client_id.toString());
    formData.append('is_public', dto.is_public ? '1' : '0');

    dto.medias.forEach((file, i) => {
      formData.append(`medias[${i}]`, file);
      formData.append(`types_photo[${i}]`, dto.types_photo[i]);
      formData.append(`types_media[${i}]`, dto.types_media[i]);
    });

    const { data } = await axios.post('/realisations', formData);
    return data;
  },

  async updateRealisation(id: number, dto: UpdateRealisationDTO): Promise<ApiResponse<Realisation>> {
    const { data } = await axios.put(`/realisations/${id}`, dto);
    return data;
  },

  async addMedias(id: number, dto: AddMediasDTO): Promise<ApiResponse<MediaRealisation[]>> {
    const formData = new FormData();
    dto.medias.forEach((file, i) => {
      formData.append(`medias[${i}]`, file);
      formData.append(`types_photo[${i}]`, dto.types_photo[i]);
      formData.append(`types_media[${i}]`, dto.types_media[i]);
    });
    const { data } = await axios.post(`/realisations/${id}/medias`, formData);
    return data;
  },

  async deleteMedia(realisationId: number, mediaId: number): Promise<ApiResponse<void>> {
    const { data } = await axios.delete(`/realisations/${realisationId}/medias/${mediaId}`);
    return data;
  },

  async deleteRealisation(id: number): Promise<ApiResponse<void>> {
    const { data } = await axios.delete(`/realisations/${id}`);
    return data;
  },

  async togglePublic(id: number): Promise<ApiResponse<{ is_public: boolean }>> {
    const { data } = await axios.patch(`/realisations/${id}/toggle-public`);
    return data;
  },
};