// src/app/pages/RendezVous/components/ModalDetailsRendezVous/components/CoiffeurInfoSection.tsx

import React from 'react';
import { Scissors } from 'lucide-react';

interface Coiffeur {
  id: number;
  nom: string;
  prenom: string;
  specialite?: string;
}

interface Props {
  coiffeur?: Coiffeur;
  coiffeurs?: Coiffeur[];
}

export const CoiffeurInfoSection: React.FC<Props> = ({ coiffeur, coiffeurs }) => {
  if (!coiffeur && (!coiffeurs || coiffeurs.length === 0)) {
    return null;
  }

  const hasMultipleCoiffeurs = coiffeurs && coiffeurs.length > 1;

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500 uppercase mb-2 sm:mb-3">
        {hasMultipleCoiffeurs ? 'Coiffeurs' : 'Coiffeur'}
      </h3>
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
        {coiffeurs && coiffeurs.length > 0 ? (
          coiffeurs.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <Scissors className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">
                  {c.prenom} {c.nom}
                </div>
                {c.specialite && (
                  <div className="text-sm text-gray-600">{c.specialite}</div>
                )}
              </div>
            </div>
          ))
        ) : coiffeur ? (
          <div className="flex items-center gap-3">
            <Scissors className="w-5 h-5 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900">
                {coiffeur.prenom} {coiffeur.nom}
              </div>
              {coiffeur.specialite && (
                <div className="text-sm text-gray-600">{coiffeur.specialite}</div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};