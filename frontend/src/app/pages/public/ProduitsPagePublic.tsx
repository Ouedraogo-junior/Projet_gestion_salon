// src/app/pages/public/ProduitsPagePublic.tsx

import React from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ProduitCard } from './components/ProduitCard';
import { usePublicData } from '@/hooks/usePublicData';
import type { ProduitPublicDetail, VariantePublique } from '@/types/public.types';

interface Props {
  onAddToCart: (produit: ProduitPublicDetail, variante: VariantePublique) => void;
}

export const ProduitsPagePublic: React.FC<Props> = ({ onAddToCart }) => {
  const { slug } = useParams<{ slug: string }>();
  const { produits, loading } = usePublicData(slug || '');

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Nos Produits</h2>
      {produits.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Aucun produit disponible.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {produits.map((produit) => (
            <ProduitCard key={produit.id} produit={produit} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
};