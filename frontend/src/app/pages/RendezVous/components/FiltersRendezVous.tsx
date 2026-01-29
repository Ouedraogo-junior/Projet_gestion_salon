// src/app/pages/RendezVous/components/FiltersRendezVous.tsx

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { RendezVousFilters } from '../../../../types/rendezVous.types';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../../../services/userApi';

interface Props {
  filters: RendezVousFilters;
  onChange: (filters: RendezVousFilters) => void;
}

export const FiltersRendezVous: React.FC<Props> = ({ filters, onChange }) => {
  const [localFilters, setLocalFilters] = useState<RendezVousFilters>(filters);

  // Récupérer la liste des coiffeurs
  const { data: coiffeurs } = useQuery({
    queryKey: ['coiffeurs'],
    queryFn: () => userApi.getCoiffeurs(),
    select: (data) => data.data || [],
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key: keyof RendezVousFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onChange(localFilters);
  };

  const resetFilters = () => {
    const resetted: RendezVousFilters = { a_venir: true };
    setLocalFilters(resetted);
    onChange(resetted);
  };

  const hasActiveFilters = Object.keys(localFilters).length > 1 || !localFilters.a_venir;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Statut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            value={localFilters.statut || ''}
            onChange={(e) => handleChange('statut', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="confirme">Confirmé</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
            <option value="annule">Annulé</option>
            <option value="no_show">Absent</option>
          </select>
        </div>

        {/* Coiffeur */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coiffeur
          </label>
          <select
            value={localFilters.coiffeur_id || ''}
            onChange={(e) => handleChange('coiffeur_id', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Tous les coiffeurs</option>
            {coiffeurs?.map((coiffeur) => (
              <option key={coiffeur.id} value={coiffeur.id}>
                {coiffeur.prenom} {coiffeur.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Date début */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date début
          </label>
          <input
            type="date"
            value={localFilters.date_debut || ''}
            onChange={(e) => handleChange('date_debut', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Date fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date fin
          </label>
          <input
            type="date"
            value={localFilters.date_fin || ''}
            onChange={(e) => handleChange('date_fin', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Options */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={localFilters.a_venir !== false}
            onChange={(e) => handleChange('a_venir', e.target.checked || undefined)}
            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <span className="text-sm text-gray-700">Rendez-vous à venir uniquement</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={applyFilters}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition"
        >
          Appliquer les filtres
        </button>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
};