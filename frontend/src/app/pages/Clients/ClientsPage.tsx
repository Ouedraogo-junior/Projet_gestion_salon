// src/app/pages/Clients/ClientsPage.tsx
import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { ClientListe } from './components/ClientListe';
import { ClientModal } from './components/ClientModal';
import { ClientDetails } from './components/ClientDetails';
import type { Client } from '../../../types/client.types';

export const ClientsPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [clientSelectionne, setClientSelectionne] = useState<Client | null>(null);
  const [modeEdition, setModeEdition] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNouveauClient = () => {
    setClientSelectionne(null);
    setModeEdition(false);
    setShowModal(true);
  };

  const handleModifierClient = (client: Client) => {
    setClientSelectionne(client);
    setModeEdition(true);
    setShowModal(true);
  };

  const handleVoirDetails = (client: Client) => {
    setClientSelectionne(client);
    setShowDetails(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setClientSelectionne(null);
    setModeEdition(false);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setClientSelectionne(null);
    setModeEdition(false);
    setRefreshKey((prev) => prev + 1);
  };

  const handleDetailsClose = () => {
    setShowDetails(false);
    setClientSelectionne(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Titre */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Users size={20} className="text-blue-600 sm:w-6 sm:h-6 flex-shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold truncate">
                <span className="hidden sm:inline">Gestion des clients</span>
                <span className="sm:hidden">Clients</span>
              </h1>
            </div>

            {/* Bouton - Responsive */}
            <button
              onClick={handleNouveauClient}
              className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-1.5 sm:gap-2 flex-shrink-0 text-sm sm:text-base"
            >
              <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden xs:inline">Nouveau</span>
              {/* <span className="xs:hidden">+</span> */}
            </button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto p-3 sm:p-4">
        <ClientListe
          key={refreshKey}
          onVoirDetails={handleVoirDetails}
          onModifier={handleModifierClient}
          onRefresh={() => setRefreshKey((prev) => prev + 1)}
        />
      </div>

      {/* Modal création/édition */}
      {showModal && (
        <ClientModal
          client={clientSelectionne}
          isEditing={modeEdition}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Modal détails */}
      {showDetails && clientSelectionne && (
        <ClientDetails
          clientId={clientSelectionne.id}
          onClose={handleDetailsClose}
          onModifier={() => {
            handleDetailsClose();
            handleModifierClient(clientSelectionne);
          }}
        />
      )}
    </div>
  );
};

export default ClientsPage;