// src/app/pages/RendezVous/components/shared/SelecteurModePaiement.tsx

import React from 'react';
import { Banknote, Smartphone, CreditCard } from 'lucide-react';

type ModePaiement = 'especes' | 'orange_money' | 'moov_money' | 'carte';

interface Props {
  value: ModePaiement;
  onChange: (mode: ModePaiement) => void;
  className?: string;
}

export const SelecteurModePaiement: React.FC<Props> = ({ value, onChange, className = '' }) => {
  const modes = [
    { id: 'especes' as ModePaiement, label: 'Espèces', icon: Banknote },
    { id: 'orange_money' as ModePaiement, label: 'Orange Money', icon: Smartphone },
    { id: 'moov_money' as ModePaiement, label: 'Moov Money', icon: Smartphone },
    { id: 'carte' as ModePaiement, label: 'Carte', icon: CreditCard },
  ];

  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      {modes.map((mode) => {
        const Icon = mode.icon;
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => onChange(mode.id)}
            className={`p-3 border rounded-lg transition flex items-center justify-center gap-2 ${
              value === mode.id
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};