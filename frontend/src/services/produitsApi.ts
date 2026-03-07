// src/services/produitApi.ts
import { tokenStorage } from '@/utils/tokenStorage';
import type {
  ProduitFilters,
  TransfertFilters,
  MouvementFilters,
  CategorieFilters,
  AttributFilters,
  ProduitFormData,
  TransfertFormData,
  CategorieFormData,
  AttributFormData,
} from '@/types/produit.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// ============================================================
// HELPERS
// ============================================================

const toStringParams = (params: Record<string, any>): Record<string, string> => {
  const result: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      result[key] = String(value);
    }
  });
  return result;
};

// ============================================================
// SERVICE
// ============================================================

class ProduitsApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = tokenStorage.getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
        const err: any = new Error(error.message || `Erreur ${response.status}`);
        err.response = { data: error, status: response.status };
        throw err;
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ========================================
  // CATÉGORIES
  // ========================================

  categories = {
    getAll: (params: CategorieFilters = {}) =>
      this.request(`/categories?${new URLSearchParams(toStringParams(params))}`),

    index: (params: CategorieFilters = {}) => this.categories.getAll(params),

    show: (id: number) =>
      this.request(`/categories/${id}?with_attributs=1&with_produits=1`),

    create: (data: CategorieFormData) =>
      this.request('/categories', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: number, data: Partial<CategorieFormData>) =>
      this.request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: number) =>
      this.request(`/categories/${id}`, { method: 'DELETE' }),

    toggleActive: (id: number) =>
      this.request(`/categories/${id}/toggle-active`, { method: 'POST' }),

    getAttributs: (id: number) =>
      this.request(`/categories/${id}/attributs`),

    associerAttribut: (categorieId: number, data: any) =>
      this.request(`/categories/${categorieId}/attributs`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    dissocierAttribut: (categorieId: number, attributId: number) =>
      this.request(`/categories/${categorieId}/attributs`, {
        method: 'DELETE',
        body: JSON.stringify({ attribut_id: attributId }),
      }),
  };

  // ========================================
  // ATTRIBUTS
  // ========================================

  attributs = {
    getAll: (params: AttributFilters = {}) =>
      this.request(`/attributs?${new URLSearchParams(toStringParams(params))}`),

    index: (params: AttributFilters = {}) => this.attributs.getAll(params),

    show: (id: number) =>
      this.request(`/attributs/${id}?with_categories=1`),

    create: (data: AttributFormData) =>
      this.request('/attributs', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: number, data: Partial<AttributFormData>) =>
      this.request(`/attributs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: number) =>
      this.request(`/attributs/${id}`, { method: 'DELETE' }),

    ajouterValeur: (id: number, data: any) =>
      this.request(`/attributs/${id}/valeurs`, { method: 'POST', body: JSON.stringify(data) }),

    ajouterValeurPossible: (id: number, data: any) => this.attributs.ajouterValeur(id, data),

    supprimerValeur: (id: number, data: any) =>
      this.request(`/attributs/${id}/valeurs`, { method: 'DELETE', body: JSON.stringify(data) }),

    supprimerValeurPossible: (id: number, data: any) => this.attributs.supprimerValeur(id, data),
  };

  // ========================================
  // PRODUITS
  // ========================================

  produits = {
    getAll: (params: ProduitFilters = {}) =>
      this.request(`/produits?${new URLSearchParams(toStringParams(params))}`),

    index: (params: ProduitFilters = {}) => this.produits.getAll(params),

    show: (id: number) =>
      this.request(`/produits/${id}`),

    create: (data: ProduitFormData) =>
      this.request('/produits', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: number, data: Partial<ProduitFormData>) =>
      this.request(`/produits/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: number) =>
      this.request(`/produits/${id}`, { method: 'DELETE' }),

    toggleActive: (id: number) =>
      this.request(`/produits/${id}/toggle-active`, { method: 'POST' }),

    // Alertes
    getAlertes: (params: { type?: 'vente' | 'utilisation' | 'reserve' | 'all' } = {}) =>
      this.request(`/produits/alertes?${new URLSearchParams(toStringParams(params))}`),

    alertes: (params: any = {}) => this.produits.getAlertes(params),

    // Mouvements d'un produit (toutes variantes ou variante spécifique)
    getMouvements: (id: number, params: MouvementFilters = {}) =>
      this.request(`/produits/${id}/mouvements?${new URLSearchParams(toStringParams(params))}`),

    mouvements: (id: number, params: MouvementFilters = {}) =>
      this.produits.getMouvements(id, params),

    // Photo
    uploadPhoto: async (id: number, file: File) => {
      const token = tokenStorage.getToken();
      if (!token) throw new Error('Token d\'authentification manquant');

      const formData = new FormData();
      formData.append('photo', file);

      try {
        const response = await fetch(`${API_BASE_URL}/produits/${id}/photo`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
          throw new Error(error.message || `Erreur ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Upload Error:', error);
        throw error;
      }
    },

    deletePhoto: (id: number) =>
      this.request(`/produits/${id}/photo`, { method: 'DELETE' }),

    // Validation
    enAttente: (params: any = {}) =>
      this.request(`/produits/en-attente?${new URLSearchParams(toStringParams(params))}`),

    valider: (id: number, varianteId?: number) =>
      this.request(`/produits/${id}/valider`, {
        method: 'PATCH',
        body: JSON.stringify(varianteId ? { variante_id: varianteId } : {}),
      }),

    rejeter: (id: number, motif: string, varianteId?: number) =>
      this.request(`/produits/${id}/rejeter`, {
        method: 'PATCH',
        body: JSON.stringify({ motif, ...(varianteId ? { variante_id: varianteId } : {}) }),
      }),

    modifierEtValider: (id: number, data: Partial<ProduitFormData>) =>
      this.request(`/produits/${id}/modifier-valider`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  };

  // ========================================
  // VARIANTES (endpoints directs)
  // ========================================

  variantes = {
    show: (varianteId: number) =>
      this.request(`/variantes/${varianteId}`),

    update: (varianteId: number, data: any) =>
      this.request(`/variantes/${varianteId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (varianteId: number) =>
      this.request(`/variantes/${varianteId}`, { method: 'DELETE' }),

    toggleActive: (varianteId: number) =>
      this.request(`/variantes/${varianteId}/toggle-active`, { method: 'POST' }),

    getMouvements: (varianteId: number, params: MouvementFilters = {}) =>
      this.request(`/variantes/${varianteId}/mouvements?${new URLSearchParams(toStringParams(params))}`),

    getTransferts: (varianteId: number, params: TransfertFilters = {}) =>
      this.request(`/variantes/${varianteId}/transferts?${new URLSearchParams(toStringParams(params))}`),
  };

  // ========================================
  // MOUVEMENTS STOCK
  // ========================================

  mouvements = {
    getAll: (params: MouvementFilters = {}) =>
      this.request(`/mouvements-stock?${new URLSearchParams(toStringParams(params))}`),

    index: (params: MouvementFilters = {}) => this.mouvements.getAll(params),

    show: (id: number) =>
      this.request(`/mouvements-stock/${id}`),

    create: (data: any) =>
      this.request('/mouvements-stock', { method: 'POST', body: JSON.stringify(data) }),

    ajuster: (data: any) =>
      this.request('/mouvements-stock/ajuster', { method: 'POST', body: JSON.stringify(data) }),

    export: () =>
      this.request('/mouvements-stock/export'),
  };

  mouvementsStock = this.mouvements;

  // ========================================
  // TRANSFERTS STOCK
  // ========================================

  transferts = {
    getAll: (params: TransfertFilters = {}) =>
      this.request(`/transferts?${new URLSearchParams(toStringParams(params))}`),

    index: (params: TransfertFilters = {}) => this.transferts.getAll(params),

    show: (id: number) =>
      this.request(`/transferts/${id}`),

    create: (data: TransfertFormData) =>
      this.request('/transferts', { method: 'POST', body: JSON.stringify(data) }),

    delete: (id: number) =>
      this.request(`/transferts/${id}`, { method: 'DELETE' }),

    valider: (id: number) =>
      this.request(`/transferts/${id}/valider`, { method: 'POST' }),

    getEnAttente: () =>
      this.request('/transferts/en-attente'),

    enAttente: () => this.transferts.getEnAttente(),

    validerEnMasse: (data: { ids: number[] }) =>
      this.request('/transferts/valider-masse', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };
}

export const produitsApi = new ProduitsApiService();