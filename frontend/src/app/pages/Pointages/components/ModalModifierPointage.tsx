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

  // Couleurs statut — classes complètes pour que Tailwind les détecte au build
  const statutStyles: Record<string, { border: string; bg: string; text: string }> = {
    present:  { border: 'border-green-600',  bg: 'bg-green-50',  text: 'text-green-700' },
    retard:   { border: 'border-orange-600', bg: 'bg-orange-50', text: 'text-orange-700' },
    absent:   { border: 'border-red-600',    bg: 'bg-red-50',    text: 'text-red-700' },
    conge:    { border: 'border-blue-600',   bg: 'bg-blue-50',   text: 'text-blue-700' },
  };

  return (
    <>
      {/* Backdrop : fixed, couvre tout l'écran, semi-transparent */}
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal : fixed, centré, px-4 pour marge mobile */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-0 sm:p-4">
        <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-y-auto relative">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-base sm:text-xl font-bold text-gray-900">Modifier le pointage</h2>
              <p className="text-sm text-gray-600 mt-0.5">{pointage.user?.nom_complet}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            {/* Heure d'arrivée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Clock className="w-4 h-4 inline mr-1.5" />
                Heure d'arrivée
              </label>
              <input
                type="time"
                value={heureArrivee}
                onChange={(e) => setHeureArrivee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                required
              />
            </div>

            {/* Heure de départ */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  <LogOut className="w-4 h-4 inline mr-1.5" />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Statut
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'present', label: 'Présent' },
                  { value: 'retard', label: 'En retard' },
                  { value: 'absent', label: 'Absent' },
                  { value: 'conge', label: 'Congé' },
                ].map((option) => {
                  const isActive = statut === option.value;
                  const style = statutStyles[option.value];
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatut(option.value as any)}
                      className={`px-3 py-2 rounded-lg border-2 font-medium transition text-sm ${
                        isActive
                          ? `${style.border} ${style.bg} ${style.text}`
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <MessageSquare className="w-4 h-4 inline mr-1.5" />
                Commentaire
              </label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                placeholder="Ajouter un commentaire..."
              />
            </div>

            {/* Actions : empilé mobile, inline sm+ */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full sm:w-auto px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition flex items-center justify-center gap-2 text-sm"
                disabled={isUpdating}
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
              <div className="flex flex-1 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
                  disabled={isUpdating}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Modification...' : 'Modifier'}
                </button>
              </div>
            </div>
          </form>

          {/* Confirmation suppression — sous-modal */}
          {showDeleteConfirm && (
            <>
              <div
                className="fixed inset-0 z-50 bg-black bg-opacity-50"
                onClick={() => setShowDeleteConfirm(false)}
              />
              <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-0 sm:p-4">
                <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full max-w-sm">
                  <div className="p-5 sm:p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Confirmer la suppression
                    </h3>
                    <p className="text-sm text-gray-600 mb-5">
                      Êtes-vous sûr de vouloir supprimer ce pointage ? Cette action est irréversible.
                    </p>
                    <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};