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
    setRefreshKey((prev) => prev + 1); // Force le refresh de la liste
  };

  const handleDetailsClose = () => {
    setShowDetails(false);
    setClientSelectionne(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Users size={24} className="text-blue-600" />
              <h1 className="text-2xl font-bold">Gestion des clients</h1>
            </div>
            <button
              onClick={handleNouveauClient}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus size={18} />
              Nouveau client
            </button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto p-4">
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