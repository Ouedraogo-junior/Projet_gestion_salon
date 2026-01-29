// src/hooks/useDashboard.ts
import { useState, useEffect } from 'react';
import { dashboardApi } from '@/services/dashboardApi';

interface DashboardData {
  stats: {
    ventesJour: number;
    clientsJour: number;
    stockBas: number;
  };
  ventesSemaine: Array<{ jour: string; ventes: number }>;
  topProduits: Array<{ nom: string; ventes: number }>;
  activitesRecentes: Array<{
    id: number;
    date: string;
    total: number;
    methodePaiement: string;
  }>;
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData>({
    stats: { ventesJour: 0, clientsJour: 0, stockBas: 0 },
    ventesSemaine: [],
    topProduits: [],
    activitesRecentes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [stats, ventesSemaine, topProduits, activitesRecentes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getVentesSemaine(),
        dashboardApi.getTopProduits(),
        dashboardApi.getActivitesRecentes(),
      ]);

      setData({
        stats: {
          ventesJour: stats.ventes_jour,
          clientsJour: stats.clients_jour,
          stockBas: stats.stock_bas,
        },
        ventesSemaine,
        topProduits,
        activitesRecentes,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return { data, loading, error, refetch: fetchDashboardData };
}