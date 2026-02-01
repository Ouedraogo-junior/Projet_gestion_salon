// src/app/pages/RendezVous/components/ModalDetailsRendezVous.tsx

import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Calendar, Clock, Scissors, DollarSign, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import type { RendezVous } from '../../../../types/rendezVous.types';
import { useRendezVous } from '../../../../hooks/useRendezVous';

interface Props {
  rdv: RendezVous;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalDetailsRendezVous: React.FC<Props> = ({ rdv, isOpen, onClose, onSuccess }) => {
  const { confirmer, annuler, terminer, delete: deleteRdv, marquerAcomptePaye } = useRendezVous();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showAnnuler, setShowAnnuler] = useState(false);
  const [motifAnnulation, setMotifAnnulation] = useState('');
  const [acomptePaye, setAcomptePaye] = useState(rdv.acompte_paye);

  useEffect(() => {
    setAcomptePaye(rdv.acompte_paye);
  }, [rdv.acompte_paye]);

    // LOG POUR DEBUG
  // console.log('RDV reçu dans modal:', rdv);
  // console.log('Type Prestation:', rdv.typePrestation);

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
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
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

  const handleConfirmer = () => {
    confirmer({ id: rdv.id }, {
      onSuccess: () => {
        onSuccess();
      },
    });
  };

  const handleAnnuler = () => {
    if (!motifAnnulation.trim()) return;
    
    annuler({ id: rdv.id, motif: motifAnnulation }, {
      onSuccess: () => {
        setShowAnnuler(false);
        setMotifAnnulation('');
        onSuccess();
      },
    });
  };

  const handleTerminer = () => {
    terminer(rdv.id, {
      onSuccess: () => {
        onSuccess();
      },
    });
  };

  const handleDelete = () => {
    deleteRdv(rdv.id, {
      onSuccess: () => {
        setShowConfirmDelete(false);
        onSuccess();
      },
    });
  };

  const handleMarquerAcomptePaye = () => {
    setAcomptePaye(true);
    marquerAcomptePaye(rdv.id, {
      onSuccess: () => {
        //onSuccess();
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">Détails du rendez-vous</h2>
            {getStatutBadge(rdv.statut)}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date et heure */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-orange-600" />
                <div>
                  <div className="font-medium text-gray-900">{formatDate(rdv.date_heure)}</div>
                  <div className="text-sm text-gray-600">à {formatHeure(rdv.date_heure)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-5 h-5" />
                <span className="font-medium">{rdv.duree_minutes} min</span>
              </div>
            </div>
          </div>

          {/* Client */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Client</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900">
                  {rdv.client?.prenom} {rdv.client?.nom}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{rdv.client?.telephone}</span>
              </div>
              {rdv.client?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{rdv.client.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Prestation */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Prestation</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Scissors className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{rdv.typePrestation?.nom}</div>
                    {rdv.typePrestation?.description && (
                      <div className="text-sm text-gray-600">{rdv.typePrestation.description}</div>
                    )}
                  </div>
                </div>
                {rdv.prix_estime && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900">{Number(rdv.prix_estime).toFixed(0)} FCFA</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coiffeur */}
          {rdv.coiffeur && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Coiffeur</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Scissors className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {rdv.coiffeur.prenom} {rdv.coiffeur.nom}
                    </div>
                    {rdv.coiffeur.specialite && (
                      <div className="text-sm text-gray-600">{rdv.coiffeur.specialite}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Acompte */}
          {rdv.acompte_demande && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Acompte</h3>
              <div className={`rounded-lg p-4 ${acomptePaye ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {rdv.acompte_montant ? `${Number(rdv.acompte_montant).toFixed(0)} FCFA` : '-'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {acomptePaye ? 'Payé' : 'En attente de paiement'}
                    </div>
                  </div>
                  {acomptePaye ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <button
                      onClick={handleMarquerAcomptePaye}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                    >
                      Marquer comme payé
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {rdv.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Notes</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{rdv.notes}</p>
              </div>
            </div>
          )}

          {/* Motif annulation */}
          {rdv.statut === 'annule' && rdv.motif_annulation && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Motif d'annulation</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-gray-700">{rdv.motif_annulation}</p>
                {rdv.date_annulation && (
                  <p className="text-sm text-gray-600 mt-2">
                    Annulé le {formatDate(rdv.date_annulation)} à {formatHeure(rdv.date_annulation)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Modal Annulation */}
          {showAnnuler && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Annuler le rendez-vous</h3>
                <textarea
                  value={motifAnnulation}
                  onChange={(e) => setMotifAnnulation(e.target.value)}
                  placeholder="Motif de l'annulation..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      setShowAnnuler(false);
                      setMotifAnnulation('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAnnuler}
                    disabled={!motifAnnulation.trim()}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    Confirmer l'annulation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Suppression */}
          {showConfirmDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Supprimer le rendez-vous</h3>
                <p className="text-gray-600 mb-6">
                  Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action est irréversible.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>

          <div className="flex items-center gap-3">
            {rdv.statut === 'en_attente' && (
              <>
                <button
                  onClick={() => setShowAnnuler(true)}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Annuler
                </button>
                <button
                  onClick={handleConfirmer}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirmer
                </button>
              </>
            )}

            {rdv.statut === 'confirme' && (
              <>
                <button
                  onClick={() => setShowAnnuler(true)}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Annuler
                </button>
                <button
                  onClick={handleTerminer}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marquer terminé
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};