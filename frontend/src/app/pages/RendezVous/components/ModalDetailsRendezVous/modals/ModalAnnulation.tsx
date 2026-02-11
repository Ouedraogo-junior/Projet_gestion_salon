// src/app/pages/RendezVous/components/ModalDetailsRendezVous/modals/ModalAnnulation.tsx

import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motif: string) => void;
}

export const ModalAnnulation: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  const [motif, setMotif] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!motif.trim()) return;
    onConfirm(motif);
    setMotif('');
  };

  const handleClose = () => {
    setMotif('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-[60] px-4 pb-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-lg p-5 sm:p-6 max-w-md w-full">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Annuler le rendez-vous</h3>
        <textarea
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          placeholder="Motif de l'annulation..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
        />
        <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 mt-4">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!motif.trim()}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
          >
            Confirmer l'annulation
          </button>
        </div>
      </div>
    </div>
  );
};