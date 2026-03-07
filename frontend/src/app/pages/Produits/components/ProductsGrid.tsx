// src/app/pages/Produits/components/ProductsGrid.tsx

import { useState } from 'react';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { ProduitCard } from './ProduitCard';
import { ProduitRow } from './ProduitRow';
import type { Produit } from '@/types/produit.types';

type ViewMode = 'list' | 'grid';

interface ProductsGridProps {
  produits: Produit[];
  loading: boolean;
  showStockVente: boolean;
  showStockSalon: boolean;
  showStockReserve?: boolean;
  onEdit: (produit: Produit) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number) => void;
  onViewDetails: (produit: Produit) => void;
  onCreateClick: () => void;
}

export function ProductsGrid({
  produits,
  loading,
  showStockVente,
  showStockSalon,
  showStockReserve = false,
  onEdit,
  onDelete,
  onToggleActive,
  onViewDetails,
  onCreateClick,
}: ProductsGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
        <p className="mt-2 text-sm text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (produits.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 sm:p-12 text-center">
          <p className="text-sm sm:text-base text-gray-600 mb-4">Aucun produit trouvé</p>
          <Button onClick={onCreateClick} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Créer un produit
          </Button>
        </CardContent>
      </Card>
    );
  }

  const sharedProps = {
    onEdit,
    onDelete,
    onToggleActive,
    onViewDetails,
    showStockVente,
    showStockSalon,
    showStockReserve,
  };

  return (
    <div className="space-y-3">
      {/* Toggle vue */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {produits.length} produit{produits.length > 1 ? 's' : ''}
        </p>

        <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-0.5">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List size={15} />
            <span className="hidden sm:inline">Liste</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LayoutGrid size={15} />
            <span className="hidden sm:inline">Cartes</span>
          </button>
        </div>
      </div>

      {/* Vue liste */}
      {viewMode === 'list' && (
        <div className="space-y-1.5">
          {produits.map(produit => (
            <ProduitRow key={produit.id} produit={produit} {...sharedProps} />
          ))}
        </div>
      )}

      {/* Vue grille */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {produits.map(produit => (
            <ProduitCard key={produit.id} produit={produit} {...sharedProps} />
          ))}
        </div>
      )}
    </div>
  );
}