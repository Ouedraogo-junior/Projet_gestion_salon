// src/app/pages/RendezVous/RendezVousPage.tsx

import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon, List, Filter, Search, X, User, Phone, Clock } from 'lucide-react';
import { useRendezVous } from '../../../hooks/useRendezVous';
import { ListeRendezVous } from './components/ListeRendezVous';
import { CalendrierRendezVous } from './components/CalendrierRendezVous';
import { FiltersRendezVous } from './components/FiltersRendezVous';
import { ModalNouveauRendezVous } from './components/ModalNouveauRendezVous';
import type { RendezVousFilters, RendezVous } from '../../../types/rendezVous.types';

export const RendezVousPage: React.FC = () => {
  const [vue, setVue] = useState<'liste' | 'calendrier'>('liste');
  const [showFilters, setShowFilters] = useState(false);
  const [showNouveauRDV, setShowNouveauRDV] = useState(false);
  const [selectedRdvFromSearch, setSelectedRdvFromSearch] = useState<RendezVous | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filters, setFilters] = useState<RendezVousFilters>({
    a_venir: true,
  });

  const { rendezVous, isLoading, refetch } = useRendezVous(filters);

  // Statistiques rapides
  const stats = {
    total: rendezVous.length,
    en_attente: rendezVous.filter(r => r.statut === 'en_attente').length,
    confirmes: rendezVous.filter(r => r.statut === 'confirme').length,
    aujourd_hui: rendezVous.filter(r => {
      const rdvDate = new Date(r.date_heure);
      const today = new Date();
      return rdvDate.toDateString() === today.toDateString();
    }).length,
  };

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
      .slice(0, 5);
  }, [searchTerm, rendezVous]);

  const handleSelectRendezVous = (rdv: RendezVous) => {
    setSelectedRdvFromSearch(rdv);
    setSearchTerm('');
    setShowSearchResults(false);
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

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Rendez-vous</h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Gérez les rendez-vous de vos clients
            </p>
          </div>

          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                showFilters
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filtres
            </button>

            <button
              onClick={() => setShowNouveauRDV(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nouveau rendez-vous
            </button>
          </div>
        </div>

        {/* Barre de recherche + Stats */}
        <div className="mt-5 space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Rechercher un rendez-vous par nom ou téléphone..."
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setShowSearchResults(false);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Résultats de recherche */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {searchResults.map((rdv) => (
                  <button
                    key={rdv.id}
                    onClick={() => handleSelectRendezVous(rdv)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-gray-900 truncate">
                            {rdv.client?.prenom} {rdv.client?.nom}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span>{rdv.client?.telephone}</span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3 text-gray-400" />
                            <span>{formatDate(rdv.date_heure)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span>{formatHeure(rdv.date_heure)}</span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-500 mt-1">
                          {rdv.typePrestation?.nom}
                        </div>
                      </div>

                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatutColor(rdv.statut)}`}>
                        {rdv.statut.replace('_', ' ')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Aucun résultat */}
            {showSearchResults && searchTerm.length >= 2 && searchResults.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
                <p className="text-gray-500 text-sm">Aucun rendez-vous trouvé</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <p className="text-sm text-blue-700 font-medium">Aujourd'hui</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-900 mt-1">{stats.aujourd_hui}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
              <p className="text-sm text-yellow-700 font-medium">En attente</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-900 mt-1">{stats.en_attente}</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <p className="text-sm text-green-700 font-medium">Confirmés</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-900 mt-1">{stats.confirmes}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
              <p className="text-sm text-gray-700 font-medium">Total</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <FiltersRendezVous 
            filters={filters} 
            onChange={setFilters}
            rendezVous={rendezVous}
          />
        </div>
      )}

      {/* Toggle Vue */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVue('liste')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              vue === 'liste'
                ? 'bg-orange-100 text-orange-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <List className="w-5 h-5" />
            Liste
          </button>

          <button
            onClick={() => setVue('calendrier')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              vue === 'calendrier'
                ? 'bg-orange-100 text-orange-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            Calendrier
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4 sm:p-6">
        {vue === 'liste' ? (
          <ListeRendezVous
            rendezVous={rendezVous}
            isLoading={isLoading}
            onRefresh={refetch}
            selectedRdvFromSearch={selectedRdvFromSearch}
            onClearSelection={() => setSelectedRdvFromSearch(null)}
          />
        ) : (
          <CalendrierRendezVous
            rendezVous={rendezVous}
            isLoading={isLoading}
            onRefresh={refetch}
            selectedRdvFromSearch={selectedRdvFromSearch}
            onClearSelection={() => setSelectedRdvFromSearch(null)}
          />
        )}
      </div>

      <ModalNouveauRendezVous
        isOpen={showNouveauRDV}
        onClose={() => setShowNouveauRDV(false)}
        onSuccess={() => {
          setShowNouveauRDV(false);
          refetch();
        }}
      />
    </div>
  );
};