// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Temps avant que les données deviennent "stale" (obsolètes)
      staleTime: 1000 * 60 * 5, // 5 minutes
      
      // Temps de cache des données
      gcTime: 1000 * 60 * 10, // 10 minutes (anciennement cacheTime)
      
      // Retry automatique en cas d'erreur
      retry: 1,
      
      // Refetch automatique
      refetchOnWindowFocus: false, // Pas de refetch au focus de la fenêtre
      refetchOnReconnect: true,    // Refetch à la reconnexion
    },
    mutations: {
      // Retry pour les mutations
      retry: 0,
    },
  },
});