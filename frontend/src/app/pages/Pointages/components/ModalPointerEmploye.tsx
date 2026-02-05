// src/app/pages/Pointages/components/ModalPointerEmploye.tsx

import React, { useState } from 'react';
import { X, Clock, MessageSquare } from 'lucide-react';
import { usePointages } from '../../../../hooks/usePointages';
import type { EmployeeAujourdhui } from '../../../../types/pointage.types';

interface ModalPointerEmployeProps {
  employee: EmployeeAujourdhui;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalPointerEmploye: React.FC<ModalPointerEmployeProps> = ({
  employee,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { create, isCreating } = usePointages();
  const [heureArrivee] = useState(
    new Date().toTimeString().slice(0, 5)
  );
  const [statut, setStatut] = useState<'present' | 'retard' | 'absent' | 'conge'>('present');
  const [commentaire, setCommentaire] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(
      {
        user_id: employee.id,
        date_pointage: new Date().toISOString().split('T')[0],
        heure_arrivee: heureArrivee,
        statut,
        commentaire: commentaire || undefined,
      },
      {
        onSuccess: () => {
          onSuccess();
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Pointer un employé</h2>
            <p className="text-sm text-gray-600 mt-1">{employee.nom_complet}</p>
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
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
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
              Commentaire (optionnel)
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
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              disabled={isCreating}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCreating}
            >
              {isCreating ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};