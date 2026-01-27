import { useState, useEffect } from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Separator } from '@/app/components/ui/separator';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ProduitFilters } from '@/types/produit.types';
import type { Categorie } from '@/types/produit.types';

interface ProduitFiltersProps {
  filters: ProduitFilters;
  onFiltersChange: (filters: ProduitFilters) => void;
  categories?: Categorie[];
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export function ProduitFilters({
  filters,
  onFiltersChange,
  categories = [],
  isOpen = true,
  onClose,
  className
}: ProduitFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ProduitFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof ProduitFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: ProduitFilters = {
      search: '',
      actifs_only: false,
      sort_by: 'nom',
      sort_order: 'asc'
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.categorie_id) count++;
    if (localFilters.type_stock_principal) count++;
    if (localFilters.alerte_stock_vente) count++;
    if (localFilters.alerte_stock_utilisation) count++;
    if (localFilters.critique_stock_vente) count++;
    if (localFilters.en_promotion) count++;
    if (localFilters.actifs_only) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={cn(
      'bg-white rounded-lg border border-gray-200 h-full flex flex-col',
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-700" />
            <h3 className="font-semibold text-gray-900">Filtres</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReset}
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Réinitialiser
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Catégorie */}
          <div className="space-y-2">
            <Label htmlFor="categorie">Catégorie</Label>
            <Select
              value={localFilters.categorie_id?.toString() || ''}
              onValueChange={(value) => 
                handleFilterChange('categorie_id', value ? parseInt(value) : undefined)
              }
            >
              <SelectTrigger id="categorie">
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.nom} ({cat.nombre_produits || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Type de stock */}
          <div className="space-y-2">
            <Label htmlFor="type-stock">Type de stock</Label>
            <Select
              value={localFilters.type_stock_principal || ''}
              onValueChange={(value) => 
                handleFilterChange('type_stock_principal', value || undefined)
              }
            >
              <SelectTrigger id="type-stock">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les types</SelectItem>
                <SelectItem value="vente">Vente uniquement</SelectItem>
                <SelectItem value="utilisation">Utilisation uniquement</SelectItem>
                <SelectItem value="mixte">Mixte (vente + utilisation)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Alertes stock */}
          <div className="space-y-3">
            <Label>Alertes stock</Label>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="alerte-vente"
                  checked={localFilters.alerte_stock_vente || false}
                  onCheckedChange={(checked) => 
                    handleFilterChange('alerte_stock_vente', checked)
                  }
                />
                <label
                  htmlFor="alerte-vente"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Stock vente en alerte
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="alerte-utilisation"
                  checked={localFilters.alerte_stock_utilisation || false}
                  onCheckedChange={(checked) => 
                    handleFilterChange('alerte_stock_utilisation', checked)
                  }
                />
                <label
                  htmlFor="alerte-utilisation"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Stock utilisation en alerte
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="critique-vente"
                  checked={localFilters.critique_stock_vente || false}
                  onCheckedChange={(checked) => 
                    handleFilterChange('critique_stock_vente', checked)
                  }
                />
                <label
                  htmlFor="critique-vente"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Stock vente critique
                </label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Autres options */}
          <div className="space-y-3">
            <Label>Autres options</Label>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="en-promotion"
                  checked={localFilters.en_promotion || false}
                  onCheckedChange={(checked) => 
                    handleFilterChange('en_promotion', checked)
                  }
                />
                <label
                  htmlFor="en-promotion"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  En promotion uniquement
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="actifs-only"
                  checked={localFilters.actifs_only || false}
                  onCheckedChange={(checked) => 
                    handleFilterChange('actifs_only', checked)
                  }
                />
                <label
                  htmlFor="actifs-only"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Produits actifs uniquement
                </label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tri */}
          <div className="space-y-3">
            <Label>Trier par</Label>
            
            <Select
              value={localFilters.sort_by || 'nom'}
              onValueChange={(value) => handleFilterChange('sort_by', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nom">Nom</SelectItem>
                <SelectItem value="reference">Référence</SelectItem>
                <SelectItem value="prix_vente">Prix de vente</SelectItem>
                <SelectItem value="prix_achat">Prix d'achat</SelectItem>
                <SelectItem value="stock_vente">Stock vente</SelectItem>
                <SelectItem value="stock_utilisation">Stock utilisation</SelectItem>
                <SelectItem value="created_at">Date de création</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={localFilters.sort_order || 'asc'}
              onValueChange={(value) => handleFilterChange('sort_order', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Croissant</SelectItem>
                <SelectItem value="desc">Décroissant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}