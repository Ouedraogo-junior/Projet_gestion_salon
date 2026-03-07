// src/hooks/useConfections.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { confectionApi } from '../services/confectionApi';
import type {
  CreateConfectionData,
  UpdateConfectionData,
  ConfectionFilters,
} from '../types/confection';
import { toast } from 'sonner';

export const confectionKeys = {
  all: ['confections'] as const,
  lists: () => [...confectionKeys.all, 'list'] as const,
  list: (filters?: ConfectionFilters) => [...confectionKeys.lists(), filters] as const,
  details: () => [...confectionKeys.all, 'detail'] as const,
  detail: (id: number) => [...confectionKeys.details(), id] as const,
  statistiques: (dateDebut?: string, dateFin?: string) =>
    [...confectionKeys.all, 'statistiques', dateDebut, dateFin] as const,
};

export function useConfections(filters?: ConfectionFilters) {
  return useQuery({
    queryKey: confectionKeys.list(filters),
    queryFn: async () => {
      const response = await confectionApi.getAll(filters);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

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

export function useConfectionStatistiques(dateDebut?: string, dateFin?: string) {
  return useQuery({
    queryKey: confectionKeys.statistiques(dateDebut, dateFin),
    queryFn: async () => {
      const response = await confectionApi.getStatistiques(dateDebut, dateFin);
      // ✅ Gérer les deux structures possibles
      return response.data?.data ?? response.data ?? {};
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateConfection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateConfectionData) => confectionApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['confections'] });
      toast.success(response.message || 'Confection créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création de la confection');
    },
  });
}

export function useUpdateConfection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateConfectionData }) =>
      confectionApi.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['confections'] });
      toast.success(response.message || 'Confection mise à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });
}

export function useDeleteConfection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => confectionApi.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['confections'] });
      toast.success(response.message || 'Confection supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
}

export function useTerminerConfection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => confectionApi.terminer(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['confections'] });
      toast.success(response.message || 'Confection terminée avec succès. Produit créé !');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la finalisation');
    },
  });
}

export function useAnnulerConfection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motif }: { id: number; motif?: string }) =>
      confectionApi.annuler(id, motif),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['confections'] });
      toast.success(response.message || 'Confection annulée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'annulation");
    },
  });
}

export function useConfectionActions() {
  return {
    create: useCreateConfection(),
    update: useUpdateConfection(),
    delete: useDeleteConfection(),
    terminer: useTerminerConfection(),
    annuler: useAnnulerConfection(),
  };
}