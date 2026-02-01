// src/hooks/useRendezVous.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rendezVousApi } from '../services/rendezVousApi';
import { toast } from 'sonner';
import type { RendezVousFilters, CreateRendezVousGerantDTO } from '../types/rendezVous.types';

export const useRendezVous = (filters?: RendezVousFilters) => {
  const queryClient = useQueryClient();

  // Liste des rendez-vous
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['rendez-vous', filters],
    queryFn: () => rendezVousApi.getAll(filters),
  });

  // Créer un rendez-vous
  const createMutation = useMutation({
    mutationFn: (data: CreateRendezVousGerantDTO) => rendezVousApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rendez-vous'] });
      toast.success('Rendez-vous créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    },
  });

  // Modifier un rendez-vous
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateRendezVousGerantDTO> }) =>
      rendezVousApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rendez-vous'] });
      toast.success('Rendez-vous modifié avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    },
  });

  // Confirmer un rendez-vous
  const confirmerMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data?: { coiffeur_id?: number; notes?: string } }) =>
      rendezVousApi.confirmer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rendez-vous'] });
      toast.success('Rendez-vous confirmé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la confirmation');
    },
  });

  // Annuler un rendez-vous
  const annulerMutation = useMutation({
    mutationFn: ({ id, motif }: { id: number; motif: string }) =>
      rendezVousApi.annuler(id, motif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rendez-vous'] });
      toast.success('Rendez-vous annulé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'annulation");
    },
  });

  // Terminer un rendez-vous
  const terminerMutation = useMutation({
    mutationFn: (id: number) => rendezVousApi.terminer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rendez-vous'] });
      toast.success('Rendez-vous terminé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur');
    },
  });

  // Supprimer un rendez-vous
  const deleteMutation = useMutation({
    mutationFn: (id: number) => rendezVousApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rendez-vous'] });
      toast.success('Rendez-vous supprimé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });

  // Marquer acompte payé
  const marquerAcomptePayeMutation = useMutation({
    mutationFn: (id: number) => rendezVousApi.marquerAcomptePaye(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rendez-vous'] });
      toast.success('Acompte marqué comme payé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur');
    },
  });

  return {
    rendezVous: data?.data?.data || [],
    isLoading,
    error,
    refetch,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    confirmer: confirmerMutation.mutate,
    annuler: annulerMutation.mutate,
    terminer: terminerMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    marquerAcomptePaye: marquerAcomptePayeMutation.mutate,
  };
};