// src/app/pages/public/ServicesPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { PrestationCard } from './components/PrestationCard';
import { usePublicData } from '@/hooks/usePublicData';
import { Loader2 } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { prestations, loading } = usePublicData(slug || '');

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Nos Services</h2>
      
      {prestations.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          Aucun service disponible pour le moment.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prestations.map((prestation) => (
            <PrestationCard key={prestation.id} prestation={prestation} />
          ))}
        </div>
      )}
    </div>
  );
};