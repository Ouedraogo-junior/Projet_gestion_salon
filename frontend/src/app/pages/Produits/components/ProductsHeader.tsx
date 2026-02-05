// src/app/pages/Produits/components/ProductsHeader.tsx
import { Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface ProductsHeaderProps {
  onCreateClick: () => void;
}

export function ProductsHeader({ onCreateClick }: ProductsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
      <div className="min-w-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
          Produits
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Gérez vos produits en vente et pour utilisation salon
        </p>
      </div>
      
      <Button 
        onClick={onCreateClick}
        className="w-full sm:w-auto flex-shrink-0"
      >
        <Plus className="w-4 h-4 mr-2" />
        <span className="hidden xs:inline">Nouveau produit</span>
        <span className="xs:hidden">Nouveau</span>
      </Button>
    </div>
  );
}