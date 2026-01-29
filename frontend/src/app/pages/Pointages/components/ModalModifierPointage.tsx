// src/app/pages/Pointages/components/ModalModifierPointage.tsx

import React, { useState } from 'react';
import { X, Clock, LogOut, MessageSquare, Trash2 } from 'lucide-react';
import { usePointages } from '../../../../hooks/usePointages';
import type { Pointage } from '../../../../types/pointage.types';

interface ModalModifierPointageProps {
  pointage: Pointage;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalModifierPointage: React.FC<ModalModifierPointageProps> = ({
  pointage,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { update, marquerDepart, delete: deletePointage, isUpdating } = usePointages();
  const [heureArrivee, setHeureArrivee] = useState(pointage.heure_arrivee);
  const [heureDepart, setHeureDepart] = useState(pointage.heure_depart || '');
  const [statut, setStatut] = useState<'present' | 'retard' | 'absent' | 'conge'>(pointage.statut);
  const [commentaire, setCommentaire] = useState(pointage.commentaire || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update(
      {
        id: pointage.id,
        data: {
          heure_arrivee: heureArrivee,
          heure_depart: heureDepart || undefined,
          statut,
          commentaire: commentaire || undefined,
        },
      },
      {
        onSuccess: () => {
          onSuccess();
        },
      }
    );
  };

  const handleMarquerDepart = () => {
    const maintenant = new Date().toTimeString().slice(0, 5);
    marquerDepart(
      { id: pointage.id, heure: maintenant },
      {
        onSuccess: () => {
          onSuccess();
        },
      }
    );
  };

  const handleDelete = () => {
    deletePointage(pointage.id, {
      onSuccess: () => {
        onSuccess();
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Modifier le pointage</h2>
            <p className="text-sm text-gray-600 mt-1">{pointage.user?.nom_complet}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Heure d'arrivée */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Heure d'arrivée
            </label>
            <input
              type="time"
              value={heureArrivee}
              onChange={(e) => setHeureArrivee(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {/* Heure de départ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                <LogOut className="w-4 h-4 inline mr-2" />
                Heure de départ
              </label>
              {!pointage.heure_depart && (
                <button
                  type="button"
                  onClick={handleMarquerDepart}
                  className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                >
                  Maintenant
                </button>
              )}
            </div>
            <input
              type="time"
              value={heureDepart}
              onChange={(e) => setHeureDepart(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'present', label: 'Présent', color: 'green' },
                { value: 'retard', label: 'En retard', color: 'orange' },
                { value: 'absent', label: 'Absent', color: 'red' },
                { value: 'conge', label: 'Congé', color: 'blue' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatut(option.value as any)}
                  className={`px-4 py-2 rounded-lg border-2 font-medium transition ${
                    statut === option.value
                      ? `border-${option.color}-600 bg-${option.color}-50 text-${option.color}-700`
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Commentaire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Commentaire
            </label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Ajouter un commentaire..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
              disabled={isUpdating}
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Supprimer
            </button>
            <div className="flex-1 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                disabled={isUpdating}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUpdating}
              >
                {isUpdating ? 'Modification...' : 'Modifier'}
              </button>
            </div>
          </div>
        </form>

        {/* Confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Confirmer la suppression
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer ce pointage ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};