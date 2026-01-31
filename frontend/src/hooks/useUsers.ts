// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, type UserCreateData, type UserUpdateData, type UserFilters } from '@/services/userApi';
import { toast } from 'sonner';

export const useUsers = (filters?: UserFilters) => {
  const queryClient = useQueryClient();

  // Liste des utilisateurs
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => userApi.getAll(filters),
  });

  // Créer un utilisateur
  const createMutation = useMutation({
    mutationFn: (userData: UserCreateData) => userApi.create(userData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response.message || 'Utilisateur créé avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la création';
      toast.error(message);
    },
  });

  // Mettre à jour un utilisateur
  const updateMutation = useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: UserUpdateData }) =>
      userApi.update(id, userData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response.message || 'Utilisateur mis à jour avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
    },
  });

  // Supprimer un utilisateur
  const deleteMutation = useMutation({
    mutationFn: (id: number) => userApi.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response.message || 'Utilisateur supprimé avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(message);
    },
  });

  // Activer/Désactiver un utilisateur
  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => userApi.toggleActive(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response.message);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de l\'opération';
      toast.error(message);
    },
  });

  // Réinitialiser le mot de passe
  const resetPasswordMutation = useMutation({
    mutationFn: ({
      id,
      password,
      password_confirmation,
    }: {
      id: number;
      password: string;
      password_confirmation: string;
    }) => userApi.resetPassword(id, password, password_confirmation),
    onSuccess: (response) => {
      toast.success(response.message || 'Mot de passe réinitialisé avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la réinitialisation';
      toast.error(message);
    },
  });

  return {
    users: data?.data || [],
    isLoading,
    error,
    refetch,
    createUser: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateUser: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteUser: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    toggleActive: toggleActiveMutation.mutate,
    isTogglingActive: toggleActiveMutation.isPending,
    resetPassword: resetPasswordMutation.mutate,
    isResettingPassword: resetPasswordMutation.isPending,
  };
};

// Hook pour un utilisateur spécifique
export const useUser = (id: number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getOne(id),
    enabled: !!id,
  });

  return {
    user: data?.data,
    isLoading,
    error,
  };
};


/**
 * Hook pour gérer les salaires
 */
export const useSalaires = () => {
  const queryClient = useQueryClient();

  // Récupérer tous les salaires
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['salaires'],
    queryFn: () => userApi.getSalaires(),
  });

  // Mettre à jour un salaire
  const updateSalaireMutation = useMutation({
    mutationFn: ({ id, salaire_mensuel }: { id: number; salaire_mensuel: number }) =>
      userApi.updateSalaire(id, salaire_mensuel),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['salaires'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response.message || 'Salaire mis à jour avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour du salaire';
      toast.error(message);
    },
  });

  return {
    salaires: data?.data,
    isLoading,
    error,
    refetch,
    updateSalaire: updateSalaireMutation.mutate,
    isUpdatingSalaire: updateSalaireMutation.isPending,
  };
};

/**
 * Hook pour récupérer les coiffeurs actifs
 */
export const useCoiffeurs = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['coiffeurs'],
    queryFn: () => userApi.getCoiffeursActifs(),
  });

  return {
    coiffeurs: data?.data || [],
    isLoading,
    error,
    refetch,
  };
};