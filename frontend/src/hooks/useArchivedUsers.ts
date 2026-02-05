// src/hooks/useArchivedUsers.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/services/userApi';
import { toast } from 'sonner';

export const useArchivedUsers = () => {
  const queryClient = useQueryClient();

  // Récupérer les utilisateurs désactivés
  const { data: inactiveUsers = [], isLoading: loadingInactive } = useQuery({
    queryKey: ['users', 'inactive'],
    queryFn: () => userApi.getInactiveUsers(),
    select: (response) => response.data || [],
  });

  // Récupérer les utilisateurs supprimés
  const { data: deletedUsers = [], isLoading: loadingDeleted } = useQuery({
    queryKey: ['users', 'deleted'],
    queryFn: () => userApi.getDeletedUsers(),
    select: (response) => response.data || [],
  });

  // Restaurer un utilisateur supprimé
  const restoreMutation = useMutation({
    mutationFn: (id: number) => userApi.restoreUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur restauré avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la restauration');
    },
  });

  // Activer un utilisateur désactivé
  const activateMutation = useMutation({
    mutationFn: (id: number) => userApi.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur activé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'activation");
    },
  });

  // Supprimer définitivement un utilisateur
  const permanentDeleteMutation = useMutation({
    mutationFn: (id: number) => userApi.permanentlyDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur supprimé définitivement');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });

  return {
    inactiveUsers,
    deletedUsers,
    isLoading: loadingInactive || loadingDeleted,
    restoreUser: restoreMutation.mutate,
    activateUser: activateMutation.mutate,
    permanentlyDeleteUser: permanentDeleteMutation.mutate,
    isRestoring: restoreMutation.isPending,
    isActivating: activateMutation.isPending,
    isDeleting: permanentDeleteMutation.isPending,
  };
};