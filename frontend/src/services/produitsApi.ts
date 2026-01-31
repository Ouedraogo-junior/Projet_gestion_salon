// src/services/produitApi.ts
import { tokenStorage } from '@/utils/tokenStorage';

const API_BASE_URL = 'http://localhost:8000/api';

class ProduitsApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = tokenStorage.getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: 'Erreur serveur' 
        }));
        throw new Error(error.message || `Erreur ${response.status}`);
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
    // Liste avec filtres (ajout du support with_attributs et with_produits)
    getAll: (params: any = {}) => 
      this.request(`/categories?${new URLSearchParams(params)}`),
    
    // Méthode index (alias de getAll pour compatibilité)
    index: (params: any = {}) => this.categories.getAll(params),
    
    // Détails d'une catégorie - AJOUTÉ
    show: (id: number) => 
      this.request(`/categories/${id}?with_attributs=1&with_produits=1`),
    
    create: (data: any) => 
      this.request('/categories', { 
        method: 'POST', 
        body: JSON.stringify(data) 
      }),
    
    update: (id: number, data: any) => 
      this.request(`/categories/${id}`, { 
        method: 'PUT', 
        body: JSON.stringify(data) 
      }),
    
    delete: (id: number) => 
      this.request(`/categories/${id}`, { method: 'DELETE' }),
    
    toggleActive: (id: number) => 
      this.request(`/categories/${id}/toggle-active`, { method: 'POST' }),
    
    // Obtenir les attributs d'une catégorie
    getAttributs: (id: number) => 
      this.request(`/categories/${id}/attributs`),
    
    // Associer un attribut à une catégorie
    associerAttribut: (categorieId: number, data: any) => 
      this.request(`/categories/${categorieId}/attributs`, { 
        method: 'POST', 
        body: JSON.stringify(data) 
      }),
    
    // Dissocier un attribut d'une catégorie - AJOUTÉ
    dissocierAttribut: (categorieId: number, attributId: number) => 
      this.request(`/categories/${categorieId}/attributs`, { 
        method: 'DELETE',
        body: JSON.stringify({ attribut_id: attributId })
      }),
  };

  // ========================================
  // ATTRIBUTS
  // ========================================
  attributs = {
    // Liste avec filtres (ajout du support with_categories)
    getAll: (params: any = {}) => 
      this.request(`/attributs?${new URLSearchParams(params)}`),
    
    // Méthode index (alias de getAll pour compatibilité)
    index: (params: any = {}) => this.attributs.getAll(params),
    
    // Détails d'un attribut - AJOUTÉ
    show: (id: number) => 
      this.request(`/attributs/${id}?with_categories=1`),
    
    create: (data: any) => 
      this.request('/attributs', { 
        method: 'POST', 
        body: JSON.stringify(data) 
      }),
    
    update: (id: number, data: any) => 
      this.request(`/attributs/${id}`, { 
        method: 'PUT', 
        body: JSON.stringify(data) 
      }),
    
    delete: (id: number) => 
      this.request(`/attributs/${id}`, { method: 'DELETE' }),
    
    // Ajouter une valeur possible
    ajouterValeur: (id: number, data: any) => 
      this.request(`/attributs/${id}/valeurs`, { 
        method: 'POST', 
        body: JSON.stringify(data) 
      }),
    
    ajouterValeurPossible: (id: number, data: any) => 
      this.attributs.ajouterValeur(id, data),
    
    // Supprimer une valeur possible
    supprimerValeur: (id: number, data: any) => 
      this.request(`/attributs/${id}/valeurs`, { 
        method: 'DELETE', 
        body: JSON.stringify(data) 
      }),
    
    supprimerValeurPossible: (id: number, data: any) => 
      this.attributs.supprimerValeur(id, data),
  };

  // ========================================
  // PRODUITS
  // ========================================
  produits = {
    // Liste avec filtres
    getAll: (params: any = {}) => 
      this.request(`/produits?${new URLSearchParams(params)}`),
    
    // Méthode index (alias de getAll pour compatibilité)
    index: (params: any = {}) => this.produits.getAll(params),
    
    // Détails complets d'un produit - AJOUTÉ (MÉTHODE MANQUANTE)
    show: (id: number) => 
      this.request(`/produits/${id}`),
    
    create: (data: any) => 
      this.request('/produits', { 
        method: 'POST', 
        body: JSON.stringify(data) 
      }),
    
    update: (id: number, data: any) => 
      this.request(`/produits/${id}`, { 
        method: 'PUT', 
        body: JSON.stringify(data) 
      }),
    
    delete: (id: number) => 
      this.request(`/produits/${id}`, { method: 'DELETE' }),
    
    toggleActive: (id: number) => 
      this.request(`/produits/${id}/toggle-active`, { method: 'POST' }),
    
    // Obtenir les produits en alerte
    getAlertes: () => 
      this.request('/produits/alertes'),
    
    alertes: () => this.produits.getAlertes(),
    
    // Historique des mouvements
    getMouvements: (id: number) => 
      this.request(`/produits/${id}/mouvements`),
    
    mouvements: (id: number) => this.produits.getMouvements(id),

    // Upload photo produit
    uploadPhoto: async (id: number, file: File) => {
      const token = tokenStorage.getToken();
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const formData = new FormData();
      formData.append('photo', file);
      
      try {
        const response = await fetch(`${API_BASE_URL}/produits/${id}/photo`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
            // NE PAS mettre Content-Type, FormData le gère automatiquement
          },
          body: formData
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ 
            message: 'Erreur serveur' 
          }));
          throw new Error(error.message || `Erreur ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Upload Error:', error);
        throw error;
      }
    },
    
    // Supprimer photo produit
    deletePhoto: (id: number) =>
      this.request(`/produits/${id}/photo`, { method: 'DELETE' }),
  };

  // ========================================
  // MOUVEMENTS STOCK
  // ========================================
  mouvements = {
    getAll: (params: any = {}) => 
      this.request(`/mouvements-stock?${new URLSearchParams(params)}`),
    
    index: (params: any = {}) => this.mouvements.getAll(params),
    
    show: (id: number) => 
      this.request(`/mouvements-stock/${id}`),
    
    create: (data: any) => 
      this.request('/mouvements-stock', { 
        method: 'POST', 
        body: JSON.stringify(data) 
      }),
    
    ajuster: (data: any) => 
      this.request('/mouvements-stock/ajuster', { 
        method: 'POST', 
        body: JSON.stringify(data) 
      }),
    
    export: () => 
      this.request('/mouvements-stock/export'),
  };

  // Alias pour compatibilité
  mouvementsStock = this.mouvements;

  // ========================================
  // TRANSFERTS STOCK
  // ========================================
  transferts = {
    getAll: (params: any = {}) => 
      this.request(`/transferts?${new URLSearchParams(params)}`),
    
    index: (params: any = {}) => this.transferts.getAll(params),
    
    show: (id: number) => 
      this.request(`/transferts/${id}`),
    
    create: (data: any) => 
      this.request('/transferts', { 
        method: 'POST', 
        body: JSON.stringify(data) 
      }),
    
    delete: (id: number) => 
      this.request(`/transferts/${id}`, { method: 'DELETE' }),
    
    valider: (id: number) => 
      this.request(`/transferts/${id}/valider`, { method: 'POST' }),
    
    getEnAttente: () => 
      this.request('/transferts/en-attente'),
    
    enAttente: () => this.transferts.getEnAttente(),
    
    validerEnMasse: (data: any) => 
      this.request('/transferts/valider-masse', { 
        method: 'POST', 
        body: JSON.stringify(data) 
      }),
  };
}

export const produitsApi = new ProduitsApiService();