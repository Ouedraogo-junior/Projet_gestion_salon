// src/hooks/useSalon.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salonService, type SalonUpdateData } from '@/services/salonService';
import { toast } from 'sonner';

export const useSalon = () => {
  const queryClient = useQueryClient();

  // Récupérer les infos du salon
  const { data, isLoading, error } = useQuery({
    queryKey: ['salon'],
    queryFn: salonService.getSalon,
  });

  // Mettre à jour les infos du salon
  const updateMutation = useMutation({
    mutationFn: (salonData: SalonUpdateData) => salonService.updateSalon(salonData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['salon'] });
      toast.success(response.message || 'Salon mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });

  // Upload du logo
  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => salonService.uploadLogo(file),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['salon'] });
      toast.success(response.message || 'Logo uploadé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'upload du logo');
    },
  });

  // Supprimer le logo
  const deleteLogoMutation = useMutation({
    mutationFn: salonService.deleteLogo,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['salon'] });
      toast.success(response.message || 'Logo supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression du logo');
    },
  });

  return {
    salon: data?.data,
    isLoading,
    error,
    updateSalon: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    uploadLogo: uploadLogoMutation.mutate,
    isUploadingLogo: uploadLogoMutation.isPending,
    deleteLogo: deleteLogoMutation.mutate,
    isDeletingLogo: deleteLogoMutation.isPending,
  };
};