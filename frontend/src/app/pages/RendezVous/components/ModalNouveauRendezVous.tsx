// src/app/pages/RendezVous/components/ModalNouveauRendezVous.tsx

import React, { useState } from 'react';
import { X, Search, User, Calendar, Clock, Scissors, DollarSign } from 'lucide-react';
import { useRendezVous } from '../../../../hooks/useRendezVous';
import { useQuery } from '@tanstack/react-query';
import { clientApi } from '../../../../services/clientApi';
import { userApi } from '../../../../services/userApi';
import { prestationApi } from '../../../../services/prestationApi';
import type { CreateRendezVousGerantDTO } from '../../../../types/rendezVous.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalNouveauRendezVous: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { create, isCreating } = useRendezVous();
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CreateRendezVousGerantDTO>({
    client_id: 0,
    type_prestation_id: 0,
    date_heure: '',
    duree_minutes: 60,
    statut: 'en_attente',
  });

  // Récupérer la liste des clients
  const { data: clients } = useQuery({
    queryKey: ['clients', searchTerm],
    queryFn: () => clientApi.getAll({ search: searchTerm }),
    enabled: searchTerm.length > 2,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id || !formData.type_prestation_id || !formData.date_heure) {
      return;
    }

    // S'assurer que duree_minutes est toujours un nombre valide
    const dataToSend = {
      ...formData,
      duree_minutes: formData.duree_minutes || 60,
    };

    console.log('📤 Données envoyées:', dataToSend);

    create(dataToSend, {
      onSuccess: () => {
        onSuccess();
        resetForm();
      },
    });
  };

  const resetForm = () => {
    setFormData({
      client_id: 0,
      type_prestation_id: 0,
      date_heure: '',
      duree_minutes: 60,
      statut: 'en_attente',
    });
    setSearchTerm('');
  };

  const handlePrestationChange = (prestationId: number) => {
    const prestation = prestations?.find((p) => p.id === prestationId);
    setFormData({
      ...formData,
      type_prestation_id: prestationId,
      duree_minutes: prestation?.duree_estimee_minutes || 60,
      prix_estime: prestation?.prix_base || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un client par nom, prénom ou téléphone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {searchTerm.length > 2 && clients && clients.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {clients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, client_id: client.id });
                      setSearchTerm(`${client.prenom} ${client.nom} - ${client.telephone}`);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0 ${
                      formData.client_id === client.id ? 'bg-orange-50' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {client.prenom} {client.nom}
                    </div>
                    <div className="text-sm text-gray-600">{client.telephone}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Prestation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Scissors className="w-4 h-4 inline mr-1" />
              Prestation *
            </label>
            <select
              value={formData.type_prestation_id}
              onChange={(e) => handlePrestationChange(Number(e.target.value))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Sélectionner une prestation</option>
              {prestations?.map((prestation) => (
                <option key={prestation.id} value={prestation.id}>
                  {prestation.nom} - {prestation.prix_base} FCFA ({prestation.duree_estimee_minutes} min)
                </option>
              ))}
            </select>
          </div>

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

          {/* Coiffeur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coiffeur (optionnel)
            </label>
            <select
              value={formData.coiffeur_id || ''}
              onChange={(e) => setFormData({ ...formData, coiffeur_id: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Aucun coiffeur assigné</option>
              {coiffeurs?.map((coiffeur) => (
                <option key={coiffeur.id} value={coiffeur.id}>
                  {coiffeur.prenom} {coiffeur.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Durée et Prix */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée (minutes) *
              </label>
              <input
                type="number"
                value={formData.duree_minutes || ''}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : 60;
                  setFormData({ ...formData, duree_minutes: value });
                }}
                min="15"
                step="15"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Prix estimé (FCFA)
              </label>
              <input
                type="number"
                value={formData.prix_estime || ''}
                onChange={(e) => setFormData({ ...formData, prix_estime: e.target.value ? Number(e.target.value) : undefined })}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
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
                !formData.type_prestation_id || 
                !formData.date_heure ||
                !formData.duree_minutes ||
                formData.duree_minutes < 15
              }
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Création...' : 'Créer le rendez-vous'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};