// src/app/pages/ventes/components/ClientSelector.tsx

import React, { useState, useEffect } from 'react';
import { Search, User, UserPlus, X, Loader2 } from 'lucide-react';
import { clientApi } from '../../../../services/clientApi';
import type { Client, NouveauClient, ClientAnonyme } from '../../../../types/vente.types';

interface ClientSelectorProps {
  onClientSelect: (data: {
    client_id?: number;
    nouveau_client?: NouveauClient;
    client_anonyme?: ClientAnonyme;
  }) => void;
  clientSelectionne?: Client | null;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  onClientSelect,
  clientSelectionne,
}) => {
  const [mode, setMode] = useState<'existant' | 'nouveau' | 'anonyme'>('existant');
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [nouveauClient, setNouveauClient] = useState<NouveauClient>({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
  });
  const [clientAnonyme, setClientAnonyme] = useState<ClientAnonyme>({
    nom: '',
    telephone: '',
  });

  useEffect(() => {
    if (mode === 'existant' && searchTerm.length >= 2) {
      loadClients();
    } else if (searchTerm.length === 0) {
      setClients([]);
    }
  }, [searchTerm, mode]);

  const loadClients = async () => {
    setIsLoadingClients(true);
    try {
      const response = await clientApi.searchClients(searchTerm);
      if (response.success) {
        setClients(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
      setClients([]);
    } finally {
      setIsLoadingClients(false);
    }
  };

  const handleClientExistantSelect = (client: Client) => {
    onClientSelect({ client_id: client.id });
    setSearchTerm('');
  };

  const handleNouveauClientSubmit = () => {
    // Seul le téléphone est obligatoire
    if (!nouveauClient.telephone) {
      alert('Le téléphone est requis');
      return;
    }
    onClientSelect({ nouveau_client: nouveauClient });
  };

  const handleClientAnonymeSubmit = () => {
    if (!clientAnonyme.telephone) {
      alert('Le téléphone est requis');
      return;
    }
    onClientSelect({ client_anonyme: clientAnonyme });
  };

  const resetSelection = () => {
    onClientSelect({});
    setSearchTerm('');
    setClients([]);
  };

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <User size={18} />
        Client
      </h3>

      {clientSelectionne ? (
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-300 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                {clientSelectionne.prenom.charAt(0)}{clientSelectionne.nom.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-green-900 text-lg">
                  {clientSelectionne.prenom} {clientSelectionne.nom}
                </p>
                <p className="text-sm text-green-700">{clientSelectionne.telephone}</p>
              </div>
            </div>
            <button
              onClick={resetSelection}
              className="p-2 bg-red-100 hover:bg-red-200 rounded-full text-red-600 transition"
              title="Changer de client"
            >
              <X size={20} />
            </button>
          </div>
          {clientSelectionne.points_fidelite > 0 && (
            <div className="flex items-center gap-2 p-2 bg-white/60 rounded mt-2">
              <span className="text-sm font-medium text-green-800">
                💎 Points de fidélité:
              </span>
              <span className="text-sm font-bold text-green-600">
                {clientSelectionne.points_fidelite} points
              </span>
            </div>
          )}
          <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-white/40 px-3 py-1.5 rounded">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="font-medium">Client sélectionné</span>
          </div>
        </div>
      ) : (
        <>
          {/* Sélection du mode */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setMode('existant')}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                mode === 'existant'
                  ? 'bg-blue-500 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Existant
            </button>
            <button
              onClick={() => setMode('nouveau')}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                mode === 'nouveau'
                  ? 'bg-blue-500 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Nouveau
            </button>
            <button
              onClick={() => setMode('anonyme')}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                mode === 'anonyme'
                  ? 'bg-blue-500 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Anonyme
            </button>
          </div>

          {/* Client existant */}
          {mode === 'existant' && (
            <div>
              <div className="relative mb-2">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou téléphone... (min 2 caractères)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
                {isLoadingClients && (
                  <Loader2
                    size={18}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin"
                  />
                )}
              </div>

              {searchTerm.length >= 2 && (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {isLoadingClients ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Recherche en cours...
                    </div>
                  ) : clients.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Aucun client trouvé
                    </div>
                  ) : (
                    clients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => handleClientExistantSelect(client)}
                        className="w-full text-left p-2 rounded hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                      >
                        <p className="font-medium">
                          {client.prenom} {client.nom}
                        </p>
                        <p className="text-sm text-gray-600">{client.telephone}</p>
                        {client.points_fidelite > 0 && (
                          <p className="text-sm text-green-600">
                            {client.points_fidelite} points
                          </p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}

              {searchTerm.length < 2 && searchTerm.length > 0 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  Tapez au moins 2 caractères pour rechercher
                </p>
              )}
            </div>
          )}

          {/* Nouveau client */}
          {mode === 'nouveau' && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Nom (optionnel)"  
                value={nouveauClient.nom}
                onChange={(e) =>
                  setNouveauClient({ ...nouveauClient, nom: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Prénom (optionnel)"  
                value={nouveauClient.prenom}
                onChange={(e) =>
                  setNouveauClient({ ...nouveauClient, prenom: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Téléphone *"
                value={nouveauClient.telephone}
                onChange={(e) =>
                  setNouveauClient({ ...nouveauClient, telephone: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email (optionnel)"
                value={nouveauClient.email}
                onChange={(e) =>
                  setNouveauClient({ ...nouveauClient, email: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleNouveauClientSubmit}
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 flex items-center justify-center gap-2 font-medium shadow"
              >
                <UserPlus size={18} />
                Ajouter ce client
              </button>
            </div>
          )}

          {/* Client anonyme */}
          {mode === 'anonyme' && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Nom (optionnel)"  
                value={clientAnonyme.nom}
                onChange={(e) =>
                  setClientAnonyme({ ...clientAnonyme, nom: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Téléphone *"  
                value={clientAnonyme.telephone}
                onChange={(e) =>
                  setClientAnonyme({ ...clientAnonyme, telephone: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleClientAnonymeSubmit}
                className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600 font-medium shadow"
              >
                Continuer sans enregistrement
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};