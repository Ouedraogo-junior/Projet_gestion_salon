// src/app/pages/RendezVous/components/ListeRendezVous.tsx

import React, { useState } from 'react';
import { Clock, User, Scissors, CheckCircle, XCircle, AlertCircle, Phone, Mail, MoreVertical } from 'lucide-react';
import type { RendezVous } from '../../../../types/rendezVous.types';
import { ModalDetailsRendezVous } from './ModalDetailsRendezVous';

interface Props {
  rendezVous: RendezVous[];
  isLoading: boolean;
  onRefresh: () => void;
  selectedRdvFromSearch?: RendezVous | null; 
  onClearSelection?: () => void; 
}

export const ListeRendezVous: React.FC<Props> = ({ rendezVous, isLoading, onRefresh, selectedRdvFromSearch, onClearSelection }) => {
  const [selectedRdv, setSelectedRdv] = useState<RendezVous | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  // Ouvrir automatiquement le RDV de la recherche
  React.useEffect(() => {
    if (selectedRdvFromSearch) {
      setSelectedRdv(selectedRdvFromSearch);
      onClearSelection?.();
    }
  }, [selectedRdvFromSearch, onClearSelection]);

  const getStatutBadge = (statut: string) => {
    const configs = {
      en_attente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      confirme: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmé' },
      en_cours: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En cours' },
      termine: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Terminé' },
      annule: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulé' },
      no_show: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Absent' },
    };
    const config = configs[statut as keyof typeof configs] || configs.en_attente;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatHeure = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Chargement...</p>
      </div>
    );
  }

  if (rendezVous.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Aucun rendez-vous trouvé</p>
      </div>
    );
  }

  return (
    <>
      {/* Vue Desktop - Tableau */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Heure
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prestation
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coiffeur
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rendezVous.map((rdv) => (
                <tr
                  key={rdv.id}
                  className="hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => setSelectedRdv(rdv)}
                >
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatHeure(rdv.date_heure)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(rdv.date_heure)}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {rdv.client?.prenom} {rdv.client?.nom}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {rdv.client?.telephone}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 lg:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {rdv.typePrestation?.nom}
                    </div>
                    <div className="text-sm text-gray-500">
                      {rdv.duree_minutes} min
                    </div>
                  </td>

                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    {rdv.coiffeur ? (
                      <div className="flex items-center">
                        <Scissors className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {rdv.coiffeur.prenom} {rdv.coiffeur.nom}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Non assigné</span>
                    )}
                  </td>

                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    {getStatutBadge(rdv.statut)}
                  </td>

                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {rdv.prix_estime ? `${Number(rdv.prix_estime).toFixed(0)} FCFA` : '-'}
                    </div>
                    {rdv.acompte_demande && (
                      <div className="text-xs text-gray-500">
                        Acompte: {rdv.acompte_paye ? (
                          <span className="text-green-600 font-medium">Payé</span>
                        ) : (
                          <span className="text-orange-600 font-medium">En attente</span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === rdv.id ? null : rdv.id);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vue Mobile - Cartes */}
      <div className="md:hidden space-y-4">
        {rendezVous.map((rdv) => (
          <div
            key={rdv.id}
            className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition"
            onClick={() => setSelectedRdv(rdv)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center text-sm font-medium text-gray-900 mb-1">
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  {formatHeure(rdv.date_heure)}
                </div>
                <div className="text-xs text-gray-500 ml-6">
                  {formatDate(rdv.date_heure)}
                </div>
              </div>
              {getStatutBadge(rdv.statut)}
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">
                    {rdv.client?.prenom} {rdv.client?.nom}
                  </span>
                  <span className="text-gray-500 ml-2">{rdv.client?.telephone}</span>
                </div>
              </div>

              <div className="flex items-center">
                <Scissors className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                <div className="text-sm text-gray-900">
                  {rdv.typePrestation?.nom} <span className="text-gray-500">({rdv.duree_minutes} min)</span>
                </div>
              </div>

              {rdv.coiffeur && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="ml-6">
                    {rdv.coiffeur.prenom} {rdv.coiffeur.nom}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="text-sm font-medium text-gray-900">
                {rdv.prix_estime ? `${Number(rdv.prix_estime).toFixed(0)} FCFA` : '-'}
              </div>
              {rdv.acompte_demande && (
                <div className="text-xs">
                  Acompte: {rdv.acompte_paye ? (
                    <span className="text-green-600 font-medium">Payé</span>
                  ) : (
                    <span className="text-orange-600 font-medium">En attente</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedRdv && (
        <ModalDetailsRendezVous
          rdv={selectedRdv}
          isOpen={!!selectedRdv}
          onClose={() => setSelectedRdv(null)}
          onSuccess={() => {
            setSelectedRdv(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
};