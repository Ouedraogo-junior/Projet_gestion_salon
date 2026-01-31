// src/app/pages/public/VuePubliqueMain.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { PublicLayout } from './components/PublicLayout';
import { usePublicData } from '@/hooks/usePublicData';

interface VuePubliqueMainProps {
  children: React.ReactNode;
}

export const VuePubliqueMain: React.FC<VuePubliqueMainProps> = ({ children }) => {
  const { slug } = useParams<{ slug?: string }>();
  const { salonInfo, loading, error } = usePublicData(slug);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (error || !salonInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600">{error || 'Impossible de charger les informations'}</p>
        </div>
      </div>
    );
  }

  return (
    <PublicLayout salonInfo={salonInfo} slug={slug || ''}>
      {children}
    </PublicLayout>
  );
};