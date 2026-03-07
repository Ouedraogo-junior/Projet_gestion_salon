// src/app/pages/Clients/ClientsPage.tsx

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { ClientListe } from './components/ClientListe';
import { ClientModal } from './components/ClientModal';
import { ClientDetails } from './components/ClientDetails';
import type { Client } from '../../../types/client.types';

export const ClientsPage: React.FC = () => {
  const [showModal, setShowModal]                     = useState(false);
  const [showDetails, setShowDetails]                 = useState(false);
  const [clientSelectionne, setClientSelectionne]     = useState<Client | null>(null);
  const [modeEdition, setModeEdition]                 = useState(false);
  const [refreshKey, setRefreshKey]                   = useState(0);

  const handleNouveauClient = () => { setClientSelectionne(null); setModeEdition(false); setShowModal(true); };
  const handleModifierClient = (client: Client) => { setClientSelectionne(client); setModeEdition(true); setShowModal(true); };
  const handleVoirDetails = (client: Client) => { setClientSelectionne(client); setShowDetails(true); };
  const handleModalClose = () => { setShowModal(false); setClientSelectionne(null); setModeEdition(false); };
  const handleModalSuccess = () => { setShowModal(false); setClientSelectionne(null); setModeEdition(false); setRefreshKey(k => k + 1); };
  const handleDetailsClose = () => { setShowDetails(false); setClientSelectionne(null); };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5 lg:space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des clients</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Suivez et gérez votre clientèle</p>
          </div>
          <button
            onClick={handleNouveauClient}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            <Plus size={16} />
            Nouveau client
          </button>
        </div>

        {/* Contenu */}
        <ClientListe
          key={refreshKey}
          onVoirDetails={handleVoirDetails}
          onModifier={handleModifierClient}
          onRefresh={() => setRefreshKey(k => k + 1)}
        />
      </div>

      {showModal && (
        <ClientModal
          client={clientSelectionne}
          isEditing={modeEdition}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {showDetails && clientSelectionne && (
        <ClientDetails
          clientId={clientSelectionne.id}
          onClose={handleDetailsClose}
          onModifier={() => { handleDetailsClose(); handleModifierClient(clientSelectionne); }}
        />
      )}
    </div>
  );
};

export default ClientsPage;