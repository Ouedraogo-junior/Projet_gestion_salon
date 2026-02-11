// src/app/pages/RendezVous/components/FiltersRendezVous.tsx

import React, { useEffect, useState } from 'react';
import { X, Search, Calendar, Clock, User, Phone } from 'lucide-react';
import type { RendezVousFilters, RendezVous } from '../../../../types/rendezVous.types';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../../../services/userApi';

interface Props {
  filters: RendezVousFilters;
  onChange: (filters: RendezVousFilters) => void;
  rendezVous: RendezVous[]; // NOUVEAU - pour recherche
  onSelectRendezVous?: (rdv: RendezVous) => void; // NOUVEAU - callback sélection
}

export const FiltersRendezVous: React.FC<Props> = ({ 
  filters, 
  onChange, 
  rendezVous,
  onSelectRendezVous 
}) => {
  const [localFilters, setLocalFilters] = useState<RendezVousFilters>(filters);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Récupérer la liste des coiffeurs
  const { data: coiffeurs } = useQuery({
    queryKey: ['coiffeurs'],
    queryFn: () => userApi.getCoiffeurs(),
    select: (data) => data.data || [],
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Recherche dans les rendez-vous
  const searchResults = React.useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];

    const term = searchTerm.toLowerCase();
    return rendezVous
      .filter((rdv) => {
        const nomComplet = `${rdv.client?.prenom || ''} ${rdv.client?.nom || ''}`.toLowerCase();
        const telephone = rdv.client?.telephone || '';
        return nomComplet.includes(term) || telephone.includes(term);
      })
      .slice(0, 5); // Limiter à 5 résultats
  }, [searchTerm, rendezVous]);

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

  const handleSelectRdv = (rdv: RendezVous) => {
    setSearchTerm('');
    setShowResults(false);
    onSelectRendezVous?.(rdv);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const formatHeure = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatutColor = (statut: string) => {
    const colors = {
      en_attente: 'bg-yellow-100 text-yellow-800',
      confirme: 'bg-green-100 text-green-800',
      en_cours: 'bg-blue-100 text-blue-800',
      termine: 'bg-gray-100 text-gray-800',
      annule: 'bg-red-100 text-red-800',
      no_show: 'bg-orange-100 text-orange-800',
    };
    return colors[statut as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const hasActiveFilters = Object.keys(localFilters).length > 1 || !localFilters.a_venir;

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recherche rapide
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Rechercher par nom ou téléphone..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setShowResults(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Résultats de recherche */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {searchResults.map((rdv) => (
              <button
                key={rdv.id}
                onClick={() => handleSelectRdv(rdv)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Client */}
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-900 truncate">
                        {rdv.client?.prenom} {rdv.client?.nom}
                      </span>
                    </div>

                    {/* Téléphone */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span>{rdv.client?.telephone}</span>
                    </div>

                    {/* Date & Heure */}
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{formatDate(rdv.date_heure)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{formatHeure(rdv.date_heure)}</span>
                      </div>
                    </div>

                    {/* Prestation */}
                    <div className="text-sm text-gray-500 mt-1">
                      {rdv.typePrestation?.nom}
                    </div>
                  </div>

                  {/* Statut */}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatutColor(rdv.statut)}`}>
                    {rdv.statut.replace('_', ' ')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Aucun résultat */}
        {showResults && searchTerm.length >= 2 && searchResults.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
            <p className="text-gray-500 text-sm">Aucun rendez-vous trouvé</p>
          </div>
        )}
      </div>

      {/* Filtres existants */}
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
            onChange={(e) => handleChange('a_venir', e.target.checked)}
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