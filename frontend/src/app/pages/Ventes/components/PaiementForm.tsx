// src/app/pages/ventes/components/PaiementForm.tsx

import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Plus, X } from 'lucide-react';
import type { Paiement, ModePaiement } from '../../../../types/vente.types';

interface PaiementFormProps {
  montantTotal: number;
  onPaiementsChange: (paiements: Paiement[]) => void;
}

export const PaiementForm: React.FC<PaiementFormProps> = ({
  montantTotal,
  onPaiementsChange,
}) => {
  const [paiements, setPaiements] = useState<Paiement[]>([]);

  const modesPaiement: { value: ModePaiement; label: string }[] = [
    { value: 'especes', label: 'Espèces' },
    { value: 'orange_money', label: 'Orange Money' },
    { value: 'moov_money', label: 'Moov Money' },
    { value: 'carte', label: 'Carte bancaire' },
  ];

  // Initialiser automatiquement le paiement avec le montant total
  useEffect(() => {
    if (montantTotal > 0 && paiements.length === 0) {
      const initialPaiement: Paiement = { 
        mode: 'especes', 
        montant: montantTotal, 
        reference: '' 
      };
      setPaiements([initialPaiement]);
      onPaiementsChange([initialPaiement]);
    }
  }, [montantTotal]);

  // Mettre à jour le montant du premier paiement quand le total change
  useEffect(() => {
    if (paiements.length === 1 && montantTotal > 0) {
      const montantPaye = paiements.reduce((sum, p) => sum + (p.montant || 0), 0);
      if (montantPaye !== montantTotal) {
        const nouveaux = [...paiements];
        nouveaux[0] = { ...nouveaux[0], montant: montantTotal };
        setPaiements(nouveaux);
        onPaiementsChange(nouveaux);
      }
    }
  }, [montantTotal]);

  const ajouterPaiement = () => {
    const restant = calculerMontantRestant();
    const nouveau: Paiement = { mode: 'especes', montant: restant, reference: '' };
    const nouveaux = [...paiements, nouveau];
    setPaiements(nouveaux);
    onPaiementsChange(nouveaux);
  };

  const supprimerPaiement = (index: number) => {
    if (paiements.length === 1) return;
    const nouveaux = paiements.filter((_, i) => i !== index);
    setPaiements(nouveaux);
    onPaiementsChange(nouveaux);
  };

  const modifierPaiement = (index: number, field: keyof Paiement, value: any) => {
    const nouveaux = [...paiements];
    nouveaux[index] = { ...nouveaux[index], [field]: value };
    setPaiements(nouveaux);
    onPaiementsChange(nouveaux);
  };

  const calculerMontantRestant = (): number => {
    const totalPaye = paiements.reduce((sum, p) => sum + (p.montant || 0), 0);
    return Math.max(0, montantTotal - totalPaye);
  };

  const calculerMontantRendu = (): number => {
    const totalPaye = paiements.reduce((sum, p) => sum + (p.montant || 0), 0);
    return Math.max(0, totalPaye - montantTotal);
  };

  const formaterMontant = (montant: number): string => {
    return montant.toLocaleString('fr-FR') + ' F';
  };

  const montantRestant = calculerMontantRestant();
  const montantRendu = calculerMontantRendu();
  const estComplet = montantRestant === 0;

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <CreditCard size={18} />
        Paiement
      </h3>

      {/* Liste des paiements */}
      <div className="space-y-3 mb-4">
        {paiements.map((paiement, index) => (
          <div key={index} className="border rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Paiement {index + 1}</span>
              {paiements.length > 1 && (
                <button
                  onClick={() => supprimerPaiement(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Mode de paiement */}
            <select
              value={paiement.mode}
              onChange={(e) =>
                modifierPaiement(index, 'mode', e.target.value as ModePaiement)
              }
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              {modesPaiement.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>

            {/* Montant */}
            <div className="flex items-center gap-2">
              <DollarSign size={18} className="text-gray-400" />
              <input
                type="number"
                value={paiement.montant || ''}
                onChange={(e) =>
                  modifierPaiement(index, 'montant', parseFloat(e.target.value) || 0)
                }
                className="flex-1 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Montant"
                min="0"
                step="100"
              />
              <span className="text-sm text-gray-600">F</span>
            </div>

            {/* Référence (si mobile money) */}
            {(paiement.mode === 'orange_money' || paiement.mode === 'moov_money') && (
              <input
                type="text"
                value={paiement.reference || ''}
                onChange={(e) => modifierPaiement(index, 'reference', e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Référence de transaction"
              />
            )}
          </div>
        ))}
      </div>

      {/* Bouton ajouter paiement */}
      {paiements.length < 3 && (
        <button
          onClick={ajouterPaiement}
          className="w-full border-2 border-dashed border-gray-300 rounded py-2 text-gray-600 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-2 transition"
        >
          <Plus size={18} />
          Ajouter un mode de paiement
        </button>
      )}

      {/* Récapitulatif */}
      <div className="mt-4 border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Montant total:</span>
          <span className="font-bold">{formaterMontant(montantTotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Montant payé:</span>
          <span className={estComplet ? 'text-green-600 font-medium' : ''}>
            {formaterMontant(
              paiements.reduce((sum, p) => sum + (p.montant || 0), 0)
            )}
          </span>
        </div>

        {montantRestant > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-red-600">Reste à payer:</span>
            <span className="font-bold text-red-600">
              {formaterMontant(montantRestant)}
            </span>
          </div>
        )}

        {montantRendu > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-blue-600">À rendre:</span>
            <span className="font-bold text-blue-600">
              {formaterMontant(montantRendu)}
            </span>
          </div>
        )}

        {/* Validation visuelle */}
        <div
          className={`mt-3 p-3 rounded text-center text-sm font-medium ${
            estComplet
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {estComplet
            ? '✓ Paiement complet'
            : `⚠ ${formaterMontant(montantRestant)} manquant`}
        </div>
      </div>
    </div>
  );
};