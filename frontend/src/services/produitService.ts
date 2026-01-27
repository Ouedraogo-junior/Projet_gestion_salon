// src/services/produits.service.ts
import api from '@/lib/axios';
import type {
  Categorie,
  Attribut,
  Produit,
  MouvementStock,
  TransfertStock,
  CategorieFormData,
  AttributFormData,
  ProduitFormData,
  TransfertFormData,
  CategorieFilters,
  AttributFilters,
  ProduitFilters,
  TransfertFilters,
  MouvementFilters,
  ApiResponse,
  PaginatedResponse,
  AlertesStats,
  TransfertStats
} from '@/types/produit.types';

// ========================================
// CATEGORIES
// ========================================
export const categoriesService = {
  getAll: async (filters?: CategorieFilters) => {
    const { data } = await api.get<ApiResponse<Categorie[]>>('/categories', { params: filters });
    return data;
  },

  getById: async (id: number) => {
    const { data } = await api.get<ApiResponse<Categorie>>(`/categories/${id}`);
    return data;
  },

  create: async (formData: CategorieFormData) => {
    const { data } = await api.post<ApiResponse<Categorie>>('/categories', formData);
    return data;
  },

  update: async (id: number, formData: CategorieFormData) => {
    const { data } = await api.put<ApiResponse<Categorie>>(`/categories/${id}`, formData);
    return data;
  },

  delete: async (id: number) => {
    const { data } = await api.delete<ApiResponse<null>>(`/categories/${id}`);
    return data;
  },

  toggleActive: async (id: number) => {
    const { data } = await api.post<ApiResponse<Categorie>>(`/categories/${id}/toggle-active`);
    return data;
  },

  getAttributs: async (id: number) => {
    const { data } = await api.get<ApiResponse<Attribut[]>>(`/categories/${id}/attributs`);
    return data;
  },

  associerAttribut: async (id: number, attribut_id: number, obligatoire: boolean = false, ordre: number = 0) => {
    const { data } = await api.post<ApiResponse<Categorie>>(`/categories/${id}/attributs`, {
      attribut_id,
      obligatoire,
      ordre
    });
    return data;
  },

  dissocierAttribut: async (id: number, attribut_id: number) => {
    const { data } = await api.delete<ApiResponse<Categorie>>(`/categories/${id}/attributs`, {
      data: { attribut_id }
    });
    return data;
  }
};

// ========================================
// ATTRIBUTS
// ========================================
export const attributsService = {
  getAll: async (filters?: AttributFilters) => {
    const { data } = await api.get<ApiResponse<Attribut[]>>('/attributs', { params: filters });
    return data;
  },

  getById: async (id: number) => {
    const { data } = await api.get<ApiResponse<Attribut>>(`/attributs/${id}`);
    return data;
  },

  create: async (formData: AttributFormData) => {
    const { data } = await api.post<ApiResponse<Attribut>>('/attributs', formData);
    return data;
  },

  update: async (id: number, formData: AttributFormData) => {
    const { data } = await api.put<ApiResponse<Attribut>>(`/attributs/${id}`, formData);
    return data;
  },

  delete: async (id: number) => {
    const { data } = await api.delete<ApiResponse<null>>(`/attributs/${id}`);
    return data;
  },

  ajouterValeurPossible: async (id: number, valeur: string) => {
    const { data } = await api.post<ApiResponse<Attribut>>(`/attributs/${id}/valeurs`, { valeur });
    return data;
  },

  supprimerValeurPossible: async (id: number, valeur: string) => {
    const { data } = await api.delete<ApiResponse<Attribut>>(`/attributs/${id}/valeurs`, {
      data: { valeur }
    });
    return data;
  }
};

// ========================================
// PRODUITS
// ========================================
export const produitsService = {
  getAll: async (filters?: ProduitFilters) => {
    const { data } = await api.get<PaginatedResponse<Produit>>('/produits', { params: filters });
    return data;
  },

  getById: async (id: number) => {
    const { data } = await api.get<ApiResponse<Produit>>(`/produits/${id}`);
    return data;
  },

  create: async (formData: ProduitFormData) => {
    const { data } = await api.post<ApiResponse<Produit>>('/produits', formData);
    return data;
  },

  update: async (id: number, formData: ProduitFormData) => {
    const { data } = await api.put<ApiResponse<Produit>>(`/produits/${id}`, formData);
    return data;
  },

  delete: async (id: number) => {
    const { data } = await api.delete<ApiResponse<null>>(`/produits/${id}`);
    return data;
  },

  toggleActive: async (id: number) => {
    const { data } = await api.post<ApiResponse<Produit>>(`/produits/${id}/toggle-active`);
    return data;
  },

  getAlertes: async (type: 'all' | 'vente' | 'utilisation' = 'all') => {
    const { data } = await api.get<ApiResponse<Produit[]> & { stats: AlertesStats }>('/produits/alertes', {
      params: { type }
    });
    return data;
  },

  getMouvements: async (id: number, filters?: MouvementFilters) => {
    const { data } = await api.get<PaginatedResponse<MouvementStock>>(`/produits/${id}/mouvements`, {
      params: filters
    });
    return data;
  }
};

// ========================================
// MOUVEMENTS STOCK
// ========================================
export const mouvementsStockService = {
  getAll: async (filters?: MouvementFilters) => {
    const { data } = await api.get<PaginatedResponse<MouvementStock>>('/mouvements-stock', { params: filters });
    return data;
  },

  getById: async (id: number) => {
    const { data } = await api.get<ApiResponse<MouvementStock>>(`/mouvements-stock/${id}`);
    return data;
  },

  create: async (mouvementData: {
    produit_id: number;
    type_stock: 'vente' | 'utilisation';
    type_mouvement: 'entree' | 'sortie' | 'ajustement' | 'inventaire';
    quantite: number;
    motif?: string;
  }) => {
    const { data } = await api.post<ApiResponse<MouvementStock>>('/mouvements-stock', mouvementData);
    return data;
  },

  ajuster: async (ajustementData: {
    produit_id: number;
    type_stock: 'vente' | 'utilisation';
    nouveau_stock: number;
    motif?: string;
  }) => {
    const { data } = await api.post<ApiResponse<MouvementStock>>('/mouvements-stock/ajuster', ajustementData);
    return data;
  },

  export: async (filters?: MouvementFilters) => {
    const { data } = await api.get('/mouvements-stock/export', {
      params: filters,
      responseType: 'blob'
    });
    return data;
  }
};

// ========================================
// TRANSFERTS STOCK
// ========================================
export const transfertsService = {
  getAll: async (filters?: TransfertFilters) => {
    const { data } = await api.get<PaginatedResponse<TransfertStock> & { stats?: TransfertStats }>('/transferts', {
      params: filters
    });
    return data;
  },

  getById: async (id: number) => {
    const { data } = await api.get<ApiResponse<TransfertStock>>(`/transferts/${id}`);
    return data;
  },

  create: async (formData: TransfertFormData) => {
    const { data } = await api.post<ApiResponse<TransfertStock>>('/transferts', formData);
    return data;
  },

  delete: async (id: number) => {
    const { data } = await api.delete<ApiResponse<null>>(`/transferts/${id}`);
    return data;
  },

  valider: async (id: number) => {
    const { data } = await api.post<ApiResponse<TransfertStock>>(`/transferts/${id}/valider`);
    return data;
  },

  getEnAttente: async () => {
    const { data } = await api.get<ApiResponse<TransfertStock[]> & { count: number }>('/transferts/en-attente');
    return data;
  },

  validerEnMasse: async (transfert_ids: number[]) => {
    const { data } = await api.post<ApiResponse<{ valides: number; errors: any[] }>>('/transferts/valider-masse', {
      transfert_ids
    });
    return data;
  }
};