// src/app/pages/ventes/components/ProduitsList.tsx

import React, { useState, useEffect } from 'react';
import { Search, Package, ShoppingCart, AlertCircle } from 'lucide-react';
import { produitsApi } from '../../../../services/produitsApi';
import type { Produit, Categorie } from '../../../../types/produit.types';
import type { SourceStock } from '../../../../types/vente.types';

interface ProduitsListProps {
  onSelect: (produit: Produit, quantite: number, sourceStock: SourceStock) => void;
}

export const ProduitsList: React.FC<ProduitsListProps> = ({ onSelect }) => {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState<number | undefined>();

  useEffect(() => {
    chargerCategories();
    chargerProduits();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      chargerProduits();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategorie]);

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
        per_page: 20,
      };

      if (searchTerm) filters.search = searchTerm;
      if (selectedCategorie) filters.categorie_id = selectedCategorie;

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

  const handleAjouterProduit = (produit: Produit, source: SourceStock = 'vente') => {
    const stockDisponible = source === 'vente' ? produit.stock_vente : produit.stock_utilisation;
    if (stockDisponible < 1) {
      alert('Stock insuffisant');
      return;
    }
    onSelect(produit, 1, source);
  };

  const getImageUrl = (photoUrl?: string) => {
    if (!photoUrl) return null;
    const cleanUrl = photoUrl.replace(/^(storage\/)+/, '');
    return `${import.meta.env.VITE_API_URL}/storage/${cleanUrl}`;
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Package size={18} />
        Produits disponibles
      </h3>

      {/* Recherche */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un produit..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filtres catégories */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        <button
          onClick={() => setSelectedCategorie(undefined)}
          className={`px-3 py-1 rounded-lg whitespace-nowrap text-sm transition ${
            selectedCategorie === undefined
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Tout
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategorie(cat.id)}
            className={`px-3 py-1 rounded-lg whitespace-nowrap text-sm transition ${
              selectedCategorie === cat.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {cat.nom}
          </button>
        ))}
      </div>

      {/* Liste des produits */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Chargement...</div>
        ) : produits.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Aucun produit trouvé</div>
        ) : (
          produits.map((produit) => {
            const prix = getPrixAffichage(produit);
            const enPromo = isEnPromotion(produit);
            const imageUrl = produit.photo_url ? getImageUrl(produit.photo_url) : null;

            return (
              <div
                key={produit.id}
                className="border rounded-lg p-3 hover:bg-gray-50 transition"
              >
                <div className="flex items-start gap-3">
                  {/* Image */}
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={produit.nom}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200"><svg class="text-gray-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>';
                        }}
                      />
                    ) : (
                      <Package size={24} className="text-gray-400" />
                    )}
                  </div>

                  {/* Informations */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{produit.nom}</h4>
                    {produit.reference && (
                      <p className="text-xs text-gray-500">Réf: {produit.reference}</p>
                    )}
                    
                    {/* Prix */}
                    <div className="mt-1">
                      {enPromo ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-green-600">
                            {prix.toLocaleString()} F
                          </span>
                          <span className="text-xs text-gray-500 line-through">
                            {produit.prix_vente.toLocaleString()} F
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold">
                          {prix.toLocaleString()} F
                        </span>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="flex gap-2 text-xs mt-1">
                      <span className={produit.stock_vente <= produit.seuil_critique ? 'text-red-600' : 'text-gray-600'}>
                        Vente: {produit.stock_vente}
                      </span>
                      <span className={produit.stock_utilisation <= produit.seuil_critique_utilisation ? 'text-red-600' : 'text-gray-600'}>
                        Util: {produit.stock_utilisation}
                      </span>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleAjouterProduit(produit, 'vente')}
                      disabled={produit.stock_vente < 1}
                      className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ShoppingCart size={12} />
                      Vente
                    </button>
                    {/* <button
                      onClick={() => handleAjouterProduit(produit, 'utilisation')}
                      disabled={produit.stock_utilisation < 1}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ShoppingCart size={12} />
                      Util
                    </button> */}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};