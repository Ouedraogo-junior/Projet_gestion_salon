// src/app/pages/VentesPage.tsx

import React, { useState } from 'react';
import { Plus, History } from 'lucide-react';
import { NouvelleVente } from './NouvelleVente';
import { VenteHistorique } from './components/VenteHistorique';

type TabType = 'nouvelle' | 'historique';

export const VentesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('nouvelle');

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5 lg:space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ventes</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {activeTab === 'nouvelle' ? 'Enregistrer une nouvelle vente' : 'Historique des ventes du salon'}
            </p>
          </div>

          {/* Onglets */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-0.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('nouvelle')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'nouvelle'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Plus size={15} />
              Nouvelle vente
            </button>

            <button
              onClick={() => setActiveTab('historique')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'historique'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <History size={15} />
              Historique
            </button>
          </div>
        </div>

        {/* Contenu */}
        {activeTab === 'nouvelle' ? <NouvelleVente /> : <VenteHistorique />}
      </div>
    </div>
  );
};

export default VentesPage;