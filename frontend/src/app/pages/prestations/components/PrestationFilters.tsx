// src/app/pages/prestations/components/PrestationFilters.tsx

import React from 'react';
import { Search, Filter } from 'lucide-react';
import type { TypePrestationFilters } from '../../../../types/prestation.types';

interface PrestationFiltersProps {
  filters: TypePrestationFilters;
  onFilterChange: (filters: Partial<TypePrestationFilters>) => void;
  totalCount: number;
}

export const PrestationFilters: React.FC<PrestationFiltersProps> = ({
  filters,
  onFilterChange,
  totalCount,
}) => {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4">
      {/* Recherche */}
      <div className="relative">
        <Search 
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" 
          size={18}
        />
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          placeholder="Rechercher une prestation..."
          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
        />
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Statut */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            Statut
          </label>
          <select
            value={
              filters.actif === undefined ? 'all' : filters.actif ? 'actif' : 'inactif'
            }
            onChange={(e) => {
              const value = e.target.value;
              onFilterChange({
                actif: value === 'all' ? undefined : value === 'actif',
              });
            }}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          >
            <option value="all">Tous ({totalCount})</option>
            <option value="actif">Actifs</option>
            <option value="inactif">Inactifs</option>
          </select>
        </div>

        {/* Trier par */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            Trier par
          </label>
          <select
            value={filters.sort_by || 'ordre'}
            onChange={(e) =>
              onFilterChange({ sort_by: e.target.value as TypePrestationFilters['sort_by'] })
            }
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          >
            <option value="ordre">Position</option>
            <option value="nom">Nom</option>
            <option value="prix_base">Prix</option>
            <option value="created_at">Date création</option>
          </select>
        </div>

        {/* Ordre */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            Ordre
          </label>
          <select
            value={filters.sort_order || 'asc'}
            onChange={(e) =>
              onFilterChange({
                sort_order: e.target.value as 'asc' | 'desc',
              })
            }
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          >
            <option value="asc">Croissant</option>
            <option value="desc">Décroissant</option>
          </select>
        </div>
      </div>
    </div>
  );
};