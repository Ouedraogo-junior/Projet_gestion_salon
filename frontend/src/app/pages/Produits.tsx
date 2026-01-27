import { useState } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/app/components/ui/sheet';
import { ProduitStats } from './components/ProduitStats';
import { ProduitCard } from './components/ProduitCard';
import { ProduitFilters } from './components/ProduitFilters';
import { ProduitModal } from './components/ProduitModal';
import { QuickStockModal } from './components/QuickStockModal';
import { useProduits, useCategories, useDeleteProduit, useToggleActiveProduit } from '@/hooks/useProduits';
import type { Produit, ProduitFilters as Filters } from '@/types/produit.types';

export function ProduitsPage() {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    actifs_only: false,
    sort_by: 'nom',
    sort_order: 'asc',
    page: 1,
    per_page: 12
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stockModalState, setStockModalState] = useState<{
    produit: Produit | null;
    type: 'vente' | 'utilisation';
    isOpen: boolean;
  }>({
    produit: null,
    type: 'vente',
    isOpen: false
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Queries
  const { data: produitsResponse, isLoading: isLoadingProduits } = useProduits(filters);
  const { data: categoriesResponse, isLoading: isLoadingCategories } = useCategories({
    actives_only: true,
    with_attributs: false
  });

  // Mutations
  const { mutate: deleteProduit } = useDeleteProduit();
  const { mutate: toggleActive } = useToggleActiveProduit();

  const produits = produitsResponse?.data?.data || [];
  const meta = produitsResponse?.data?.meta;
  const stats = produitsResponse?.data?.statistiques;
  const categories = categoriesResponse?.data || [];

  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleOpenModal = (produit?: Produit) => {
    setSelectedProduit(produit || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProduit(null);
    setIsModalOpen(false);
  };

  const handleAjusterStock = (produit: Produit, type: 'vente' | 'utilisation') => {
    setStockModalState({
      produit,
      type,
      isOpen: true
    });
  };

  const handleCloseStockModal = () => {
    setStockModalState({
      produit: null,
      type: 'vente',
      isOpen: false
    });
  };

  const handleDelete = (id: number) => {
    deleteProduit(id);
  };

  const handleToggleActive = (id: number) => {
    toggleActive(id);
  };

  const handleExport = () => {
    // TODO: Implémenter l'export
    console.log('Export des produits');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produits & Stock</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gérez vos produits et suivez vos stocks en temps réel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau produit
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <ProduitStats stats={stats} isLoading={isLoadingProduits} />

      {/* Barre de recherche et filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher par nom ou référence..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[400px] sm:w-[400px] p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Filtres avancés</SheetTitle>
                </SheetHeader>
                <ProduitFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  categories={categories}
                  isOpen={isFiltersOpen}
                  onClose={() => setIsFiltersOpen(false)}
                  className="border-0"
                />
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>

      {/* Résultats */}
      {isLoadingProduits ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : produits.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {searchTerm || filters.categorie_id
                ? 'Aucun produit ne correspond à vos critères de recherche'
                : 'Commencez par créer votre premier produit'}
            </p>
            {!searchTerm && !filters.categorie_id && (
              <Button onClick={() => handleOpenModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un produit
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Grille de produits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produits.map((produit) => (
              <ProduitCard
                key={produit.id}
                produit={produit}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                onAjusterStock={handleAjusterStock}
              />
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page === 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
              >
                Précédent
              </Button>
              <span className="text-sm text-gray-600 px-4">
                Page {meta.current_page} sur {meta.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page === meta.last_page}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
              >
                Suivant
              </Button>
            </div>
          )}

          {/* Info résultats */}
          {meta && (
            <div className="text-center text-sm text-gray-600">
              Affichage de {meta.from} à {meta.to} sur {meta.total} produits
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <ProduitModal
        produit={selectedProduit}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        categories={categories}
      />

      <QuickStockModal
        produit={stockModalState.produit}
        typeStock={stockModalState.type}
        isOpen={stockModalState.isOpen}
        onClose={handleCloseStockModal}
      />
    </div>
  );
}