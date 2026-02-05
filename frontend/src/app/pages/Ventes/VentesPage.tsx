// src/app/pages/VentesPage.tsx

import React, { useState } from 'react';
import { Plus, History } from 'lucide-react';
import { NouvelleVente } from './NouvelleVente';
import { VenteHistorique } from './components/VenteHistorique';

type TabType = 'nouvelle' | 'historique';

export const VentesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('nouvelle');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec onglets */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-3 sm:py-0 sm:h-16">
            <h1 className="text-xl sm:text-2xl font-bold sm:mr-auto">Ventes</h1>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('nouvelle')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-t-lg font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
                  activeTab === 'nouvelle'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="whitespace-nowrap">Nouvelle vente</span>
              </button>
              
              <button
                onClick={() => setActiveTab('historique')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-t-lg font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
                  activeTab === 'historique'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <History size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="whitespace-nowrap">Historique</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-3 sm:p-4 lg:p-6">
        {activeTab === 'nouvelle' ? (
          <NouvelleVente />
        ) : (
          <VenteHistorique />
        )}
      </div>
    </div>
  );
};

export default VentesPage;