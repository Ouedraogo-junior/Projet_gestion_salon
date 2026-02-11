// src/app/pages/RendezVous/components/ModalDetailsRendezVous/ModalDetailsRendezVous.tsx

import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import type { RendezVous } from '../../../../../types/rendezVous.types';
import { useRendezVous } from '../../../../../hooks/useRendezVous';
import { ModalFinalisationRendezVous } from '../ModalFinalisationRendezVous';

// Composants modulaires
import { ClientInfoSection } from './components/ClientInfoSection';
import { PrestationInfoSection } from './components/PrestationInfoSection';
import { CoiffeurInfoSection } from './components/CoiffeurInfoSection';
import { AcompteSection } from './components/AcompteSection';
import { ActionsFooter } from './components/ActionsFooter';
import { ModalAnnulation } from './modals/ModalAnnulation';
import { ModalConfirmDelete } from './modals/ModalConfirmDelete';
import { MontantRestantSection } from './components/MontantRestantSection';

interface Props {
  rdv: RendezVous;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalDetailsRendezVous: React.FC<Props> = ({ rdv, isOpen, onClose, onSuccess }) => {
  const { 
    confirmer, 
    annuler, 
    delete: deleteRdv, 
    marquerAcomptePaye, 
    updateAcompte,
    marquerEnCours,
  } = useRendezVous();
  console.log('RDV complet:', rdv);
  console.log('Paiements:', rdv.paiements);
  console.log('Acompte payé?', rdv.acompte_paye);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showAnnuler, setShowAnnuler] = useState(false);
  const [showFinalisation, setShowFinalisation] = useState(false);

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

  // Actions
  const handleConfirmer = () => {
    confirmer({ id: rdv.id }, {
      onSuccess: () => {
        onSuccess();
      },
    });
  };

  const handleAnnuler = (motif: string) => {
    annuler({ id: rdv.id, motif }, {
      onSuccess: () => {
        setShowAnnuler(false);
        onSuccess();
      },
    });
  };

  const handleMarquerEnCours = () => {
    marquerEnCours(rdv.id, {
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
    marquerAcomptePaye(rdv.id, {
      onSuccess: () => {
        onSuccess();
      },
    });
  };

  const handleUpdateAcompte = (montant: number) => {
    updateAcompte({ id: rdv.id, acompte_montant: montant });
    onSuccess();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 px-4 pb-0 sm:p-4">
        <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pr-2">
              <h2 className="text-base sm:text-xl font-bold text-gray-900">Détails du rendez-vous</h2>
              {getStatutBadge(rdv.statut)}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Date et heure */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 text-sm sm:text-base">{formatDate(rdv.date_heure)}</div>
                    <div className="text-sm text-gray-600">à {formatHeure(rdv.date_heure)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-700 ml-8 sm:ml-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-sm sm:text-base">{rdv.duree_minutes} min</span>
                </div>
              </div>
            </div>

            {/* Client */}
            {rdv.client && (
              <ClientInfoSection
                client={rdv.client}
                dateHeure={rdv.date_heure}
                prestationNom={rdv.typePrestation?.nom || ''}
              />
            )}

            {/* Prestations */}
            {rdv.prestations && rdv.prestations.length > 0 && (
              <PrestationInfoSection
                prestations={rdv.prestations}
                prixEstime={rdv.prix_estime}
              />
            )}

            {/* Coiffeur(s) */}
            <CoiffeurInfoSection
              coiffeur={rdv.coiffeur}
              coiffeurs={rdv.coiffeurs}
            />

            {/* Acompte */}
            <AcompteSection
              rendezVousId={rdv.id}
              acompteDemande={rdv.acompte_demande}
              acompteMontant={rdv.acompte_montant}
              acomptePaye={rdv.acompte_paye}
              statut={rdv.statut}
              prixEstime={rdv.prix_estime}
              onMarquerPaye={handleMarquerAcomptePaye}
              onUpdateMontant={handleUpdateAcompte}
            />

            {/* Montant restant */}
            <MontantRestantSection rendezVous={rdv} />
            

            {/* Notes */}
            {rdv.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-2 sm:mb-3">Notes</h3>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-gray-700">{rdv.notes}</p>
                </div>
              </div>
            )}

            {/* Motif annulation */}
            {rdv.statut === 'annule' && rdv.motif_annulation && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-2 sm:mb-3">Motif d'annulation</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                  <p className="text-gray-700">{rdv.motif_annulation}</p>
                  {rdv.date_annulation && (
                    <p className="text-sm text-gray-600 mt-2">
                      Annulé le {formatDate(rdv.date_annulation)} à {formatHeure(rdv.date_annulation)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions Footer */}
          <ActionsFooter
            rendezVousId={rdv.id}
            statut={rdv.statut}
            onConfirmer={handleConfirmer}
            onAnnuler={() => setShowAnnuler(true)}
            onMarquerEnCours={handleMarquerEnCours}
            onFinaliser={() => setShowFinalisation(true)}
            onSupprimer={() => setShowConfirmDelete(true)}
          />
        </div>
      </div>

      {/* Modals secondaires */}
      <ModalAnnulation
        isOpen={showAnnuler}
        onClose={() => setShowAnnuler(false)}
        onConfirm={handleAnnuler}
      />

      <ModalConfirmDelete
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
      />

      {/* Modal Finalisation */}
      {showFinalisation && (
        <ModalFinalisationRendezVous
          isOpen={showFinalisation}
          onClose={() => setShowFinalisation(false)}
          rendezVous={rdv}
          onSuccess={() => {
            setShowFinalisation(false);
            onSuccess();
          }}
        />
      )}
    </>
  );
};