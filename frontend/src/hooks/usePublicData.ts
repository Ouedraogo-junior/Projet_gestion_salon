// src/hooks/usePublicData.ts - MODIFIER

import { useState, useEffect } from 'react';
import { publicApiService } from '@/services/publicApi';
import type { SalonPublicInfo, PrestationPublique, ProduitPublic, PhotoPublique } from '@/types/public.types';

export const usePublicData = (slug?: string) => {
  const [salonInfo, setSalonInfo] = useState<SalonPublicInfo | null>(null);
  const [prestations, setPrestations] = useState<PrestationPublique[]>([]);
  const [produits, setProduits] = useState<ProduitPublic[]>([]);
  const [photos, setPhotos] = useState<PhotoPublique[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [infoRes, prestRes, prodRes, photosRes] = await Promise.all([
          publicApiService.getSalonInfo(slug),
          publicApiService.getPrestations(slug),
          publicApiService.getProduits(slug),
          publicApiService.getPhotosPubliques(slug),
        ]);

        if (infoRes.success) setSalonInfo(infoRes.data);
        if (prestRes.success) setPrestations(prestRes.data);
        if (prodRes.success) setProduits(prodRes.data);
        if (photosRes.success) setPhotos(photosRes.data);
      } catch (err: any) {
        setError(err.message || 'Erreur de chargement');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  return { salonInfo, prestations, produits, photos, loading, error };
};