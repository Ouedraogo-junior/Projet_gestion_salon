// src/app/pages/prestations/components/PrestationFilters.tsx

import React from 'react';
import { Search } from 'lucide-react';
import type { TypePrestationFilters } from '../../../../types/prestation.types';

interface PrestationFiltersProps {
  filters: TypePrestationFilters;
  onFilterChange: (filters: Partial<TypePrestationFilters>) => void;
  totalCount: number;
}

export const PrestationFilters: React.FC<PrestationFiltersProps> = ({
  filters, onFilterChange, totalCount,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-3 sm:p-4 space-y-3">
      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={filters.search || ''}
          onChange={e => onFilterChange({ search: e.target.value })}
          placeholder="Rechercher une prestation..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-500">Statut</label>
          <select
            value={filters.actif === undefined ? 'all' : filters.actif ? 'actif' : 'inactif'}
            onChange={e => {
              const v = e.target.value;
              onFilterChange({ actif: v === 'all' ? undefined : v === 'actif' });
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="all">Tous ({totalCount})</option>
            <option value="actif">Actifs</option>
            <option value="inactif">Inactifs</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-500">Trier par</label>
          <select
            value={filters.sort_by || 'ordre'}
            onChange={e => onFilterChange({ sort_by: e.target.value as TypePrestationFilters['sort_by'] })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="ordre">Position</option>
            <option value="nom">Nom</option>
            <option value="prix_base">Prix</option>
            <option value="created_at">Date création</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-500">Ordre</label>
          <select
            value={filters.sort_order || 'asc'}
            onChange={e => onFilterChange({ sort_order: e.target.value as 'asc' | 'desc' })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="asc">Croissant</option>
            <option value="desc">Décroissant</option>
          </select>
        </div>
      </div>
    </div>
  );
};