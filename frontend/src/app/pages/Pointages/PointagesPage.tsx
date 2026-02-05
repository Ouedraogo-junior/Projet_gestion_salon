// src/app/pages/Pointages/PointagesPage.tsx

import React, { useState } from 'react';
import { Calendar, Clock, Users, TrendingUp } from 'lucide-react';
import { ListeEmployesPointage } from './components/ListeEmployesPointage';
import { TableauPointages } from './components/TableauPointages';
import { StatsPointages } from './components/StatsPointages';
import type { PointageFilters } from '../../../types/pointage.types';

export const PointagesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'aujourd_hui' | 'historique' | 'stats'>('aujourd_hui');
  const [filters, setFilters] = useState<PointageFilters>({
    date: new Date().toISOString().split('T')[0],
  });

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Gestion des Pointages</h1>
          <p className="text-gray-600 mt-0.5 sm:mt-1 text-sm sm:text-base">Suivi de la présence des employés</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span>
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tab bar : scroll horizontal sur mobile */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('aujourd_hui')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium transition whitespace-nowrap flex-shrink-0 ${
              activeTab === 'aujourd_hui'
                ? 'border-b-2 border-orange-600 text-orange-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            Pointage du jour
          </button>
          <button
            onClick={() => setActiveTab('historique')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium transition whitespace-nowrap flex-shrink-0 ${
              activeTab === 'historique'
                ? 'border-b-2 border-orange-600 text-orange-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            Historique
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium transition whitespace-nowrap flex-shrink-0 ${
              activeTab === 'stats'
                ? 'border-b-2 border-orange-600 text-orange-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            Statistiques
          </button>
        </div>

        {/* Contenu */}
        <div className="p-4 sm:p-6">
          {activeTab === 'aujourd_hui' && <ListeEmployesPointage />}
          {activeTab === 'historique' && (
            <TableauPointages filters={filters} onFiltersChange={setFilters} />
          )}
          {activeTab === 'stats' && <StatsPointages />}
        </div>
      </div>
    </div>
  );
};