// src/app/pages/Ventes/components/VenteSuccessModal.tsx

import React from 'react';
import { CheckCircle, Printer, X } from 'lucide-react';

interface VenteSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  numeroFacture: string;
  venteId: number;
  onPrint: () => void;
}

export const VenteSuccessModal: React.FC<VenteSuccessModalProps> = ({
  isOpen,
  onClose,
  numeroFacture,
  venteId,
  onPrint,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-scale-in">
        {/* Icône de succès */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Titre */}
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
          Vente enregistrée !
        </h2>

        {/* Message */}
        <p className="text-center text-gray-600 mb-1">
          La vente a été enregistrée avec succès
        </p>
        <p className="text-center font-semibold text-lg mb-6 text-blue-600">
          Facture N° {numeroFacture}
        </p>

        {/* Boutons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onPrint();
              onClose();
            }}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
          >
            <Printer size={20} />
            Imprimer le reçu
          </button>
          
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center justify-center gap-2 font-medium"
          >
            <X size={20} />
            Fermer
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};