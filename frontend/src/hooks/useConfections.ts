// src/hooks/useConfections.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { confectionApi } from '../services/confectionApi';
import type {
  Confection,
  CreateConfectionData,
  UpdateConfectionData,
  ConfectionFilters,
} from '../types/confection';
import { toast } from 'sonner'; // ou votre lib de notifications

// Clés de query pour React Query
export const confectionKeys = {
  all: ['confections'] as const,
  lists: () => [...confectionKeys.all, 'list'] as const,
  list: (filters?: ConfectionFilters) => [...confectionKeys.lists(), filters] as const,
  details: () => [...confectionKeys.all, 'detail'] as const,
  detail: (id: number) => [...confectionKeys.details(), id] as const,
  statistiques: (dateDebut?: string, dateFin?: string) =>
    [...confectionKeys.all, 'statistiques', dateDebut, dateFin] as const,
};

/**
 * Hook pour récupérer la liste des confections
 */
export function useConfections(filters?: ConfectionFilters) {
  return useQuery({
    queryKey: confectionKeys.list(filters),
    queryFn: async () => {
      const response = await confectionApi.getAll(filters);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour récupérer une confection par ID
 */
export function useConfection(id: number) {
  return useQuery({
    queryKey: confectionKeys.detail(id),
    queryFn: async () => {
      const response = await confectionApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook pour les statistiques
 */
export function useConfectionStatistiques(dateDebut?: string, dateFin?: string) {
  return useQuery({
    queryKey: confectionKeys.statistiques(dateDebut, dateFin),
    queryFn: async () => {
      const response = await confectionApi.getStatistiques(dateDebut, dateFin);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour créer une confection
 */
export function useCreateConfection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConfectionData) => confectionApi.create(data),
    onSuccess: (response) => {
      // Invalider le cache pour rafraîchir la liste
      queryClient.invalidateQueries({ queryKey: confectionKeys.lists() });
      toast.success(response.message || 'Confection créée avec succès');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Erreur lors de la création de la confection';
      toast.error(message);
    },
  });
}

/**
 * Hook pour mettre à jour une confection
 */
export function useUpdateConfection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateConfectionData }) =>
      confectionApi.update(id, data),
    onSuccess: (response) => {
      // Invalider le cache
      queryClient.invalidateQueries({ queryKey: confectionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: confectionKeys.detail(response.data.id) });
      toast.success(response.message || 'Confection mise à jour avec succès');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
    },
  });
}

/**
 * Hook pour supprimer une confection
 */
export function useDeleteConfection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => confectionApi.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: confectionKeys.lists() });
      toast.success(response.message || 'Confection supprimée avec succès');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(message);
    },
  });
}

/**
 * Hook pour terminer une confection
 */
export function useTerminerConfection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => confectionApi.terminer(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: confectionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: confectionKeys.detail(response.data.id) });
      queryClient.invalidateQueries({ queryKey: confectionKeys.statistiques() });
      toast.success(response.message || 'Confection terminée avec succès. Produit créé !');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Erreur lors de la finalisation';
      toast.error(message);
    },
  });
}

/**
 * Hook pour annuler une confection
 */
export function useAnnulerConfection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, motif }: { id: number; motif?: string }) =>
      confectionApi.annuler(id, motif),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: confectionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: confectionKeys.detail(response.data.id) });
      toast.success(response.message || 'Confection annulée avec succès');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Erreur lors de l\'annulation';
      toast.error(message);
    },
  });
}

/**
 * Hook combiné pour toutes les actions sur une confection
 */
export function useConfectionActions() {
  return {
    create: useCreateConfection(),
    update: useUpdateConfection(),
    delete: useDeleteConfection(),
    terminer: useTerminerConfection(),
    annuler: useAnnulerConfection(),
  };
}