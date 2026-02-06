// src/app/pages/components/SelectionProduitModal.tsx

import React, { useState, useEffect } from 'react';
import { X, Search, Package, AlertCircle, Check } from 'lucide-react';
import { produitsApi } from '../../../../services/produitsApi';
import { venteApi } from '../../../../services/venteApi';
import type { Produit, Categorie, ProduitFilters } from '../../../../types/produit.types';
import type { SourceStock } from '../../../../types/vente.types';

interface SelectionProduitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (produit: Produit, quantite: number, sourceStock: SourceStock) => void;
}

export const SelectionProduitModal: React.FC<SelectionProduitModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  // États
  const [produits, setProduits] = useState<Produit[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState<number | undefined>();
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
  const [quantite, setQuantite] = useState(1);
  const [stockError, setStockError] = useState<string | null>(null);

  // Charger les catégories au montage
  useEffect(() => {
    if (isOpen) {
      chargerCategories();
      chargerProduits();
    }
  }, [isOpen]);

  // Recharger les produits quand les filtres changent
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        chargerProduits();
      }, 300); // Debounce de 300ms
      return () => clearTimeout(timer);
    }
  }, [searchTerm, selectedCategorie, isOpen]);

  const chargerCategories = async () => {
    try {
      const response = await produitsApi.categories.getAll({ actives_only: true });
      if (response.success) {
        setCategories(response.data.data || response.data);
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  const chargerProduits = async () => {
    setLoading(true);
    try {
      const filters: any = {
        actifs_only: true,
        per_page: 50,
      };

      if (searchTerm) {
        filters.search = searchTerm;
      }

      if (selectedCategorie) {
        filters.categorie_id = selectedCategorie;
      }

      const response = await produitsApi.produits.getAll(filters);
      if (response.success) {
        setProduits(response.data.data || response.data);
      }
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifierStock = async (produit: Produit, qty: number) => {
    setStockError(null);
    
    // Vérifier uniquement le stock de vente
    const stockDisponible = produit.stock_vente;
    if (stockDisponible < qty) {
      setStockError(`Stock insuffisant. Disponible: ${stockDisponible}`);
      return false;
    }
    
    return true;
  };

  const handleSelectProduit = (produit: Produit) => {
    setSelectedProduit(produit);
    setQuantite(1);
    setStockError(null);
  };

  const handleConfirmer = async () => {
    if (!selectedProduit) return;

    // Vérifier le stock
    const stockOk = await verifierStock(selectedProduit, quantite);
    if (!stockOk) return;

    // Ajouter au panier - toujours avec source 'vente'
    onSelect(selectedProduit, quantite, 'vente');
    
    // Réinitialiser et fermer
    resetModal();
    onClose();
  };

  const resetModal = () => {
    setSelectedProduit(null);
    setQuantite(1);
    setStockError(null);
    setSearchTerm('');
    setSelectedCategorie(undefined);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const getPrixAffichage = (produit: Produit) => {
    if (produit.prix_promo && produit.date_debut_promo && produit.date_fin_promo) {
      const now = new Date();
      const debut = new Date(produit.date_debut_promo);
      const fin = new Date(produit.date_fin_promo);
      if (now >= debut && now <= fin) {
        return produit.prix_promo;
      }
    }
    return produit.prix_vente;
  };

  const isEnPromotion = (produit: Produit) => {
    if (produit.prix_promo && produit.date_debut_promo && produit.date_fin_promo) {
      const now = new Date();
      const debut = new Date(produit.date_debut_promo);
      const fin = new Date(produit.date_fin_promo);
      return now >= debut && now <= fin;
    }
    return false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package size={24} />
            Sélectionner un produit
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filtres */}
        <div className="p-4 border-b space-y-3">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un produit par nom, référence ou marque..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtres catégories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategorie(undefined)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                selectedCategorie === undefined
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Toutes les catégories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategorie(cat.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  selectedCategorie === cat.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {cat.nom}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des produits */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : produits.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p>Aucun produit trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {produits.map((produit) => {
                const prix = getPrixAffichage(produit);
                const enPromo = isEnPromotion(produit);
                const isSelected = selectedProduit?.id === produit.id;

                return (
                  <button
                    key={produit.id}
                    onClick={() => handleSelectProduit(produit)}
                    className={`text-left p-4 border rounded-lg transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Image ou placeholder */}
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                        {produit.photo_url ? (
                          <img
                            src={produit.photo_url}
                            alt={produit.nom}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <Package size={32} className="text-gray-400" />
                        )}
                      </div>

                      {/* Informations */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {produit.nom}
                            </h3>
                            {produit.reference && (
                              <p className="text-sm text-gray-500">Réf: {produit.reference}</p>
                            )}
                            {produit.marque && (
                              <p className="text-sm text-gray-600">{produit.marque}</p>
                            )}
                          </div>
                          {isSelected && (
                            <Check size={20} className="text-blue-500 flex-shrink-0" />
                          )}
                        </div>

                        {/* Prix */}
                        <div className="mt-2">
                          {enPromo ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-green-600">
                                {prix.toLocaleString()} FCFA
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {produit.prix_vente.toLocaleString()} FCFA
                              </span>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                PROMO
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">
                              {prix.toLocaleString()} FCFA
                            </span>
                          )}
                        </div>

                        {/* Stock */}
                        <div className="mt-2 text-sm">
                          <div className={`${produit.stock_vente <= produit.seuil_critique ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                            <span className="font-medium">Stock disponible:</span> {produit.stock_vente}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Panneau de configuration si un produit est sélectionné */}
        {selectedProduit && (
          <div className="border-t p-4 bg-gray-50">
            <h3 className="font-semibold mb-3">Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quantité */}
              <div>
                <label className="block text-sm font-medium mb-1">Quantité</label>
                <input
                  type="number"
                  min="1"
                  value={quantite}
                  onChange={(e) => setQuantite(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* Prix unitaire */}
              <div>
                <label className="block text-sm font-medium mb-1">Prix unitaire</label>
                <div className="px-3 py-2 bg-white border rounded font-semibold">
                  {getPrixAffichage(selectedProduit).toLocaleString()} FCFA
                </div>
              </div>
            </div>

            {/* Erreur stock */}
            {stockError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{stockError}</p>
              </div>
            )}

            {/* Total */}
            <div className="mt-4 p-3 bg-white border rounded-lg flex items-center justify-between">
              <span className="font-medium">Total:</span>
              <span className="text-xl font-bold text-blue-600">
                {(getPrixAffichage(selectedProduit) * quantite).toLocaleString()} FCFA
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border-t p-4 flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirmer}
            disabled={!selectedProduit || loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
};