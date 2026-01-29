// src/hooks/useRapports.ts

import { useQuery } from '@tanstack/react-query';
import { rapportApi } from '../services/rapportApi';
import type { PeriodeFilters } from '../types/rapport.types';

/**
 * Query keys pour React Query
 */
export const rapportKeys = {
  all: ['rapports'] as const,
  global: (filters: PeriodeFilters) => [...rapportKeys.all, 'global', filters] as const,
  ventes: (filters: PeriodeFilters) => [...rapportKeys.all, 'ventes', filters] as const,
  tresorerie: (filters: PeriodeFilters) => [...rapportKeys.all, 'tresorerie', filters] as const,
  comparaison: (filters: PeriodeFilters) => [...rapportKeys.all, 'comparaison', filters] as const,
};

/**
 * Hook pour le rapport global (CA, dépenses, bénéfices)
 * 
 * @param filters - Filtres de période
 * @param options - Options React Query
 * 
 * @example
 * const { data, isLoading, error } = useRapportGlobal({
 *   type: 'mois',
 *   date_debut: '2026-01-01',
 *   date_fin: '2026-01-31',
 * });
 */
export const useRapportGlobal = (filters: PeriodeFilters, options?: any) => {
  return useQuery({
    queryKey: rapportKeys.global(filters),
    queryFn: async () => {
      const response = await rapportApi.getGlobal(filters);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

/**
 * Hook pour le détail des ventes
 * Inclut : ventes par jour, top prestations/produits, modes paiement
 * 
 * @param filters - Filtres de période
 * @param options - Options React Query
 */
export const useVentesDetail = (filters: PeriodeFilters, options?: any) => {
  return useQuery({
    queryKey: rapportKeys.ventes(filters),
    queryFn: async () => {
      const response = await rapportApi.getVentesDetail(filters);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

/**
 * Hook pour la trésorerie (cash flow)
 * 
 * @param filters - Filtres de période
 * @param options - Options React Query
 */
export const useTresorerie = (filters: PeriodeFilters, options?: any) => {
  return useQuery({
    queryKey: rapportKeys.tresorerie(filters),
    queryFn: async () => {
      const response = await rapportApi.getTresorerie(filters);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

/**
 * Hook pour la comparaison avec période précédente
 * 
 * @param filters - Filtres de période actuelle
 * @param options - Options React Query
 */
export const useComparaisonPeriodes = (filters: PeriodeFilters, options?: any) => {
  return useQuery({
    queryKey: rapportKeys.comparaison(filters),
    queryFn: async () => {
      const response = await rapportApi.getComparaison(filters);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

/**
 * Hook combiné pour récupérer tous les rapports d'un coup
 * Utile pour un dashboard complet
 * 
 * @param filters - Filtres de période
 * 
 * @example
 * const { global, ventes, tresorerie, comparaison, isLoading } = useRapportsComplets({
 *   type: 'mois',
 *   date_debut: '2026-01-01',
 *   date_fin: '2026-01-31',
 * });
 */
export const useRapportsComplets = (filters: PeriodeFilters) => {
  const global = useRapportGlobal(filters);
  const ventes = useVentesDetail(filters);
  const tresorerie = useTresorerie(filters);
  const comparaison = useComparaisonPeriodes(filters);

  return {
    global: {
      data: global.data,
      isLoading: global.isLoading,
      error: global.error,
    },
    ventes: {
      data: ventes.data,
      isLoading: ventes.isLoading,
      error: ventes.error,
    },
    tresorerie: {
      data: tresorerie.data,
      isLoading: tresorerie.isLoading,
      error: tresorerie.error,
    },
    comparaison: {
      data: comparaison.data,
      isLoading: comparaison.isLoading,
      error: comparaison.error,
    },
    isLoading:
      global.isLoading ||
      ventes.isLoading ||
      tresorerie.isLoading ||
      comparaison.isLoading,
    hasError:
      global.error ||
      ventes.error ||
      tresorerie.error ||
      comparaison.error,
  };
};

/**
 * Hook pour basculer entre plusieurs périodes prédéfinies
 * 
 * @example
 * const { filters, setPeriode } = usePeriodeSelector('mois');
 * 
 * // Utilisation
 * <select onChange={(e) => setPeriode(e.target.value)}>
 *   <option value="jour">Aujourd'hui</option>
 *   <option value="semaine">Cette semaine</option>
 *   <option value="mois">Ce mois</option>
 *   <option value="annee">Cette année</option>
 * </select>
 */
export const usePeriodeSelector = (initialType: 'jour' | 'semaine' | 'mois' | 'annee' = 'mois') => {
  const [periode, setPeriode] = React.useState<'jour' | 'semaine' | 'mois' | 'annee'>(initialType);

  const filters = React.useMemo(() => {
    return rapportApi.getPeriodePreset(periode);
  }, [periode]);

  return {
    filters,
    periode,
    setPeriode,
  };
};

// Importer React pour usePeriodeSelector
import React from 'react';