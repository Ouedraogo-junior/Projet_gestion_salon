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
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            <h1 className="text-2xl font-bold mr-auto">Ventes</h1>
            
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('nouvelle')}
                className={`px-6 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'nouvelle'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Plus size={18} />
                Nouvelle vente
              </button>
              
              <button
                onClick={() => setActiveTab('historique')}
                className={`px-6 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'historique'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <History size={18} />
                Historique
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4">
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