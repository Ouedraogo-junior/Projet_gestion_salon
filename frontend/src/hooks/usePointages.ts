// src/hooks/usePointages.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pointageApi } from '../services/pointageApi';
import { toast } from 'sonner';
import type { PointageFilters, CreatePointageDTO, UpdatePointageDTO } from '../types/pointage.types';

export const usePointages = (filters?: PointageFilters) => {
  const queryClient = useQueryClient();

  // Liste des pointages
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pointages', filters],
    queryFn: () => pointageApi.getAll(filters),
  });

  // Créer un pointage
  const createMutation = useMutation({
    mutationFn: (data: CreatePointageDTO) => pointageApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointages'] });
      toast.success('Pointage enregistré');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors du pointage');
    },
  });

  // Modifier un pointage
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePointageDTO }) =>
      pointageApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointages'] });
      toast.success('Pointage modifié');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    },
  });

  // Marquer départ
  const marquerDepartMutation = useMutation({
    mutationFn: ({ id, heure }: { id: number; heure?: string }) =>
      pointageApi.marquerDepart(id, heure),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointages'] });
      toast.success('Départ enregistré');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur');
    },
  });

  // Supprimer
  const deleteMutation = useMutation({
    mutationFn: (id: number) => pointageApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointages'] });
      toast.success('Pointage supprimé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });

  return {
    pointages: data?.data?.data || [],
    pagination: data?.data ? {
      current_page: data.data.current_page,
      last_page: data.data.last_page,
      per_page: data.data.per_page,
      total: data.data.total,
    } : null,
    isLoading,
    error,
    refetch,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    marquerDepart: marquerDepartMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};

// Hook pour les stats
export const usePointagesStats = (dateDebut: string, dateFin: string, userId?: number) => {
  return useQuery({
    queryKey: ['pointages-stats', dateDebut, dateFin, userId],
    queryFn: () => pointageApi.getStats(dateDebut, dateFin, userId),
    enabled: !!dateDebut && !!dateFin,
  });
};

// Hook pour employés aujourd'hui
export const useEmployeesAujourdhui = () => {
  return useQuery({
    queryKey: ['employees-aujourdhui'],
    queryFn: () => pointageApi.getEmployeesAujourdhui(),
    refetchInterval: 60000, // Refresh chaque minute
  });
};