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
      const params: any = {
        with_attributs: '1',
        with_produits: '1'
      };
      
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
      const params: any = {
        with_categories: '1'
      };
      
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
// useProduits → produits avec variantes imbriquées (pour ProductsGrid, TransfertsTab, etc.)
export function useProduits() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);

  const load = async (params: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await produitsApi.produits.getAll({ per_page: 500, ...params });
      setData(response.data?.data || []);
      setMeta(response.data?.meta || null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  return { data, loading, error, meta, reload: load };
}

// useVariantes → liste aplatie de variantes (pour selects dans formulaires)

export function useVariantes() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await produitsApi.produits.getAll({ per_page: 500 });
      const produits: any[] = response.data?.data || [];

      const variantes = produits.flatMap((produit: any) =>
        (produit.variantes ?? []).map((v: any) => {
          const attrLabel = v.attributs?.length > 0
            ? v.attributs.map((a: any) => a.valeur_formatee ?? a.valeur).join(' · ')
            : null;
          return {
            variante_id:          v.id,
            produit_id:           produit.id,
            categorie_id:         produit.categorie_id,   // ← clé pour le filtre
            nom:                  attrLabel ? `${produit.nom} — ${attrLabel}` : produit.nom,
            reference:            v.reference,
            prix_achat:           v.prix_achat        ?? 0,
            prix_vente:           v.prix_vente         ?? 0,
            stock_vente:          v.stock_vente        ?? 0,
            stock_utilisation:    v.stock_utilisation  ?? 0,
            stock_reserve:        v.stock_reserve      ?? 0,
            type_stock_principal: v.type_stock_principal,
            statut_validation:    v.statut_validation,
            is_active:            v.is_active,
          };
        })
      );

      setData(variantes);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  return { data, loading, error, reload: load };
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

      // Le controller retourne une réponse paginée : response.data est la collection paginée
      if (response.data?.data && Array.isArray(response.data.data)) {
        setData(response.data.data); // réponse paginée
      } else if (Array.isArray(response.data)) {
        setData(response.data);      // réponse directe
      } else {
        setData([]);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  return { data, loading, error, reload: load };
}