// src/hooks/usePublicData.ts
import { useState, useEffect } from 'react';
import { publicApiService } from '@/services/publicApi';
import type {
  SalonPublicInfo,
  PrestationPublique,
  ProduitPublic,
  RealisationPublique,
} from '@/types/public.types';

export const usePublicData = (slug?: string) => {
  const [salonInfo, setSalonInfo]       = useState<SalonPublicInfo | null>(null);
  const [prestations, setPrestations]   = useState<PrestationPublique[]>([]);
  const [produits, setProduits]         = useState<ProduitPublic[]>([]);
  const [realisations, setRealisations] = useState<RealisationPublique[]>([]);
  const [realisationsEpinglees, setRealisationsEpinglees] = useState<RealisationPublique[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [infoRes, prestRes, prodRes, realisationsRes, epinglesRes] = await Promise.all([
          publicApiService.getSalonInfo(slug),
          publicApiService.getPrestations(slug),
          publicApiService.getProduits(slug),
          publicApiService.getPhotosPubliques(slug), 
          publicApiService.getRealisationsEpinglees(slug),
        ]);

        if (infoRes.success)          setSalonInfo(infoRes.data);
        if (prestRes.success)         setPrestations(prestRes.data);
        if (prodRes.success)          setProduits(prodRes.data);
        if (realisationsRes.success)  setRealisations(realisationsRes.data);
        if (epinglesRes.success)      setRealisationsEpinglees(epinglesRes.data);
      } catch (err: any) {
        setError(err.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [slug]);

  return { salonInfo, prestations, produits, realisations, realisationsEpinglees, loading, error };
};