// src/app/pages/Produits/components/ProduitsTab.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent } from '@/app/components/ui/card';
import { useProduits, useCategories } from '@/hooks/useProduitsModule';
import { produitsApi } from '@/services/produitsApi';
import { ProductsHeader } from './ProductsHeader';
import { ProductsSubTabs } from './ProductsSubTabs';
import { ProductsGrid } from './ProductsGrid';
import { ProduitFormModal } from './ProduitFormModal';
import { ProduitDetailsModal } from './ProduitDetailsModal';
import type { Produit } from '@/types/produit.types';
import { ProduitFilters } from './ProduitFilters';
import type { ProduitFilters as ProduitFiltersType } from '@/types/produit.types';

type ProductSubTab = 'tous' | 'vente' | 'utilisation' | 'reserve';

export function ProduitsTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<ProductSubTab>('tous');
  const { data: produits, loading, reload } = useProduits();
  const { data: categories } = useCategories();
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
  const [editingProduit, setEditingProduit] = useState<Produit | null>(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProduitFiltersType>({
    sort_by: 'nom',
    sort_order: 'asc',
  });

  // 🔔 Gérer l'ouverture automatique depuis une notification
  useEffect(() => {
    const produitId = searchParams.get('id');
    
    if (produitId && produits.length > 0 && !loading) {
      const produit = produits.find((p: Produit) => p.id === Number(produitId));
      
      if (produit) {
        // Ouvrir le modal du produit
        setSelectedProduit(produit);
        setShowDetailsModal(true);
        
        // Nettoyer l'URL
        setSearchParams({});
      }
    }
  }, [searchParams, produits, loading, setSearchParams]);

  // 🔍 Recharger les produits à chaque changement de recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== '') {
        reload({ search, per_page: 500 });
      } else {
        reload({ per_page: 500 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Filtrage selon l'onglet actif
  const filteredProduits = produits.filter((prod: Produit) => {
    if (activeTab === 'tous') return true;
    if (activeTab === 'vente') {
      return prod.type_stock_principal === 'vente' || prod.type_stock_principal === 'mixte';
    }
    if (activeTab === 'utilisation') {
      return prod.type_stock_principal === 'utilisation' || prod.type_stock_principal === 'mixte';
    }
    if (activeTab === 'reserve') {  
      return prod.type_stock_principal === 'reserve';
    }
    return true;
  });

  //   console.log('📊 Stats:', {
  //   activeTab,
  //   totalProduits: produits.length,
  //   filteredProduits: filteredProduits.length,
  //   produitsTypes: produits.map(p => ({ id: p.id, nom: p.nom, type: p.type_stock_principal }))
  // });

  // Colonnes conditionnelles
  const shouldShowStockVente = activeTab === 'tous' || activeTab === 'vente';
  const shouldShowStockSalon = activeTab === 'tous' || activeTab === 'utilisation';
  const shouldShowStockReserve = activeTab === 'tous' || activeTab === 'reserve';

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    try {
      await produitsApi.produits.delete(id);
      reload();
      alert('✅ Produit supprimé avec succès');
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await produitsApi.produits.toggleActive(id);
      reload();
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  const handleViewDetails = (produit: Produit) => {
    setSelectedProduit(produit);
    setShowDetailsModal(true);
  };

  const handleEdit = (produit: Produit) => {
    setEditingProduit(produit);
    setShowFormModal(true);
  };

  const handleCreateClick = () => {
    setEditingProduit(null);
    setShowFormModal(true);
  };

  const handleFormSuccess = async () => {
    setShowFormModal(false);
    setEditingProduit(null);
    
    // Attendre un peu que le backend termine
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await reload(); // ← Maintenant c'est async
  };

  const handleFormClose = () => {
    setShowFormModal(false);
    setEditingProduit(null);
  };

  const handleDetailsClose = () => {
    setShowDetailsModal(false);
    setSelectedProduit(null);
  };

  // Gérer le changement de filtres
  const handleFiltersChange = (newFilters: ProduitFiltersType) => {
    setFilters(newFilters);
    const params: any = { per_page: 500 };
    if (newFilters.search)               params.search = newFilters.search;
    if (newFilters.categorie_id)         params.categorie_id = newFilters.categorie_id;
    if (newFilters.type_stock_principal) params.type_stock_principal = newFilters.type_stock_principal;
    if (newFilters.actifs_only)          params.actifs_only = 'true';
    if (newFilters.alerte_stock_vente)   params.alerte_stock_vente = 'true';
    if (newFilters.alerte_stock_utilisation) params.alerte_stock_utilisation = 'true';
    if (newFilters.critique_stock_vente) params.critique_stock_vente = 'true';
    if (newFilters.en_promotion)         params.en_promotion = 'true';
    if (newFilters.sort_by)              params.sort_by = newFilters.sort_by;
    if (newFilters.sort_order)           params.sort_order = newFilters.sort_order;
    reload(params);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <ProductsHeader onCreateClick={handleCreateClick} />

      {/* Tabs */}
      <ProductsSubTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Barre de recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Rechercher un produit..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  handleFiltersChange({ ...filters, search: e.target.value });
                }}
                className="pl-10"
              />
            </div>

            {/* Bouton filtre */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition ${
                showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-gray-50'
              }`}
            >
              <Filter size={16} />
              Filtres
              {Object.values(filters).filter(Boolean).length > 2 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                  {Object.values(filters).filter(v => v && v !== 'nom' && v !== 'asc').length}
                </span>
              )}
            </button>
          </div>

          {/* Panneau filtres */}
          {showFilters && (
            <div className="mt-4 border-t pt-4">
              <ProduitFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                categories={categories}
                onClose={() => setShowFilters(false)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grille de produits */}
      <ProductsGrid
        produits={filteredProduits}
        loading={loading}
        showStockVente={shouldShowStockVente}
        showStockSalon={shouldShowStockSalon}
        showStockReserve={shouldShowStockReserve}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onViewDetails={handleViewDetails}
        onCreateClick={handleCreateClick}
      />

      {/* Modal Formulaire */}
      <ProduitFormModal
        isOpen={showFormModal}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        produit={editingProduit}
        categories={categories}
      />

      {/* Modal Détails */}
      {selectedProduit && (
        <ProduitDetailsModal
          isOpen={showDetailsModal}
          onClose={handleDetailsClose}
          produitId={selectedProduit.id}
        />
      )}
    </div>
  );
}