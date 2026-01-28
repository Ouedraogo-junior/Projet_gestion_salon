// src/app/pages/prestations/components/PrestationCard.tsx

import React from 'react';
import { Edit2, Trash2, Clock, Eye, EyeOff, GripVertical } from 'lucide-react';
import type { TypePrestation } from '../../../../types/prestation.types';

interface PrestationCardProps {
  prestation: TypePrestation;
  onEdit: (prestation: TypePrestation) => void;
  onDelete: (id: number) => void;
  onToggleActif: (id: number) => void;
  isDragging?: boolean;
}

export const PrestationCard: React.FC<PrestationCardProps> = ({
  prestation,
  onEdit,
  onDelete,
  onToggleActif,
  isDragging = false,
}) => {
  const formatPrix = (prix: number) => {
    return new Intl.NumberFormat('fr-FR').format(prix) + ' FCFA';
  };

  const formatDuree = (minutes: number | null) => {
    if (!minutes) return 'Non définie';
    const heures = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (heures > 0 && mins > 0) return `${heures}h ${mins}min`;
    if (heures > 0) return `${heures}h`;
    return `${mins}min`;
  };

  return (
    <div
      className={`bg-white rounded-xl border-2 hover:shadow-lg transition-all duration-300 group ${
        isDragging ? 'shadow-2xl scale-105 rotate-2' : ''
      } ${prestation.actif ? 'border-gray-200' : 'border-gray-300 opacity-60'}`}
    >
      {/* Header avec drag handle */}
      <div className="p-5 border-b border-gray-100 flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-1 cursor-move text-gray-400 hover:text-gray-600 transition">
            <GripVertical size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{prestation.nom}</h3>
            {prestation.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{prestation.description}</p>
            )}
          </div>
        </div>

        {/* Badge statut */}
        <div>
          {prestation.actif ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Actif
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              Inactif
            </span>
          )}
        </div>
      </div>

      {/* Détails */}
      <div className="p-5 space-y-3">
        {/* Prix */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Prix de base</span>
          <span className="text-xl font-bold text-purple-600">{formatPrix(prestation.prix_base)}</span>
        </div>

        {/* Durée */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Clock size={16} />
            Durée estimée
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {formatDuree(prestation.duree_estimee_minutes)}
          </span>
        </div>

        {/* Ordre */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Position</span>
          <span className="text-sm font-semibold text-gray-900">#{prestation.ordre + 1}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 rounded-b-xl flex gap-2 border-t border-gray-100">
        {/* Activer/Désactiver */}
        <button
          onClick={() => onToggleActif(prestation.id)}
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            prestation.actif
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
          title={prestation.actif ? 'Désactiver' : 'Activer'}
        >
          {prestation.actif ? <EyeOff size={18} /> : <Eye size={18} />}
          {prestation.actif ? 'Désactiver' : 'Activer'}
        </button>

        {/* Modifier */}
        <button
          onClick={() => onEdit(prestation)}
          className="px-4 py-2.5 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-all flex items-center justify-center gap-2"
          title="Modifier"
        >
          <Edit2 size={18} />
          Modifier
        </button>

        {/* Supprimer */}
        <button
          onClick={() => {
            if (confirm(`Voulez-vous vraiment supprimer "${prestation.nom}" ?`)) {
              onDelete(prestation.id);
            }
          }}
          className="px-4 py-2.5 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-all"
          title="Supprimer"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};