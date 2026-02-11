import React, { useState } from 'react';
import { Plus, X, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { prestationApi } from '../../../../../services/prestationApi';
import { userApi } from '../../../../../services/userApi';
import type { PrestationSelectionnee } from '../../../../../types/rendezVous.types';

interface Props {
  prestations: PrestationSelectionnee[];
  onChange: (prestations: PrestationSelectionnee[]) => void;
  prestationPrincipaleId: number; // Pour éviter de l'ajouter en double
}

export const SelecteurPrestations: React.FC<Props> = ({
  prestations,
  onChange,
  prestationPrincipaleId,
}) => {
  const [showSelector, setShowSelector] = useState(false);

  // Charger les prestations disponibles
  const { data: prestationsDisponibles } = useQuery({
    queryKey: ['prestations-actives'],
    queryFn: () => prestationApi.getAllActive(),
    select: (data) => data.data || [],
  });

  // Charger les coiffeurs
  const { data: coiffeurs } = useQuery({
    queryKey: ['coiffeurs'],
    queryFn: () => userApi.getCoiffeurs(),
    select: (data) => data.data || [],
  });

  const prestationsFiltered = prestationsDisponibles?.filter(
    (p) =>
      p.id !== prestationPrincipaleId &&
      !prestations.some((ps) => ps.id === p.id)
  );

  const handleAjouter = (prestationId: number) => {
    const prestation = prestationsDisponibles?.find((p) => p.id === prestationId);
    if (!prestation) return;

    const nouvelle: PrestationSelectionnee = {
      id: prestation.id,
      nom: prestation.nom,
      prix_unitaire: prestation.prix_base,
      duree_minutes: prestation.duree_estimee_minutes || 60,
      coiffeur_id: undefined,
    };

    onChange([...prestations, nouvelle]);
    setShowSelector(false);
  };

  const handleSupprimer = (index: number) => {
    onChange(prestations.filter((_, i) => i !== index));
  };

  const handleUpdateCoiffeur = (index: number, coiffeurId: number | undefined) => {
    const updated = [...prestations];
    updated[index] = { ...updated[index], coiffeur_id: coiffeurId };
    onChange(updated);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  return (
    <div className="space-y-3">
      {/* Liste des prestations ajoutées */}
      {prestations.map((prestation, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-lg p-3 space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="font-medium text-gray-900">{prestation.nom}</div>
              <div className="text-sm text-gray-600 mt-1">
                {formatCurrency(prestation.prix_unitaire)} FCFA • {prestation.duree_minutes} min
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSupprimer(index)}
              className="text-red-600 hover:text-red-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sélection du coiffeur */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <User className="w-3 h-3 inline mr-1" />
              Coiffeur (optionnel)
            </label>
            <select
              value={prestation.coiffeur_id || ''}
              onChange={(e) =>
                handleUpdateCoiffeur(
                  index,
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Aucun coiffeur assigné</option>
              {coiffeurs?.map((coiffeur) => (
                <option key={coiffeur.id} value={coiffeur.id}>
                  {coiffeur.prenom} {coiffeur.nom}
                  {coiffeur.specialite && ` (${coiffeur.specialite})`}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}

      {/* Bouton ajouter */}
      {!showSelector ? (
        <button
          type="button"
          onClick={() => setShowSelector(true)}
          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-orange-500 hover:text-orange-600 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter une prestation
        </button>
      ) : (
        <div className="border border-gray-300 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Sélectionner une prestation
            </span>
            <button
              type="button"
              onClick={() => setShowSelector(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto">
            {prestationsFiltered && prestationsFiltered.length > 0 ? (
              prestationsFiltered.map((prestation) => (
                <button
                  key={prestation.id}
                  type="button"
                  onClick={() => handleAjouter(prestation.id)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition"
                >
                  <div className="font-medium text-gray-900 text-sm">
                    {prestation.nom}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatCurrency(prestation.prix_base)} FCFA • {prestation.duree_estimee_minutes} min
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-3">
                Toutes les prestations ont été ajoutées
              </p>
            )}
          </div>
        </div>
      )}

      {prestations.length > 0 && (
        <div className="text-xs text-gray-500">
          {prestations.length} prestation{prestations.length > 1 ? 's' : ''} supplémentaire{prestations.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};