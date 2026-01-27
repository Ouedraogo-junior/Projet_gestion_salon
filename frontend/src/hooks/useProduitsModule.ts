// src/hooks/useProduitsModule.ts
import { useState, useEffect } from 'react';
import { produitsApi } from '@/services/produitsApi';

// ========================================
// HOOK CATÉGORIES
// ========================================
export function useCategories() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      
      if (search) {
        params.search = search;
      }
      
      const response = await produitsApi.categories.getAll(params);
      setData(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { data, loading, error, reload: load };
}

// ========================================
// HOOK ATTRIBUTS
// ========================================
export function useAttributs() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      
      if (search) {
        params.search = search;
      }
      
      const response = await produitsApi.attributs.getAll(params);
      setData(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { data, loading, error, reload: load };
}

// ========================================
// HOOK PRODUITS
// ========================================
export function useProduits() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);

  const load = async (params: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await produitsApi.produits.getAll(params);
      setData(response.data?.data || []);
      setMeta(response.data?.meta || null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { data, loading, error, meta, reload: load };
}

// ========================================
// HOOK MOUVEMENTS
// ========================================
export function useMouvements() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (params: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await produitsApi.mouvements.getAll(params);
      
      // Gérer les deux cas : pagination et tableau direct
      if (response.data?.data && Array.isArray(response.data.data)) {
        // Cas 1: Réponse paginée {data: {data: [...], meta: {...}}}
        setData(response.data.data);
      } else if (Array.isArray(response.data)) {
        // Cas 2: Réponse directe {data: [...]}
        setData(response.data);
      } else {
        setData([]);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { data, loading, error, reload: load };
}

// ========================================
// HOOK TRANSFERTS
// ========================================
export function useTransferts() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (params: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await produitsApi.transferts.getAll(params);
      // Les transferts sont directement dans response.data (pas de pagination)
      setData(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { data, loading, error, reload: load };
}