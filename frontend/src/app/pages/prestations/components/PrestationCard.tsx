// src/app/pages/prestations/components/PrestationCard.tsx

import React from 'react';
import { Edit2, Trash2, Clock, Eye, EyeOff, GripVertical, CheckCircle, XCircle } from 'lucide-react';
import type { TypePrestation } from '../../../../types/prestation.types';

interface PrestationCardProps {
  prestation: TypePrestation;
  onEdit: (prestation: TypePrestation) => void;
  onDelete: (id: number) => void;
  onToggleActif: (id: number) => void;
  isDragging?: boolean;
}

const formatPrix = (prix: number) =>
  new Intl.NumberFormat('fr-FR').format(prix) + ' FCFA';

const formatDuree = (minutes: number | null) => {
  if (!minutes) return 'Non définie';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
};

export const PrestationCard: React.FC<PrestationCardProps> = ({
  prestation, onEdit, onDelete, onToggleActif, isDragging = false,
}) => {
  return (
    <div className={`bg-white border rounded-lg hover:border-blue-200 hover:shadow-sm transition-all overflow-hidden ${
      isDragging ? 'shadow-lg scale-[1.02]' : ''
    } ${prestation.actif ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>

      {/* Header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <div className="mt-0.5 cursor-move text-gray-300 hover:text-gray-500 transition flex-shrink-0">
          <GripVertical size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 leading-tight">{prestation.nom}</h3>
            {prestation.actif ? (
              <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-[11px] font-medium rounded-full border border-green-100">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Actif
              </span>
            ) : (
              <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-500 text-[11px] font-medium rounded-full border border-gray-200">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                Inactif
              </span>
            )}
          </div>
          {prestation.description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{prestation.description}</p>
          )}
        </div>
      </div>

      {/* Détails */}
      <div className="px-4 pb-3 space-y-2 border-t border-gray-50 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Prix de base</span>
          <span className="text-sm font-bold text-blue-600">{formatPrix(prestation.prix_base)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock size={12} /> Durée
          </span>
          <span className="text-xs font-medium text-gray-700">{formatDuree(prestation.duree_estimee_minutes)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Position</span>
          <span className="text-xs font-medium text-gray-700">#{prestation.ordre + 1}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
        <button
          onClick={() => onToggleActif(prestation.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            prestation.actif
              ? 'text-gray-600 hover:bg-gray-100'
              : 'text-green-600 hover:bg-green-50'
          }`}
          title={prestation.actif ? 'Désactiver' : 'Activer'}
        >
          {prestation.actif ? <EyeOff size={14} /> : <Eye size={14} />}
          {prestation.actif ? 'Désactiver' : 'Activer'}
        </button>

        <button
          onClick={() => onEdit(prestation)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-orange-500 hover:bg-orange-50 rounded-lg text-xs font-medium transition-colors"
          title="Modifier"
        >
          <Edit2 size={14} /> Modifier
        </button>

        <button
          onClick={() => {
            if (confirm(`Supprimer "${prestation.nom}" ?`)) onDelete(prestation.id);
          }}
          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Supprimer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};