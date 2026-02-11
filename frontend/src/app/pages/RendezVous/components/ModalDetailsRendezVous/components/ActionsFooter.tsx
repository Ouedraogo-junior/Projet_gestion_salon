import React from 'react';
import { CheckCircle, XCircle, Trash2, Play, DollarSign, Download } from 'lucide-react';

interface Props {
  rendezVousId: number;
  statut: string;
  onConfirmer: () => void;
  onAnnuler: () => void;
  onMarquerEnCours: () => void;
  onFinaliser: () => void;
  onSupprimer: () => void;
}

export const ActionsFooter: React.FC<Props> = ({
  rendezVousId,
  statut,
  onConfirmer,
  onAnnuler,
  onMarquerEnCours,
  onFinaliser,
  onSupprimer,
}) => {
  const canDelete = statut === 'en_attente' || statut === 'annule';
  const canAnnuler = statut === 'en_attente' || statut === 'confirme';

  const handleTelechargerRecu = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const url = `${apiUrl}/api/rendez-vous/${rendezVousId}/recu-final`;
    window.open(url, '_blank');
  };

  return (
    <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
      {/* Bouton Supprimer à gauche */}
      {canDelete && (
        <button
          onClick={onSupprimer}
          className="w-full xs:w-auto px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition flex items-center justify-center xs:justify-start gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </button>
      )}

      {/* Boutons d'actions à droite */}
      <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:ml-auto">
        {statut === 'en_attente' && (
          <>
            <button
              onClick={onAnnuler}
              className="w-full xs:w-auto px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Annuler
            </button>
            <button
              onClick={onConfirmer}
              className="w-full xs:w-auto px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Confirmer
            </button>
          </>
        )}

        {statut === 'confirme' && (
          <>
            <button
              onClick={onAnnuler}
              className="w-full xs:w-auto px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Annuler
            </button>
            <button
              onClick={onMarquerEnCours}
              className="w-full xs:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Marquer en cours
            </button>
          </>
        )}

        {statut === 'en_cours' && (
          <button
            onClick={onFinaliser}
            className="w-full xs:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition flex items-center justify-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Finaliser
          </button>
        )}

        {statut === 'termine' && (
          <button
            onClick={handleTelechargerRecu}
            className="w-full xs:w-auto px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Réimprimer le reçu final
          </button>
        )}
      </div>
    </div>
  );
};