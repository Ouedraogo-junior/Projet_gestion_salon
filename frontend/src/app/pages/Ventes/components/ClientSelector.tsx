// src/app/components/ventes/ClientSelector.tsx

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

  // Charger les clients quand on tape dans la recherche
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
    setSearchTerm(''); // Réinitialiser la recherche
  };

  const handleNouveauClientSubmit = () => {
    if (!nouveauClient.nom || !nouveauClient.prenom || !nouveauClient.telephone) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    onClientSelect({ nouveau_client: nouveauClient });
  };

  const handleClientAnonymeSubmit = () => {
    if (!clientAnonyme.nom) {
      alert('Le nom est requis');
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
        <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
          <div>
            <p className="font-medium">
              {clientSelectionne.prenom} {clientSelectionne.nom}
            </p>
            <p className="text-sm text-gray-600">{clientSelectionne.telephone}</p>
            {clientSelectionne.points_fidelite > 0 && (
              <p className="text-sm text-green-600">
                {clientSelectionne.points_fidelite} points
              </p>
            )}
          </div>
          <button
            onClick={resetSelection}
            className="text-red-500 hover:text-red-700"
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <>
          {/* Sélection du mode */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setMode('existant')}
              className={`flex-1 py-2 px-3 rounded text-sm ${
                mode === 'existant'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Existant
            </button>
            <button
              onClick={() => setMode('nouveau')}
              className={`flex-1 py-2 px-3 rounded text-sm ${
                mode === 'nouveau'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Nouveau
            </button>
            <button
              onClick={() => setMode('anonyme')}
              className={`flex-1 py-2 px-3 rounded text-sm ${
                mode === 'anonyme'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700'
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
                  className="w-full pl-10 pr-3 py-2 border rounded"
                />
                {isLoadingClients && (
                  <Loader2
                    size={18}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin"
                  />
                )}
              </div>

              {/* Résultats de recherche */}
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
                        className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors"
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
                placeholder="Nom *"
                value={nouveauClient.nom}
                onChange={(e) =>
                  setNouveauClient({ ...nouveauClient, nom: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Prénom *"
                value={nouveauClient.prenom}
                onChange={(e) =>
                  setNouveauClient({ ...nouveauClient, prenom: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="tel"
                placeholder="Téléphone *"
                value={nouveauClient.telephone}
                onChange={(e) =>
                  setNouveauClient({ ...nouveauClient, telephone: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="email"
                placeholder="Email (optionnel)"
                value={nouveauClient.email}
                onChange={(e) =>
                  setNouveauClient({ ...nouveauClient, email: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
              />
              <button
                onClick={handleNouveauClientSubmit}
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 flex items-center justify-center gap-2"
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
                placeholder="Nom *"
                value={clientAnonyme.nom}
                onChange={(e) =>
                  setClientAnonyme({ ...clientAnonyme, nom: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="tel"
                placeholder="Téléphone (optionnel)"
                value={clientAnonyme.telephone}
                onChange={(e) =>
                  setClientAnonyme({ ...clientAnonyme, telephone: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
              />
              <button
                onClick={handleClientAnonymeSubmit}
                className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
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