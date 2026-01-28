// services/venteApi.ts
import axios from '../lib/axios';
import type {
  Vente,
  CreateVenteDTO,
  VenteFilters,
  VenteStats,
  StockCheckResult,
  PointsCalculation,
} from '../types/vente.types';

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

export const venteApi = {
  /**
   * Récupérer la liste des ventes avec filtres
   */
  async getVentes(filters?: VenteFilters): Promise<PaginatedResponse<Vente>> {
    // Nettoyer les filtres pour enlever les valeurs vides
    const cleanFilters: Record<string, any> = {};
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        // Ne garder que les valeurs non vides et non undefined
        if (value !== '' && value !== undefined && value !== null) {
          cleanFilters[key] = value;
        }
      });
    }
    
    const { data } = await axios.get('/ventes', { params: cleanFilters });
    return data;
  },

  /**
   * Récupérer une vente par ID
   */
  async getVente(id: number): Promise<ApiResponse<Vente>> {
    const { data } = await axios.get(`/ventes/${id}`);
    return data;
  },

  /**
   * Créer une nouvelle vente
   */
  async createVente(venteData: CreateVenteDTO): Promise<ApiResponse<Vente>> {
    const { data } = await axios.post('/ventes', venteData);
    return data;
  },

  /**
   * Mettre à jour les notes d'une vente
   */
  async updateVente(id: number, notes: string): Promise<ApiResponse<Vente>> {
    const { data } = await axios.put(`/ventes/${id}`, { notes });
    return data;
  },

  /**
   * Annuler une vente (admin uniquement)
   */
  async cancelVente(id: number): Promise<ApiResponse<Vente>> {
    const { data } = await axios.delete(`/ventes/${id}/cancel`);
    return data;
  },

  /**
   * Générer le reçu PDF
   */
  async generateReceipt(id: number): Promise<Blob> {
    const { data } = await axios.get(`/ventes/${id}/receipt`, {
      responseType: 'blob',
    });
    return data;
  },

  /**
   * Télécharger le reçu PDF
   */
  async downloadReceipt(id: number, numeroFacture: string): Promise<void> {
    const blob = await this.generateReceipt(id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facture_${numeroFacture}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Récupérer les statistiques
   */
  async getStats(dateDebut?: string, dateFin?: string): Promise<ApiResponse<VenteStats>> {
    const params: Record<string, string> = {};
    if (dateDebut) params.date_debut = dateDebut;
    if (dateFin) params.date_fin = dateFin;
    
    const { data } = await axios.get('/ventes/stats/summary', { params });
    return data;
  },

  /**
   * Vérifier la disponibilité du stock
   */
  async checkStock(
    produitId: number,
    quantite: number,
    sourceStock: 'vente' | 'utilisation'
  ): Promise<ApiResponse<StockCheckResult>> {
    const { data } = await axios.post('/ventes/check-stock', {
      produit_id: produitId,
      quantite,
      source_stock: sourceStock,
    });
    return data;
  },

  /**
   * Calculer la réduction possible avec les points
   */
  async calculatePointsReduction(
    clientId: number,
    montantVente: number
  ): Promise<ApiResponse<PointsCalculation>> {
    const { data } = await axios.post('/ventes/calculate-points', {
      client_id: clientId,
      montant_vente: montantVente,
    });
    return data;
  },
};