// src/hooks/useSalonPublic.ts
import { useQuery } from '@tanstack/react-query';
import { salonApi } from '@/services/salonApi';

export const useSalonPublic = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['salon-public'],
    queryFn: salonApi.getSalon,
    staleTime: 1000 * 60 * 5, // Cache pendant 5 minutes
  });

  return {
    salon: data?.data,
    isLoading,
    error,
  };
};