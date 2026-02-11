// src/app/pages/RendezVous/components/shared/GestionnairePaiements.tsx

import React from 'react';
import { Plus, X } from 'lucide-react';
import { SelecteurModePaiement } from './SelecteurModePaiement';

type ModePaiement = 'especes' | 'orange_money' | 'moov_money' | 'carte';

interface Paiement {
  mode: ModePaiement;
  montant: number;
  reference?: string;
}

interface Props {
  paiements: Paiement[];
  onChange: (paiements: Paiement[]) => void;
  montantTotal: number;
  className?: string;
}

export const GestionnairePaiements: React.FC<Props> = ({
  paiements,
  onChange,
  montantTotal,
  className = '',
}) => {
  const ajouterPaiement = () => {
    onChange([
      ...paiements,
      {
        mode: 'especes',
        montant: 0,
        reference: '',
      },
    ]);
  };

  const supprimerPaiement = (index: number) => {
    onChange(paiements.filter((_, i) => i !== index));
  };

  const modifierPaiement = (index: number, updates: Partial<Paiement>) => {
    onChange(
      paiements.map((p, i) => (i === index ? { ...p, ...updates } : p))
    );
  };

  const montantPaye = paiements.reduce((sum, p) => sum + (p.montant || 0), 0);
  const montantRestant = Math.max(0, montantTotal - montantPaye);
  const montantRendu = Math.max(0, montantPaye - montantTotal);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Liste des paiements */}
      <div className="space-y-3">
        {paiements.map((paiement, index) => (
          <div
            key={index}
            className="p-3 border border-gray-200 rounded-lg bg-gray-50 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Paiement {index + 1}
              </span>
              {paiements.length > 1 && (
                <button
                  type="button"
                  onClick={() => supprimerPaiement(index)}
                  className="text-gray-400 hover:text-red-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <SelecteurModePaiement
              value={paiement.mode}
              onChange={(mode) => modifierPaiement(index, { mode })}
            />

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Montant
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={paiement.montant || ''}
                  onChange={(e) =>
                    modifierPaiement(index, {
                      montant: e.target.value ? Number(e.target.value) : 0,
                    })
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-16 text-sm"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  FCFA
                </span>
              </div>
            </div>

            {(paiement.mode === 'orange_money' || paiement.mode === 'moov_money') && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Référence transaction
                </label>
                <input
                  type="text"
                  value={paiement.reference || ''}
                  onChange={(e) =>
                    modifierPaiement(index, { reference: e.target.value })
                  }
                  placeholder="Ex: OM123456789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bouton ajouter paiement */}
      <button
        type="button"
        onClick={ajouterPaiement}
        className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm font-medium">Ajouter un mode de paiement</span>
      </button>

      {/* Récapitulatif */}
      <div className="p-3 bg-gray-100 rounded-lg space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total à payer</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(montantTotal)} FCFA
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Montant payé</span>
          <span
            className={`font-medium ${
              montantPaye >= montantTotal ? 'text-green-600' : 'text-orange-600'
            }`}
          >
            {formatCurrency(montantPaye)} FCFA
          </span>
        </div>
        {montantRestant > 0 && (
          <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-300">
            <span className="font-medium text-red-600">Reste à payer</span>
            <span className="font-bold text-red-600">
              {formatCurrency(montantRestant)} FCFA
            </span>
          </div>
        )}
        {montantRendu > 0 && (
          <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-300">
            <span className="font-medium text-green-600">Monnaie à rendre</span>
            <span className="font-bold text-green-600">
              {formatCurrency(montantRendu)} FCFA
            </span>
          </div>
        )}
      </div>
    </div>
  );
};