// src/services/dashboardApi.ts
import { tokenStorage } from '@/utils/tokenStorage';

const API_BASE_URL = 'http://localhost:8000/api';

interface DashboardStats {
  ventes_jour: number;
  clients_jour: number;
  stock_bas: number;
}

interface VentesSemaine {
  jour: string;
  ventes: number;
}

interface TopProduit {
  nom: string;
  ventes: number;
}

interface ActiviteRecente {
  id: number;
  date: string;
  total: number;
  methodePaiement: string;
}

class DashboardApiService {
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

  // Statistiques globales du jour
  async getStats(): Promise<DashboardStats> {
    const today = new Date().toISOString().split('T')[0];
    
    // Récupérer les stats via l'endpoint /ventes/stats/summary
    const statsResponse = await this.request(`/ventes/stats/summary?date_debut=${today}&date_fin=${today}`);
    console.log('📊 Stats Response:', statsResponse);
    
    // Récupérer les ventes du jour pour compter les clients uniques
    const ventesResponse = await this.request(`/ventes?date_debut=${today}&date_fin=${today}&per_page=1000`);
    console.log('🛒 Ventes Response:', ventesResponse);
    
    // Compter les clients uniques et calculer le CA
    const clientsUniques = new Set();
    const ventes = ventesResponse.data?.data || [];
    let caTotal = 0;
    
    ventes.forEach((vente: any) => {
      // Compter les clients
      if (vente.client_id) {
        clientsUniques.add(vente.client_id);
      } else if (vente.client_telephone) {
        clientsUniques.add(vente.client_telephone);
      }
      
      // Calculer le CA total - IMPORTANT: convertir string en number
      const montant = typeof vente.montant_total_ttc === 'string' 
        ? parseFloat(vente.montant_total_ttc) 
        : vente.montant_total_ttc;
      caTotal += montant || 0;
    });
    
    // Récupérer les produits en alerte
    const alertesResponse = await this.request('/produits/alertes');
    console.log('⚠️ Alertes Response:', alertesResponse);
    
    // Utiliser les stats de l'API si disponibles, sinon calculer manuellement
    const ventesJour = statsResponse.data?.ca_total > 0 
      ? statsResponse.data.ca_total 
      : Math.round(caTotal);
    
    const result = {
      ventes_jour: ventesJour,
      clients_jour: clientsUniques.size || ventes.length || 0,
      stock_bas: (alertesResponse.data || []).length || 0,
    };
    
    console.log('✅ Dashboard Stats:', result);
    
    return result;
  }

  // Ventes des 7 derniers jours
  async getVentesSemaine(): Promise<VentesSemaine[]> {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);
    
    const dateDebut = weekAgo.toISOString().split('T')[0];
    const dateFin = today.toISOString().split('T')[0];
    
    const response = await this.request(`/ventes?date_debut=${dateDebut}&date_fin=${dateFin}&per_page=1000`);
    
    // Grouper par jour
    const ventesParJour: { [key: string]: number } = {};
    const jours = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    
    // Initialiser tous les jours à 0
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekAgo);
      date.setDate(weekAgo.getDate() + i);
      const jourNom = jours[date.getDay()];
      ventesParJour[jourNom] = 0;
    }
    
    // Calculer les totaux
    response.data?.data?.forEach((vente: any) => {
      const venteDate = new Date(vente.date_vente);
      const jourNom = jours[venteDate.getDay()];
      ventesParJour[jourNom] += parseFloat(vente.montant_total_ttc);
    });
    
    // Retourner dans l'ordre des 7 derniers jours
    const result: VentesSemaine[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekAgo);
      date.setDate(weekAgo.getDate() + i);
      const jourNom = jours[date.getDay()];
      result.push({
        jour: jourNom,
        ventes: Math.round(ventesParJour[jourNom] || 0),
      });
    }
    
    return result;
  }

  // Top 5 produits
  async getTopProduits(): Promise<TopProduit[]> {
    const response = await this.request('/produits?per_page=100');
    
    // Simuler les ventes pour l'instant (à adapter selon vos données réelles)
    const produits = response.data?.data || [];
    const topProduits = produits
      .slice(0, 5)
      .map((p: any) => ({
        nom: p.nom,
        ventes: Math.floor(Math.random() * 50) + 10, // À remplacer par vraies données
      }));
    
    return topProduits;
  }

  // Activités récentes (dernières ventes)
  async getActivitesRecentes(): Promise<ActiviteRecente[]> {
    const response = await this.request('/ventes?per_page=5&sort_by=date_vente&sort_order=desc');
    
    return response.data?.data?.map((vente: any) => {
      const montant = typeof vente.montant_total_ttc === 'string' 
        ? parseFloat(vente.montant_total_ttc) 
        : vente.montant_total_ttc;
        
      return {
        id: vente.id,
        date: new Date(vente.date_vente).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        total: montant || 0,
        methodePaiement: this.formatModePaiement(vente.mode_paiement),
      };
    }) || [];
  }

  private formatModePaiement(mode: string): string {
    const modes: { [key: string]: string } = {
      'especes': 'Espèces',
      'orange_money': 'Orange Money',
      'moov_money': 'Moov Money',
      'carte': 'Carte bancaire',
      'mixte': 'Mixte',
    };
    return modes[mode] || mode;
  }
}

export const dashboardApi = new DashboardApiService();