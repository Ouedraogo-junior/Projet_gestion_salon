// src/app/pages/RendezVous/components/ModalPaiementAcompte.tsx

import React, { useState } from 'react';
import { X, DollarSign, CreditCard, Smartphone, Banknote, FileText, Receipt } from 'lucide-react';
import { useRendezVous } from '../../../../hooks/useRendezVous';
import { rendezVousApi } from '../../../../services/rendezVousApi';
import type { RendezVous } from '../../../../types/rendezVous.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  rendezVous: RendezVous;
  onSuccess: () => void;
}

type ModePaiement = 'especes' | 'orange_money' | 'moov_money' | 'carte';

export const ModalPaiementAcompte: React.FC<Props> = ({
  isOpen,
  onClose,
  rendezVous,
  onSuccess,
}) => {
  const { payerAcompte, isPayingAcompte } = useRendezVous();
  
  const [formData, setFormData] = useState({
    montant: rendezVous.acompte_montant || 0,
    mode_paiement: 'especes' as ModePaiement,
    reference_transaction: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    payerAcompte(
      { 
        id: rendezVous.id, 
        data: {
          montant: formData.montant,
          mode_paiement: formData.mode_paiement,
          reference_transaction: formData.reference_transaction || undefined,
          notes: formData.notes || undefined,
        }
      },
      {
        onSuccess: () => {
          onSuccess();
          onClose();
        },
      }
    );
  };

  const handleVoirRecu = () => {
    const url = rendezVousApi.getRecuAcompteUrl(rendezVous.id);
    window.open(url, '_blank');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Paiement acompte</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Infos rendez-vous */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Client:</span>
              <span className="font-medium text-gray-900">
                {rendezVous.client?.prenom} {rendezVous.client?.nom}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Prestation:</span>
              <span className="font-medium text-gray-900">
                {rendezVous.typePrestation?.nom}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium text-gray-900">
                {new Date(rendezVous.date_heure).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            {rendezVous.prix_estime && (
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-600">Prix estimé:</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(rendezVous.prix_estime)} FCFA
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Montant de l'acompte *
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: Number(e.target.value) })}
                min="0"
                max={rendezVous.prix_estime || undefined}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-16"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                FCFA
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Acompte requis: {formatCurrency(rendezVous.acompte_montant || 0)} FCFA
            </p>
          </div>

          {/* Mode de paiement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode de paiement *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode_paiement: 'especes' })}
                className={`p-3 border-2 rounded-lg transition flex items-center justify-center gap-2 ${
                  formData.mode_paiement === 'especes'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="font-medium">Espèces</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode_paiement: 'orange_money' })}
                className={`p-3 border-2 rounded-lg transition flex items-center justify-center gap-2 ${
                  formData.mode_paiement === 'orange_money'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="font-medium">Orange Money</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode_paiement: 'moov_money' })}
                className={`p-3 border-2 rounded-lg transition flex items-center justify-center gap-2 ${
                  formData.mode_paiement === 'moov_money'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="font-medium">Moov Money</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode_paiement: 'carte' })}
                className={`p-3 border-2 rounded-lg transition flex items-center justify-center gap-2 ${
                  formData.mode_paiement === 'carte'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="font-medium">Carte</span>
              </button>
            </div>
          </div>

          {/* Référence transaction (si mobile money) */}
          {(formData.mode_paiement === 'orange_money' || formData.mode_paiement === 'moov_money') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Référence transaction
              </label>
              <input
                type="text"
                value={formData.reference_transaction}
                onChange={(e) => setFormData({ ...formData, reference_transaction: e.target.value })}
                placeholder="Ex: OM123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Notes (optionnel)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Remarques sur le paiement..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPayingAcompte || formData.montant <= 0}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              {isPayingAcompte ? 'Enregistrement...' : 'Enregistrer le paiement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};