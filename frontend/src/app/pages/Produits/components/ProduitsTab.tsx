// src/app/pages/Produits/components/ProduitsTab.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
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

type ProductSubTab = 'tous' | 'vente' | 'utilisation';

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

  // Filtrage selon l'onglet actif
  const filteredProduits = produits.filter((prod: Produit) => {
    if (activeTab === 'tous') return true;
    if (activeTab === 'vente') {
      return prod.type_stock_principal === 'vente' || prod.type_stock_principal === 'mixte';
    }
    if (activeTab === 'utilisation') {
      return prod.type_stock_principal === 'utilisation' || prod.type_stock_principal === 'mixte';
    }
    return true;
  });

  // Colonnes conditionnelles
  const shouldShowStockVente = activeTab === 'tous' || activeTab === 'vente';
  const shouldShowStockSalon = activeTab === 'tous' || activeTab === 'utilisation';

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

  const handleFormSuccess = () => {
    reload();
    setShowFormModal(false);
    setEditingProduit(null);
  };

  const handleFormClose = () => {
    setShowFormModal(false);
    setEditingProduit(null);
  };

  const handleDetailsClose = () => {
    setShowDetailsModal(false);
    setSelectedProduit(null);
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
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && reload(search)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grille de produits */}
      <ProductsGrid
        produits={filteredProduits}
        loading={loading}
        showStockVente={shouldShowStockVente}
        showStockSalon={shouldShowStockSalon}
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