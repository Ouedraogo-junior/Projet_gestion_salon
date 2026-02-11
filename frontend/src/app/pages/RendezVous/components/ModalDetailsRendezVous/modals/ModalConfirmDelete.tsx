// src/app/pages/RendezVous/components/ModalDetailsRendezVous/modals/ModalConfirmDelete.tsx

import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ModalConfirmDelete: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-[60] px-4 pb-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-lg p-5 sm:p-6 max-w-md w-full">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Supprimer le rendez-vous</h3>
        <p className="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action est irréversible.
        </p>
        <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};