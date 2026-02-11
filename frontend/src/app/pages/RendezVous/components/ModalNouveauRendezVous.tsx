// src/app/pages/RendezVous/components/ModalNouveauRendezVous.tsx

import React, { useState, useEffect } from 'react';
import { X, Search, User, Calendar, Clock, Scissors, DollarSign, Plus, Mail, Phone, AlertCircle } from 'lucide-react';
import { useRendezVous } from '../../../../hooks/useRendezVous';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '../../../../services/clientApi';
import { userApi } from '../../../../services/userApi';
import { prestationApi } from '../../../../services/prestationApi';
import { ModalConfirmationAcompte } from './ModalConfirmationAcompte';
import { PrestationMultiSelectRDV } from './PrestationMultiSelectRDV';
import type { CreateRendezVousGerantDTO } from '../../../../types/rendezVous.types';
import type { CreateClientDTO, Client } from '../../../../types/client.types';
import type { TypePrestation } from '../../../../types/prestation.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalNouveauRendezVous: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const { create, isCreating } = useRendezVous();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedPrestations, setSelectedPrestations] = useState<TypePrestation[]>([]);
  const [showConfirmationAcompte, setShowConfirmationAcompte] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<CreateRendezVousGerantDTO | null>(null);
  
  const [formData, setFormData] = useState<CreateRendezVousGerantDTO>({
    client_id: 0,
    type_prestation_ids: [],
    date_heure: '',
    duree_minutes: 60,
    statut: 'en_attente',
    acompte_demande: false,
    acompte_montant: undefined,
    acompte_paye: false,
    mode_paiement: undefined,
    reference_transaction: undefined,
    coiffeur_ids: [],
  });

  const [newClientData, setNewClientData] = useState<CreateClientDTO>({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    source: 'gerant',
  });

  const [errorMessage, setErrorMessage] = useState<string>('');

  // Recherche de clients
  const { data: clients, isLoading: isSearching } = useQuery({
    queryKey: ['clients-search', searchTerm],
    queryFn: () => clientApi.searchClients(searchTerm),
    enabled: searchTerm.length >= 2 && !showCreateClient,
    select: (data) => data.data || [],
  });

  // Récupérer les coiffeurs
  const { data: coiffeurs } = useQuery({
    queryKey: ['coiffeurs'],
    queryFn: () => userApi.getCoiffeurs(),
    select: (data) => data.data || [],
  });

  // Récupérer les prestations
  const { data: prestations } = useQuery({
    queryKey: ['prestations'],
    queryFn: () => prestationApi.getAllActive(),
    select: (data) => data.data || [],
  });

  // Mutation pour créer un client
  const createClientMutation = useMutation({
    mutationFn: (data: CreateClientDTO) => clientApi.createClient(data),
    onSuccess: (response) => {
      const newClient = response.data;
      setSelectedClient(newClient);
      setFormData({ ...formData, client_id: newClient.id });
      setShowCreateClient(false);
      setSearchTerm(`${newClient.prenom} ${newClient.nom} - ${newClient.telephone}`);
      setErrorMessage('');
      queryClient.invalidateQueries({ queryKey: ['clients-search'] });
    },
    onError: (error: any) => {
      console.error('Erreur création client:', error);
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (errors.telephone) {
          setErrorMessage('Ce numéro de téléphone existe déjà. Recherchez le client existant.');
        } else {
          const firstError = Object.values(errors)[0];
          setErrorMessage(Array.isArray(firstError) ? firstError[0] : 'Erreur de validation');
        }
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Erreur lors de la création du client');
      }
    },
  });

  // Calculer le prix total
  const prixTotal = selectedPrestations.reduce((sum, p) => sum + (Number(p.prix_base) || 0), 0);

  // Calculer la durée totale
  const dureeTotal = selectedPrestations.reduce((sum, p) => sum + (Number(p.duree_estimee_minutes) || 0), 0);

  // Calculer l'acompte total requis
  const calculerAcompteTotal = (): number => {
    return selectedPrestations.reduce((sum, prestation) => {
      if (!prestation.acompte_requis) return sum;
      
      if (prestation.acompte_montant) {
        return sum + Number(prestation.acompte_montant);
      }
      
      if (prestation.acompte_pourcentage) {
        return sum + Math.round((Number(prestation.prix_base) * Number(prestation.acompte_pourcentage)) / 100);
      }
      
      return sum;
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id || formData.type_prestation_ids.length === 0 || !formData.date_heure) {
      return;
    }

    const dataToSend: CreateRendezVousGerantDTO = {
      ...formData,
      duree_minutes: formData.duree_minutes || dureeTotal,
      prix_estime: formData.prix_estime || prixTotal,
    };

    // Vérifier si l'acompte a été modifié
    const acompteRequis = calculerAcompteTotal();
    const aDemandeAcompte = selectedPrestations.some(p => p.acompte_requis);
    
    if (aDemandeAcompte && acompteRequis > 0) {
      const acompteModifie = formData.acompte_montant || 0;

      if (acompteModifie !== acompteRequis) {
        setPendingSubmitData(dataToSend);
        setShowConfirmationAcompte(true);
        return;
      }
    }

    proceedWithCreation(dataToSend);
  };

  const proceedWithCreation = (data: CreateRendezVousGerantDTO) => {
    create(data, {
      onSuccess: () => {
        onSuccess();
        resetForm();
        setShowConfirmationAcompte(false);
        setPendingSubmitData(null);
      },
    });
  };

  const handleConfirmAcompte = () => {
    if (pendingSubmitData) {
      proceedWithCreation(pendingSubmitData);
    }
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    
    let telephone = newClientData.telephone.replace(/[^0-9]/g, '');
    if (telephone.length === 8) {
      telephone = `+226${telephone}`;
    } else if (!telephone.startsWith('+226')) {
      telephone = `+226${telephone}`;
    }

    createClientMutation.mutate({
      ...newClientData,
      telephone,
    });
  };

  const resetForm = () => {
    setFormData({
      client_id: 0,
      type_prestation_ids: [],
      date_heure: '',
      duree_minutes: 60,
      statut: 'en_attente',
      acompte_demande: false,
      acompte_montant: undefined,
      acompte_paye: false,
      coiffeur_ids: [],
    });
    setSearchTerm('');
    setSelectedClient(null);
    setSelectedPrestations([]);
    setShowCreateClient(false);
    setErrorMessage('');
    setNewClientData({
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      source: 'gerant',
    });
  };

  const handlePrestationsChange = (prestations: TypePrestation[]) => {
    setSelectedPrestations(prestations);
    
    const ids = prestations.map(p => p.id);
    
    // ✅ Convertir prix_base en nombre
    const prixTotal = prestations.reduce((sum, p) => {
      return sum + (Number(p.prix_base) || 0);
    }, 0);
    
    const dureeTotal = prestations.reduce((sum, p) => {
      return sum + (Number(p.duree_estimee_minutes) || 0);
    }, 0);
    
    const aDemandeAcompte = prestations.some(p => p.acompte_requis);
    
    const acompteTotal = prestations.reduce((sum, prestation) => {
      if (!prestation.acompte_requis) return sum;
      
      if (prestation.acompte_montant) {
        return sum + Number(prestation.acompte_montant);
      }
      
      if (prestation.acompte_pourcentage) {
        return sum + Math.round((Number(prestation.prix_base) * Number(prestation.acompte_pourcentage)) / 100);
      }
      
      return sum;
    }, 0);
    
    setFormData({
      ...formData,
      type_prestation_ids: ids,
      duree_minutes: dureeTotal || 60,
      prix_estime: prixTotal || undefined,
      acompte_demande: aDemandeAcompte,
      acompte_montant: acompteTotal > 0 ? acompteTotal : undefined,
      acompte_paye: false,
    });
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setFormData({ ...formData, client_id: client.id });
    setSearchTerm(`${client.prenom} ${client.nom} - ${client.telephone}`);
  };

  const handleShowCreateForm = () => {
    setShowCreateClient(true);
    const cleanSearch = searchTerm.replace(/[^0-9]/g, '');
    if (cleanSearch.length === 8) {
      setNewClientData({ ...newClientData, telephone: cleanSearch });
    }
  };

  const handleToggleAllCoiffeurs = (checked: boolean) => {
    if (checked) {
      const allIds = coiffeurs?.map(c => c.id) || [];
      setFormData({ ...formData, coiffeur_ids: allIds });
    } else {
      setFormData({ ...formData, coiffeur_ids: [] });
    }
  };

  const allCoiffeursSelected = coiffeurs && coiffeurs.length > 0 && 
    formData.coiffeur_ids?.length === coiffeurs.length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Recalculer totaux quand les prestations changent
  useEffect(() => {
    if (selectedPrestations.length > 0) {
      const acompteTotal = calculerAcompteTotal();
      const aDemandeAcompte = selectedPrestations.some(p => p.acompte_requis);
      
      setFormData(prev => ({
        ...prev,
        duree_minutes: dureeTotal || 60,
        prix_estime: prixTotal || undefined,
        acompte_demande: aDemandeAcompte,
        acompte_montant: acompteTotal > 0 ? acompteTotal : undefined,
      }));
    }
  }, [selectedPrestations]);

  if (!isOpen) return null;

  const acompteRequis = calculerAcompteTotal();
  const aDemandeAcompte = selectedPrestations.some(p => p.acompte_requis);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold text-gray-900">Nouveau rendez-vous</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Recherche client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Client *
              </label>
              
              {!showCreateClient ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (selectedClient) {
                          setSelectedClient(null);
                          setFormData({ ...formData, client_id: 0 });
                        }
                      }}
                      placeholder="Rechercher par nom, prénom ou téléphone..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      disabled={!!selectedClient}
                    />
                    {selectedClient && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClient(null);
                          setSearchTerm('');
                          setFormData({ ...formData, client_id: 0 });
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Résultats de recherche */}
                  {searchTerm.length >= 2 && !selectedClient && (
                    <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                      {isSearching ? (
                        <div className="px-4 py-3 text-center text-gray-500">
                          Recherche en cours...
                        </div>
                      ) : clients && clients.length > 0 ? (
                        clients.map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => handleClientSelect(client)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">
                              {client.prenom} {client.nom}
                            </div>
                            <div className="text-sm text-gray-600">{client.telephone}</div>
                            {client.email && (
                              <div className="text-sm text-gray-500">{client.email}</div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <p className="text-gray-500 mb-3">Aucun client trouvé</p>
                          <button
                            type="button"
                            onClick={handleShowCreateForm}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                          >
                            <Plus className="w-4 h-4" />
                            Créer un nouveau client
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Client sélectionné */}
                  {selectedClient && (
                    <div className="mt-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {selectedClient.prenom} {selectedClient.nom}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {selectedClient.telephone}
                          </div>
                          {selectedClient.email && (
                            <div className="text-sm text-gray-500">{selectedClient.email}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Formulaire création client */
                <div className="space-y-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Nouveau client</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateClient(false);
                        setErrorMessage('');
                        setNewClientData({
                          nom: '',
                          prenom: '',
                          telephone: '',
                          email: '',
                          source: 'gerant',
                        });
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Annuler
                    </button>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{errorMessage}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={newClientData.prenom}
                        onChange={(e) => {
                          setNewClientData({ ...newClientData, prenom: e.target.value });
                          setErrorMessage('');
                        }}
                        placeholder="Optionnel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={newClientData.nom}
                        onChange={(e) => {
                          setNewClientData({ ...newClientData, nom: e.target.value });
                          setErrorMessage('');
                        }}
                        placeholder="Optionnel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Téléphone * <span className="text-xs text-gray-500">(8 chiffres)</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                        +226
                      </div>
                      <input
                        type="tel"
                        value={newClientData.telephone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 8);
                          setNewClientData({ ...newClientData, telephone: value });
                          setErrorMessage('');
                        }}
                        placeholder="XX XX XX XX"
                        required
                        maxLength={8}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={newClientData.email}
                      onChange={(e) => {
                        setNewClientData({ ...newClientData, email: e.target.value });
                        setErrorMessage('');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateClient}
                    disabled={
                      newClientData.telephone.length !== 8 ||
                      createClientMutation.isPending
                    }
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createClientMutation.isPending ? 'Création...' : 'Créer et continuer'}
                  </button>
                </div>
              )}
            </div>

            {/* Prestations (MULTI-SÉLECTION) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Scissors className="w-4 h-4 inline mr-1" />
                Prestations * <span className="text-xs text-gray-500">(Sélection multiple)</span>
              </label>
              <PrestationMultiSelectRDV
                selectedPrestations={selectedPrestations}
                onChange={handlePrestationsChange}
              />
              
              {/* Résumé des prestations */}
              {selectedPrestations.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {selectedPrestations.length} prestation(s) sélectionnée(s)
                    </span>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{formatCurrency(prixTotal)} FCFA</div>
                      <div className="text-xs text-gray-600">{dureeTotal} minutes</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section Acompte */}
            {aDemandeAcompte && acompteRequis > 0 && (
              <div className="space-y-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <h3 className="font-medium text-gray-900">Acompte requis</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Acompte requis (lecture seule) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Acompte défini (total)
                    </label>
                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 font-medium">
                      {formatCurrency(acompteRequis)} FCFA
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Somme des acomptes de {selectedPrestations.filter(p => p.acompte_requis).length} prestation(s)
                    </p>
                  </div>

                  {/* Acompte modifiable */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Acompte à enregistrer *
                    </label>
                    <input
                      type="number"
                      value={formData.acompte_montant || ''}
                      onChange={(e) => {
                        const value = e.target.value ? Number(e.target.value) : undefined;
                        setFormData({ ...formData, acompte_montant: value });
                      }}
                      min="0"
                      max={formData.prix_estime || prixTotal}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Avertissement si modification */}
                {formData.acompte_montant !== undefined && formData.acompte_montant !== acompteRequis && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      ⚠️ L'acompte à enregistrer est différent de l'acompte défini. 
                      Une confirmation sera demandée avant la création du rendez-vous.
                    </p>
                  </div>
                )}

                {/* Acompte payé */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="acompte_paye"
                    checked={formData.acompte_paye || false}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      acompte_paye: e.target.checked,
                      mode_paiement: e.target.checked ? formData.mode_paiement : undefined,
                      reference_transaction: e.target.checked ? formData.reference_transaction : undefined,
                    })}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="acompte_paye" className="text-sm font-medium text-gray-700">
                    Acompte déjà payé
                  </label>
                </div>

                {/* Champs de paiement si acompte payé */}
                {formData.acompte_paye && (
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mode de paiement *
                      </label>
                      <select
                        value={formData.mode_paiement || ''}
                        onChange={(e) => setFormData({ ...formData, mode_paiement: e.target.value as any })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="especes">Espèces</option>
                        <option value="orange_money">Orange Money</option>
                        <option value="carte_bancaire">Carte bancaire</option>
                        <option value="moov_money">Moov Money</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Référence transaction
                      </label>
                      <input
                        type="text"
                        value={formData.reference_transaction || ''}
                        onChange={(e) => setFormData({ ...formData, reference_transaction: e.target.value })}
                        placeholder="Optionnel"
                        maxLength={100}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Date et heure */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date_heure.split('T')[0] || ''}
                  onChange={(e) => {
                    const time = formData.date_heure.split('T')[1] || '09:00';
                    setFormData({ ...formData, date_heure: `${e.target.value}T${time}` });
                  }}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Heure *
                </label>
                <input
                  type="time"
                  value={formData.date_heure.split('T')[1] || ''}
                  onChange={(e) => {
                    const date = formData.date_heure.split('T')[0] || new Date().toISOString().split('T')[0];
                    setFormData({ ...formData, date_heure: `${date}T${e.target.value}` });
                  }}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Coiffeurs (sélection multiple) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coiffeurs (optionnel)
              </label>
              <div className="space-y-2 border border-gray-300 rounded-lg p-3">
                {coiffeurs && coiffeurs.length > 0 && (
                  <label className="flex items-center gap-3 p-2 bg-gray-50 rounded border-b border-gray-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allCoiffeursSelected}
                      onChange={(e) => handleToggleAllCoiffeurs(e.target.checked)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Tout sélectionner
                    </span>
                  </label>
                )}

                <div className="max-h-48 overflow-y-auto space-y-1">
                  {coiffeurs?.map((coiffeur) => (
                    <label
                      key={coiffeur.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.coiffeur_ids?.includes(coiffeur.id) || false}
                        onChange={(e) => {
                          const ids = formData.coiffeur_ids || [];
                          setFormData({
                            ...formData,
                            coiffeur_ids: e.target.checked
                              ? [...ids, coiffeur.id]
                              : ids.filter(id => id !== coiffeur.id)
                          });
                        }}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-900">
                        {coiffeur.prenom} {coiffeur.nom}
                        {coiffeur.specialite && (
                          <span className="text-gray-500 text-xs ml-2">({coiffeur.specialite})</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {formData.coiffeur_ids && formData.coiffeur_ids.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  {formData.coiffeur_ids.length} coiffeur(s) sélectionné(s)
                </p>
              )}
            </div>

            {/* Durée et Prix */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée (minutes) *
                </label>
                <input
                  type="number"
                  value={formData.duree_minutes || dureeTotal || ''}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : dureeTotal;
                    setFormData({ ...formData, duree_minutes: value });
                  }}
                  min="15"
                  step="15"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Durée calculée: {dureeTotal} min</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Prix estimé (FCFA)
                </label>
                <input
                  type="number"
                  value={formData.prix_estime || prixTotal || ''}
                  onChange={(e) => setFormData({ ...formData, prix_estime: e.target.value ? Number(e.target.value) : undefined })}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Prix calculé: {formatCurrency(prixTotal)} FCFA</p>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value || undefined })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder="Notes ou instructions particulières..."
              />
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="en_attente">En attente</option>
                <option value="confirme">Confirmé</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={
                  isCreating || 
                  !formData.client_id || 
                  formData.type_prestation_ids.length === 0 ||
                  !formData.date_heure ||
                  !formData.duree_minutes ||
                  formData.duree_minutes < 15 ||
                  (aDemandeAcompte && !formData.acompte_montant) ||
                  (formData.acompte_paye && !formData.mode_paiement)
                }
                className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Création...' : 'Créer le rendez-vous'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmation d'acompte */}
      {aDemandeAcompte && acompteRequis > 0 && (
        <ModalConfirmationAcompte
          isOpen={showConfirmationAcompte}
          onClose={() => {
            setShowConfirmationAcompte(false);
            setPendingSubmitData(null);
          }}
          onConfirm={handleConfirmAcompte}
          acompteRequis={acompteRequis}
          acompteModifie={formData.acompte_montant || 0}
          nomPrestation={`${selectedPrestations.length} prestation(s)`}
        />
      )}
    </>
  );
};