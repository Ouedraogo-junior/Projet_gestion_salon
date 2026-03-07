// src/hooks/useGlobalSearch.ts
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/lib/axios';

export interface SearchResult {
  id: number;
  type: 'client' | 'produit' | 'vente';
  label: string;
  sublabel?: string;
  route: string;
}

const ICONS = { client: '👤', produit: '📦', vente: '🧾' } as const;

export function useGlobalSearch() {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const [clients, produits, ventes] = await Promise.allSettled([
        axios.get(`/clients/search?q=${encodeURIComponent(q)}&per_page=5`),
        axios.get(`/produits?search=${encodeURIComponent(q)}&per_page=5`),
        axios.get(`/ventes?search=${encodeURIComponent(q)}&per_page=5`),
      ]);

      const mapped: SearchResult[] = [];

      if (clients.status === 'fulfilled') {
        const data = clients.value.data?.data ?? clients.value.data ?? [];
        (Array.isArray(data) ? data : data.data ?? []).slice(0, 4).forEach((c: any) => {
          mapped.push({
            id: c.id, type: 'client',
            label: `${c.prenom ?? ''} ${c.nom ?? ''}`.trim() || c.telephone,
            sublabel: c.telephone,
            route: '/clients',
          });
        });
      }

      if (produits.status === 'fulfilled') {
        const raw = produits.value.data;
        const data = raw?.data?.data ?? raw?.data ?? [];
        (Array.isArray(data) ? data : []).slice(0, 4).forEach((p: any) => {
          mapped.push({
            id: p.id, type: 'produit',
            label: p.nom,
            sublabel: p.categorie?.nom,
            route: '/produits',
          });
        });
      }

      if (ventes.status === 'fulfilled') {
        const raw = ventes.value.data;
        const data = raw?.data?.data ?? raw?.data ?? [];
        (Array.isArray(data) ? data : []).slice(0, 3).forEach((v: any) => {
          mapped.push({
            id: v.id, type: 'vente',
            label: v.numero_facture,
            sublabel: v.client_nom ?? v.client?.nom ?? undefined,
            route: '/ventes',
          });
        });
      }

      setResults(mapped);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  const goTo = (result: SearchResult) => {
    setQuery('');
    setResults([]);
    navigate(result.route);
  };

  const clear = () => { setQuery(''); setResults([]); };

  return { query, setQuery, results, loading, goTo, clear, ICONS };
}