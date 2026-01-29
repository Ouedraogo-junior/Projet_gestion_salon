// src/hooks/useDepenses.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { depenseService } from '@/services/depenseService';
import { DepenseFormData, DepenseFilters } from '@/types/depense';
import { toast } from 'sonner';  //react-hot-toast

export const useDepenses = (filters?: DepenseFilters) => {
  return useQuery({
    queryKey: ['depenses', filters],
    queryFn: () => depenseService.getAll(filters),
  });
};

export const useDepense = (id: number) => {
  return useQuery({
    queryKey: ['depense', id],
    queryFn: () => depenseService.getById(id),
    enabled: !!id,
  });
};

export const useCreateDepense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DepenseFormData) => depenseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depenses'] });
      toast.success('Dépense ajoutée avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de l\'ajout de la dépense');
    },
  });
};

export const useUpdateDepense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DepenseFormData> }) =>
      depenseService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depenses'] });
      toast.success('Dépense modifiée avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la modification');
    },
  });
};

export const useDeleteDepense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => depenseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depenses'] });
      toast.success('Dépense supprimée avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });
};

export const useTotalMois = (mois?: number, annee?: number) => {
  return useQuery({
    queryKey: ['depenses-total', mois, annee],
    queryFn: () => depenseService.getTotalMois(mois, annee),
  });
};

export const useStatsCategorie = (mois?: number, annee?: number) => {
  return useQuery({
    queryKey: ['depenses-stats', mois, annee],
    queryFn: () => depenseService.getStatsParCategorie(mois, annee),
  });
};