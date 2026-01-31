// src/app/pages/Produits/components/ProductsGrid.tsx
import { Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { ProduitCard } from './ProduitCard';
import type { Produit } from '@/types/produit.types';

interface ProductsGridProps {
  produits: Produit[];
  loading: boolean;
  showStockVente: boolean;
  showStockSalon: boolean;
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
  onEdit,
  onDelete,
  onToggleActive,
  onViewDetails,
  onCreateClick
}: ProductsGridProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (produits.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-600 mb-4">Aucun produit trouvé</p>
          <Button onClick={onCreateClick}>
            <Plus className="w-4 h-4 mr-2" />
            Créer un produit
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {produits.map((produit) => (
        <ProduitCard
          key={produit.id}
          produit={produit}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
          onViewDetails={onViewDetails}
          showStockVente={showStockVente}
          showStockSalon={showStockSalon}
        />
      ))}
    </div>
  );
}