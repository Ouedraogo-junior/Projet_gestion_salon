// src/app/pages/Produits/components/ProductsHeader.tsx
import { Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface ProductsHeaderProps {
  onCreateClick: () => void;
}

export function ProductsHeader({ onCreateClick }: ProductsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Produits</h2>
        <p className="text-sm text-gray-600 mt-1">
          Gérez vos produits en vente et pour utilisation salon
        </p>
      </div>
      <Button onClick={onCreateClick}>
        <Plus className="w-4 h-4 mr-2" />
        Nouveau produit
      </Button>
    </div>
  );
}