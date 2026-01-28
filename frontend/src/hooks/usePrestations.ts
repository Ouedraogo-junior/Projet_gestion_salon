// src/hooks/usePrestations.ts

import { useState, useEffect, useCallback } from 'react';
import { prestationApi } from '../services/prestationApi';
import type {
  TypePrestation,
  CreateTypePrestationDTO,
  UpdateTypePrestationDTO,
  TypePrestationFilters,
} from '../types/prestation.types';

export const usePrestations = (initialFilters?: TypePrestationFilters) => {
  const [prestations, setPrestations] = useState<TypePrestation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TypePrestationFilters>(
    initialFilters || { actif: undefined, sort_by: 'ordre', sort_order: 'asc' }
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  /**
   * Charger les prestations
   */
  const loadPrestations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await prestationApi.getAll(filters);

      if (response.success) {
        if (Array.isArray(response.data)) {
          // Réponse sans pagination (all=true)
          setPrestations(response.data);
          setTotal(response.data.length);
        } else {
          // Réponse paginée
          setPrestations(response.data.data);
          setCurrentPage(response.data.current_page);
          setTotalPages(response.data.last_page);
          setTotal(response.data.total);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
      console.error('Erreur chargement prestations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  /**
   * Créer une prestation
   */
  const createPrestation = async (data: CreateTypePrestationDTO): Promise<boolean> => {
    try {
      const response = await prestationApi.create(data);
      if (response.success) {
        await loadPrestations();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
      throw err;
    }
  };

  /**
   * Modifier une prestation
   */
  const updatePrestation = async (
    id: number,
    data: UpdateTypePrestationDTO
  ): Promise<boolean> => {
    try {
      const response = await prestationApi.update(id, data);
      if (response.success) {
        await loadPrestations();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la modification');
      throw err;
    }
  };

  /**
   * Supprimer une prestation
   */
  const deletePrestation = async (id: number): Promise<boolean> => {
    try {
      const response = await prestationApi.delete(id);
      if (response.success) {
        await loadPrestations();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
      throw err;
    }
  };

  /**
   * Activer/Désactiver une prestation
   */
  const toggleActif = async (id: number): Promise<boolean> => {
    try {
      const response = await prestationApi.toggleActif(id);
      if (response.success) {
        // Mise à jour optimiste
        setPrestations((prev) =>
          prev.map((p) => (p.id === id ? { ...p, actif: !p.actif } : p))
        );
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'activation");
      throw err;
    }
  };

  /**
   * Réorganiser les prestations
   */
  const reorderPrestations = async (newOrder: TypePrestation[]): Promise<boolean> => {
    try {
      const ordres = newOrder.map((p, index) => ({ id: p.id, ordre: index }));
      const response = await prestationApi.reorder(ordres);

      if (response.success) {
        // Mise à jour optimiste
        setPrestations(newOrder.map((p, index) => ({ ...p, ordre: index })));
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la réorganisation');
      throw err;
    }
  };

  /**
   * Mettre à jour les filtres
   */
  const updateFilters = (newFilters: Partial<TypePrestationFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Charger au montage et quand les filtres changent
  useEffect(() => {
    loadPrestations();
  }, [loadPrestations]);

  return {
    prestations,
    isLoading,
    error,
    filters,
    currentPage,
    totalPages,
    total,
    loadPrestations,
    createPrestation,
    updatePrestation,
    deletePrestation,
    toggleActif,
    reorderPrestations,
    updateFilters,
  };
};