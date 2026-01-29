// src/app/pages/RendezVous/RendezVousPage.tsx

import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon, List, Filter } from 'lucide-react';
import { useRendezVous } from '../../../hooks/useRendezVous';
import { ListeRendezVous } from './components/ListeRendezVous';
import { CalendrierRendezVous } from './components/CalendrierRendezVous';
import { FiltersRendezVous } from './components/FiltersRendezVous';
import { ModalNouveauRendezVous } from './components/ModalNouveauRendezVous';
import type { RendezVousFilters } from '../../../types/rendezVous.types';

export const RendezVousPage: React.FC = () => {
  const [vue, setVue] = useState<'liste' | 'calendrier'>('liste');
  const [showFilters, setShowFilters] = useState(false);
  const [showNouveauRDV, setShowNouveauRDV] = useState(false);
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

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rendez-vous</h1>
            <p className="text-sm text-gray-600 mt-1">
              Gérez les rendez-vous de vos clients
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
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
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nouveau rendez-vous
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700 font-medium">Aujourd'hui</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">{stats.aujourd_hui}</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-700 font-medium">En attente</p>
            <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.en_attente}</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700 font-medium">Confirmés</p>
            <p className="text-3xl font-bold text-green-900 mt-1">{stats.confirmes}</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 font-medium">Total</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <FiltersRendezVous filters={filters} onChange={setFilters} />
        </div>
      )}

      {/* Toggle Vue */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVue('liste')}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
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
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
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
      <div className="p-6">
        {vue === 'liste' ? (
          <ListeRendezVous
            rendezVous={rendezVous}
            isLoading={isLoading}
            onRefresh={refetch}
          />
        ) : (
          <CalendrierRendezVous
            rendezVous={rendezVous}
            isLoading={isLoading}
            onRefresh={refetch}
          />
        )}
      </div>

      {/* Modal Nouveau RDV */}
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