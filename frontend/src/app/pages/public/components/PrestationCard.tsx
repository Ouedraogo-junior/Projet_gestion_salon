// src/app/pages/public/components/PrestationCard.tsx
import React from 'react';
import { Clock } from 'lucide-react';
import type { PrestationPublique } from '@/types/public.types';

interface PrestationCardProps {
  prestation: PrestationPublique;
}

export const PrestationCard: React.FC<PrestationCardProps> = ({ prestation }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
      <h3 className="font-semibold text-lg text-gray-800 mb-2">
        {prestation.nom}
      </h3>
      
      {prestation.description && (
        <p className="text-sm text-gray-600 mb-3">
          {prestation.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-indigo-600">
          {prestation.prix_base.toLocaleString()} FCFA
        </span>
        
        {prestation.duree_estimee_minutes && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock size={16} />
            <span>{prestation.duree_estimee_minutes} min</span>
          </div>
        )}
      </div>
    </div>
  );
};