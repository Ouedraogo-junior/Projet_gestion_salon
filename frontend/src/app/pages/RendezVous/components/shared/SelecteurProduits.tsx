// src/app/pages/RendezVous/components/shared/SelecteurProduits.tsx

import React, { useState } from 'react';
import { Plus, Minus, Package, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { produitsApi } from '../../../../../services/produitsApi';
import type { Produit, ProduitVariante } from '../../../../../types/produit.types';

// ── Types ─────────────────────────────────────────────────────

interface ProduitSelectionne {
  varianteId: number;       // ← ID de la variante (pour le backend)
  produitId: number;        // ← ID du produit parent (pour affichage)
  nom: string;              // nom produit + attributs variante
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

// ── Helpers ───────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR').format(value);

const getPrixVariante = (v: ProduitVariante): number =>
  v.en_promotion && v.prix_promo ? v.prix_promo : (v.prix_vente ?? 0);

const getStockUtilisation = (v: ProduitVariante): number =>
  ['utilisation', 'mixte'].includes(v.type_stock_principal)
    ? (v.stock_utilisation ?? 0)
    : 0;

const getStockVente = (v: ProduitVariante): number =>
  ['vente', 'mixte'].includes(v.type_stock_principal)
    ? (v.stock_vente ?? 0)
    : 0;

const getAttrLabel = (v: ProduitVariante): string | null =>
  v.attributs && v.attributs.length > 0
    ? v.attributs.map(a => a.valeur_formatee ?? a.valeur).join(' · ')
    : null;

// ── Composant ─────────────────────────────────────────────────

export const SelecteurProduits: React.FC<Props> = ({ produits, onChange }) => {
  const [searchTerm, setSearchTerm]   = useState('');
  const [showSearch, setShowSearch]   = useState(false);
  const [expandedId, setExpandedId]   = useState<number | null>(null);

  const { data: produitsResponse, isLoading } = useQuery({
    queryKey: ['produits-actifs-rdv'],
    queryFn: () => produitsApi.produits.getAll({
      actifs_only: 'true',
      statut_validation: 'valide',
      per_page: '500',
    }),
  });

  const produitsDisponibles: Produit[] = Array.isArray(produitsResponse?.data?.data)
    ? produitsResponse.data.data
    : Array.isArray(produitsResponse?.data)
    ? produitsResponse.data
    : [];

  // ── Recherche filtrée ──────────────────────────────────────

  const produitsFiltres = produitsDisponibles.filter((p) => {
    const terme = searchTerm.toLowerCase();
    if (p.nom.toLowerCase().includes(terme)) return true;
    return p.variantes?.some(v =>
      v.reference?.toLowerCase().includes(terme) ||
      v.attributs?.some(a => (a.valeur_formatee ?? a.valeur).toLowerCase().includes(terme))
    );
  });

  // ── Handlers ──────────────────────────────────────────────

  const ajouterVariante = (produit: Produit, variante: ProduitVariante) => {
    const existe = produits.find(p => p.varianteId === variante.id);

    if (existe) {
      onChange(produits.map(p =>
        p.varianteId === variante.id ? { ...p, quantite: p.quantite + 1 } : p
      ));
    } else {
      const attrLabel = getAttrLabel(variante);
      const nom       = attrLabel ? `${produit.nom} — ${attrLabel}` : produit.nom;

      // Source stock par défaut selon type_stock_principal
      const defaultSource: 'vente' | 'utilisation' =
        ['utilisation', 'mixte'].includes(variante.type_stock_principal)
          ? 'utilisation'
          : 'vente';

      onChange([
        ...produits,
        {
          varianteId:        variante.id,
          produitId:         produit.id,
          nom,
          reference:         variante.reference,
          prix_unitaire:     getPrixVariante(variante),
          quantite:          1,
          source_stock:      defaultSource,
          stock_vente:       getStockVente(variante),
          stock_utilisation: getStockUtilisation(variante),
        },
      ]);
    }

    setSearchTerm('');
    setShowSearch(false);
    setExpandedId(null);
  };

  const modifierQuantite = (varianteId: number, delta: number) => {
    onChange(
      produits
        .map(p => {
          if (p.varianteId !== varianteId) return p;
          const q = p.quantite + delta;
          return q > 0 ? { ...p, quantite: q } : null;
        })
        .filter(Boolean) as ProduitSelectionne[]
    );
  };

  const changerSourceStock = (varianteId: number, source: 'vente' | 'utilisation') => {
    onChange(produits.map(p => p.varianteId === varianteId ? { ...p, source_stock: source } : p));
  };

  const supprimerProduit = (varianteId: number) => {
    onChange(produits.filter(p => p.varianteId !== varianteId));
  };

  // ── Rendu résultat recherche ───────────────────────────────

  const renderResultat = (produit: Produit) => {
    const variantes     = produit.variantes ?? [];
    const hasMultiple   = variantes.length > 1;
    const isExpanded    = expandedId === produit.id;
    const premiere      = variantes[0];

    return (
      <div key={produit.id} className="border-b border-gray-100 last:border-b-0">
        {/* Ligne produit */}
        <div
          className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer"
          onClick={() => {
            if (!hasMultiple && premiere) {
              ajouterVariante(produit, premiere);
            } else {
              setExpandedId(isExpanded ? null : produit.id);
            }
          }}
        >
          <div>
            <p className="text-sm font-medium text-gray-900">{produit.nom}</p>
            {produit.marque && (
              <p className="text-xs text-gray-400">{produit.marque}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {premiere && (
              <span className="text-sm font-medium text-gray-800">
                {formatCurrency(getPrixVariante(premiere))} F
              </span>
            )}
            {hasMultiple && (
              <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">
                {variantes.length}
                {isExpanded
                  ? <ChevronUp className="inline w-3 h-3 ml-0.5" />
                  : <ChevronDown className="inline w-3 h-3 ml-0.5" />}
              </span>
            )}
          </div>
        </div>

        {/* Variantes dépliées */}
        {hasMultiple && isExpanded && (
          <div className="bg-gray-50 px-3 pb-2 space-y-1">
            {variantes.map(v => {
              const attrLabel = getAttrLabel(v);
              const stockUtil = getStockUtilisation(v);
              const stockVte  = getStockVente(v);
              const stockTotal = stockUtil + stockVte;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => ajouterVariante(produit, v)}
                  disabled={stockTotal === 0}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {attrLabel ?? v.reference ?? `Variante #${v.id}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Util: {stockUtil} · Vente: {stockVte}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    {formatCurrency(getPrixVariante(v))} F
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ── Render principal ──────────────────────────────────────

  return (
    <div className="space-y-3">

      {/* Bouton / Champ de recherche */}
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher un produit..."
            autoFocus
            className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          />
          <button
            type="button"
            onClick={() => { setShowSearch(false); setSearchTerm(''); setExpandedId(null); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>

          {searchTerm && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
              {isLoading ? (
                <div className="px-3 py-4 text-center text-sm text-gray-500">Chargement...</div>
              ) : produitsFiltres.length > 0 ? (
                produitsFiltres.map(renderResultat)
              ) : (
                <div className="px-3 py-4 text-center text-sm text-gray-500">Aucun produit trouvé</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Liste des produits sélectionnés */}
      {produits.length > 0 && (
        <div className="space-y-2">
          {produits.map(produit => {
            const stockDisponible = produit.source_stock === 'vente'
              ? produit.stock_vente
              : produit.stock_utilisation;

            return (
              <div key={produit.varianteId} className="p-3 border border-gray-200 rounded-lg bg-gray-50">

                {/* Nom + supprimer */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{produit.nom}</p>
                      {produit.reference && (
                        <p className="text-xs text-gray-500">Réf: {produit.reference}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => supprimerProduit(produit.varianteId)}
                    className="text-gray-400 hover:text-red-600 transition flex-shrink-0 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quantité */}
                <div className="flex items-center gap-3 mb-2">
                  <button type="button" onClick={() => modifierQuantite(produit.varianteId, -1)}
                    className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-medium text-gray-900 min-w-[30px] text-center">
                    {produit.quantite}
                  </span>
                  <button type="button" onClick={() => modifierQuantite(produit.varianteId, 1)}
                    disabled={produit.quantite >= stockDisponible}
                    className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed">
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-600">Stock:</span>
                  {produit.stock_utilisation > 0 && (
                    <button type="button"
                      onClick={() => changerSourceStock(produit.varianteId, 'utilisation')}
                      className={`px-2 py-1 rounded text-xs transition ${
                        produit.source_stock === 'utilisation'
                          ? 'bg-orange-100 text-orange-700 font-medium'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      Utilisation ({produit.stock_utilisation})
                    </button>
                  )}
                  {produit.stock_vente > 0 && (
                    <button type="button"
                      onClick={() => changerSourceStock(produit.varianteId, 'vente')}
                      className={`px-2 py-1 rounded text-xs transition ${
                        produit.source_stock === 'vente'
                          ? 'bg-orange-100 text-orange-700 font-medium'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      Vente ({produit.stock_vente})
                    </button>
                  )}
                </div>

                {/* Alerte stock */}
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