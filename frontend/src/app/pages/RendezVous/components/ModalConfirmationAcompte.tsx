// src/app/pages/RendezVous/components/ModalConfirmationAcompte.tsx

import React from 'react';
import { AlertTriangle, X, DollarSign } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  acompteRequis: number;
  acompteModifie: number;
  nomPrestation: string;
}

export const ModalConfirmationAcompte: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  acompteRequis,
  acompteModifie,
  nomPrestation,
}) => {
  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const difference = acompteRequis - acompteModifie;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Confirmation acompte modifié</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Info prestation */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Prestation</p>
            <p className="font-medium text-gray-900">{nomPrestation}</p>
          </div>

          {/* Comparaison acomptes */}
          <div className="space-y-3">
            {/* Acompte requis */}
            <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Acompte requis</p>
                  <p className="font-bold text-gray-900">{formatCurrency(acompteRequis)} FCFA</p>
                </div>
              </div>
            </div>

            {/* Flèche */}
            <div className="flex justify-center">
              <div className="text-2xl text-gray-400">↓</div>
            </div>

            {/* Acompte modifié */}
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Acompte à enregistrer</p>
                  <p className="font-bold text-gray-900">{formatCurrency(acompteModifie)} FCFA</p>
                </div>
              </div>
            </div>
          </div>

          {/* Différence */}
          {difference > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Différence :</span> {formatCurrency(difference)} FCFA de moins que l'acompte requis
              </p>
            </div>
          )}

          {/* Message d'avertissement */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Vous êtes sur le point d'enregistrer ce rendez-vous avec un acompte différent de celui défini pour la prestation. 
              Voulez-vous continuer ?
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition"
          >
            Confirmer et créer
          </button>
        </div>
      </div>
    </div>
  );
};