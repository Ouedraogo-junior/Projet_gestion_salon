// src/hooks/useRendezVous.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rendezVousApi } from '../services/rendezVousApi';
import { toast } from 'sonner';
import type { RendezVousFilters, CreateRendezVousGerantDTO } from '../types/rendezVous.types';
import type { PayerAcompteDTO, FinaliserRendezVousDTO } from '../types/rendezVousPaiement.types';

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

  // Mettre à jour l'acompte d'un rendez-vous
  const { mutate: updateAcompte } = useMutation({
    mutationFn: ({ id, acompte_montant }: { id: number; acompte_montant: number }) =>
      rendezVousApi.updateAcompte(id, acompte_montant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rendez-vous'] });
    },
  });

  // Marquer acompte payé (ancienne méthode, à garder pour compatibilité)
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

  // Payer acompte (nouvelle méthode avec enregistrement du paiement)
  const payerAcompteMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PayerAcompteDTO }) =>
      rendezVousApi.payerAcompte(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rendez-vous'] });
      toast.success('Acompte enregistré avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors du paiement de l'acompte");
    },
  });

  // Marquer en cours (client arrivé)
  const marquerEnCoursMutation = useMutation({
    mutationFn: (id: number) => rendezVousApi.marquerEnCours(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rendez-vous'] });
      toast.success('Rendez-vous marqué comme en cours');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur');
    },
  });

  // Finaliser rendez-vous (créer vente + payer solde)
  const finaliserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FinaliserRendezVousDTO }) =>
      rendezVousApi.finaliserRendezVous(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rendez-vous'] });
      queryClient.invalidateQueries({ queryKey: ['ventes'] });
      toast.success('Rendez-vous finalisé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la finalisation');
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
    updateAcompte,
    // Nouvelles méthodes pour la gestion des paiements
    payerAcompte: payerAcompteMutation.mutate,
    marquerEnCours: marquerEnCoursMutation.mutate,
    finaliser: finaliserMutation.mutate,
    isPayingAcompte: payerAcompteMutation.isPending,
    isFinalizing: finaliserMutation.isPending,
  };
};