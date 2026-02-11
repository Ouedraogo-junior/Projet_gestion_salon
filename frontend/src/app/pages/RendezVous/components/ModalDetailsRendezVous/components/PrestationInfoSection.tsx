// src/app/pages/RendezVous/components/ModalDetailsRendezVous/components/PrestationInfoSection.tsx

import React from 'react';
import { Scissors, DollarSign } from 'lucide-react';
import type { TypePrestation } from '../../../../../../types/prestation.types';

// interface TypePrestation {
//   id: number;
//   nom: string;
//   description?: string | null;
//   prix_base: number;
//   duree_estimee_minutes: number;
// }

interface Props {
  prestations: TypePrestation[];
  prixEstime: number | null;
}

export const PrestationInfoSection: React.FC<Props> = ({ prestations, prixEstime }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  if (!prestations || prestations.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500 uppercase mb-2 sm:mb-3">
        {prestations.length > 1 ? 'Prestations' : 'Prestation'}
      </h3>
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
        {prestations.map((prestation, index) => (
          <div 
            key={prestation.id} 
            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
              index > 0 ? 'pt-3 border-t border-gray-200' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <Scissors className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">{prestation.nom}</div>
                {prestation.description && (
                  <div className="text-sm text-gray-600">{prestation.description}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-8 sm:ml-0">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">
                {formatCurrency(Number(prestation.prix_base))} FCFA
              </span>
            </div>
          </div>
        ))}
        
        {prestations.length > 1 && prixEstime && (
          <div className="pt-3 border-t-2 border-gray-300 flex justify-between items-center">
            <span className="font-medium text-gray-700">Total estimé</span>
            <span className="text-lg font-bold text-orange-600">
              {formatCurrency(Number(prixEstime))} FCFA
            </span>
          </div>
        )}
      </div>
    </div>
  );
};