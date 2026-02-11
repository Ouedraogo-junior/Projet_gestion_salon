// src/app/pages/RendezVous/components/shared/SelecteurProduits.tsx

import React, { useState } from 'react';
import { Plus, Minus, Package, Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { produitsApi } from '../../../../../services/produitsApi';

interface ProduitSelectionne {
  id: number;
  nom: string;
  reference?: string;
  prix_unitaire: number;
  quantite: number;
  source_stock: 'vente' | 'utilisation';
  stock_vente: number;
  stock_utilisation: number;
}

interface Props {
  produits: ProduitSelectionne[];
  onChange: (produits: ProduitSelectionne[]) => void;
}

export const SelecteurProduits: React.FC<Props> = ({ produits, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Récupérer tous les produits actifs
  const { data: produitsResponse, isLoading } = useQuery({
    queryKey: ['produits-actifs'],
    queryFn: () => produitsApi.produits.getAll({ actif: true }),
  });

  // Extraire le tableau de produits de la réponse API
  // Gestion robuste de différentes structures de réponse possibles
  const produitsDisponibles = Array.isArray(produitsResponse?.data?.data)
    ? produitsResponse.data.data
    : Array.isArray(produitsResponse?.data)
    ? produitsResponse.data
    : [];

  const ajouterProduit = (produit: any) => {
    const existe = produits.find((p) => p.id === produit.id);
    if (existe) {
      // Incrémenter quantité
      onChange(
        produits.map((p) =>
          p.id === produit.id ? { ...p, quantite: p.quantite + 1 } : p
        )
      );
    } else {
      // Ajouter nouveau produit
      onChange([
        ...produits,
        {
          id: produit.id,
          nom: produit.nom,
          reference: produit.reference,
          prix_unitaire: produit.prix_vente || 0,
          quantite: 1,
          source_stock: 'utilisation',
          stock_vente: produit.stock_vente || 0,
          stock_utilisation: produit.stock_utilisation || 0,
        },
      ]);
    }
    setSearchTerm('');
    setShowSearch(false);
  };

  const modifierQuantite = (id: number, delta: number) => {
    onChange(
      produits
        .map((p) => {
          if (p.id === id) {
            const nouvelleQuantite = p.quantite + delta;
            return nouvelleQuantite > 0 ? { ...p, quantite: nouvelleQuantite } : null;
          }
          return p;
        })
        .filter(Boolean) as ProduitSelectionne[]
    );
  };

  const changerSourceStock = (id: number, source: 'vente' | 'utilisation') => {
    onChange(produits.map((p) => (p.id === id ? { ...p, source_stock: source } : p)));
  };

  const supprimerProduit = (id: number) => {
    onChange(produits.filter((p) => p.id !== id));
  };

  const produitsFiltres = produitsDisponibles.filter((p: any) =>
    p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  return (
    <div className="space-y-3">
      {/* Bouton ajouter produit */}
      {!showSearch ? (
        <button
          type="button"
          onClick={() => setShowSearch(true)}
          className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Ajouter un produit</span>
        </button>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un produit..."
            autoFocus
            className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          />
          <button
            type="button"
            onClick={() => {
              setShowSearch(false);
              setSearchTerm('');
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Résultats de recherche */}
          {searchTerm && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {isLoading ? (
                <div className="px-3 py-4 text-center text-sm text-gray-500">
                  Chargement...
                </div>
              ) : produitsFiltres.length > 0 ? (
                produitsFiltres.map((produit: any) => (
                  <button
                    key={produit.id}
                    type="button"
                    onClick={() => ajouterProduit(produit)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{produit.nom}</div>
                        {produit.reference && (
                          <div className="text-xs text-gray-500">Réf: {produit.reference}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(produit.prix_vente)} F
                        </div>
                        <div className="text-xs text-gray-500">
                          Stock: {produit.stock_utilisation}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-sm text-gray-500">
                  Aucun produit trouvé
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Liste des produits sélectionnés */}
      {produits.length > 0 && (
        <div className="space-y-2">
          {produits.map((produit) => {
            const stockDisponible =
              produit.source_stock === 'vente'
                ? produit.stock_vente
                : produit.stock_utilisation;

            return (
              <div
                key={produit.id}
                className="p-3 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {produit.nom}
                      </span>
                    </div>
                    {produit.reference && (
                      <div className="text-xs text-gray-500 ml-6">
                        Réf: {produit.reference}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => supprimerProduit(produit.id)}
                    className="text-gray-400 hover:text-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quantité */}
                <div className="flex items-center gap-3 mb-2">
                  <button
                    type="button"
                    onClick={() => modifierQuantite(produit.id, -1)}
                    className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-medium text-gray-900 min-w-[30px] text-center">
                    {produit.quantite}
                  </span>
                  <button
                    type="button"
                    onClick={() => modifierQuantite(produit.id, 1)}
                    disabled={produit.quantite >= stockDisponible}
                    className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <span className="text-xs text-gray-500 ml-auto">
                    × {formatCurrency(produit.prix_unitaire)} ={' '}
                    <span className="font-medium text-gray-900">
                      {formatCurrency(produit.prix_unitaire * produit.quantite)} F
                    </span>
                  </span>
                </div>

                {/* Source stock */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Stock:</span>
                  <button
                    type="button"
                    onClick={() => changerSourceStock(produit.id, 'utilisation')}
                    className={`px-2 py-1 rounded text-xs transition ${
                      produit.source_stock === 'utilisation'
                        ? 'bg-orange-100 text-orange-700 font-medium'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Utilisation ({produit.stock_utilisation})
                  </button>
                  <button
                    type="button"
                    onClick={() => changerSourceStock(produit.id, 'vente')}
                    className={`px-2 py-1 rounded text-xs transition ${
                      produit.source_stock === 'vente'
                        ? 'bg-orange-100 text-orange-700 font-medium'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Vente ({produit.stock_vente})
                  </button>
                </div>

                {/* Alerte stock insuffisant */}
                {produit.quantite > stockDisponible && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    ⚠️ Stock insuffisant ({stockDisponible} disponible)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};