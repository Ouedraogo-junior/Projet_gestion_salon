// src/app/pages/ventes/components/ProduitsList.tsx

import React, { useState, useEffect } from 'react';
import { Search, Package, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { produitsApi } from '../../../../services/produitsApi';
import type { Produit, ProduitVariante, Categorie } from '../../../../types/produit.types';
import type { SourceStock } from '../../../../types/vente.types';

interface ProduitsListProps {
  onSelect: (produit: Produit, quantite: number, sourceStock: SourceStock, variante: ProduitVariante) => void;
}

export const ProduitsList: React.FC<ProduitsListProps> = ({ onSelect }) => {
  const [produits, setProduits]                 = useState<Produit[]>([]);
  const [categories, setCategories]             = useState<Categorie[]>([]);
  const [loading, setLoading]                   = useState(false);
  const [searchTerm, setSearchTerm]             = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState<number | undefined>();
  const [expandedProduit, setExpandedProduit]   = useState<number | null>(null);

  useEffect(() => {
    chargerCategories();
    chargerProduits();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => chargerProduits(), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategorie]);

  const chargerCategories = async () => {
    try {
      const response = await produitsApi.categories.getAll({ actives_only: true });
      if (response.success) setCategories(response.data.data || response.data);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  const chargerProduits = async () => {
    setLoading(true);
    try {
      const filters: any = {
        actifs_only:        'true',
        statut_validation:  'valide',
        per_page:           '500',
      };
      if (searchTerm)        filters.search        = searchTerm;
      if (selectedCategorie) filters.categorie_id  = String(selectedCategorie);

      const response = await produitsApi.produits.getAll(filters);
      if (response.success) setProduits(response.data.data || response.data);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (photoUrl?: string) => {
    if (!photoUrl) return null;
    const cleanUrl = photoUrl.replace(/^(storage\/)+/, '');
    return `${import.meta.env.VITE_API_URL}/storage/${cleanUrl}`;
  };

  // ── Helpers variante ──────────────────────────────────────

  const getPrixVariante = (v: ProduitVariante): number => {
    if (v.en_promotion && v.prix_promo) return v.prix_promo;
    return v.prix_vente ?? 0;
  };

  const getStockVenteVariante = (v: ProduitVariante): number =>
    ['vente', 'mixte'].includes(v.type_stock_principal)
      ? (v.stock_vente ?? 0)
      : 0;

  const getSeuilCritiqueVariante = (v: ProduitVariante): number =>
    v.seuil_critique ?? 0;

  // ── Handler sélection variante ────────────────────────────

  const handleSelectVariante = (produit: Produit, variante: ProduitVariante) => {
    const stock = getStockVenteVariante(variante);
    if (stock < 1) {
      alert('Stock insuffisant pour cette variante');
      return;
    }
    onSelect(produit, 1, 'vente', variante);
    // Refermer après sélection si multi-variantes
    if ((produit.variantes?.length ?? 0) > 1) setExpandedProduit(null);
  };

  // ── Rendu d'une ligne variante ────────────────────────────

  const renderVarianteLigne = (produit: Produit, variante: ProduitVariante) => {
    const prix         = getPrixVariante(variante);
    const stockVente   = getStockVenteVariante(variante);
    const seuilCrit    = getSeuilCritiqueVariante(variante);
    const stockCritique = stockVente <= seuilCrit && seuilCrit > 0;

    // Label : attributs ou référence
    const attrLabel = variante.attributs && variante.attributs.length > 0
      ? variante.attributs.map(a => a.valeur_formatee ?? a.valeur).join(' · ')
      : variante.reference ?? `Variante #${variante.id}`;

    return (
      <div key={variante.id}
        className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{attrLabel}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-sm font-bold text-green-600">
              {prix.toLocaleString()} F
            </span>
            {variante.en_promotion && variante.prix_promo && (
              <span className="text-xs text-gray-400 line-through">
                {(variante.prix_vente ?? 0).toLocaleString()} F
              </span>
            )}
            <span className={`text-xs ${stockCritique ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
              Stock : {stockVente}
            </span>
          </div>
        </div>

        <button
          onClick={() => handleSelectVariante(produit, variante)}
          disabled={stockVente < 1}
          className="flex-shrink-0 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1 transition"
        >
          <ShoppingCart size={12} />
          Ajouter
        </button>
      </div>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

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
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Filtres catégories */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        <button
          onClick={() => setSelectedCategorie(undefined)}
          className={`px-3 py-1 rounded-lg whitespace-nowrap text-sm transition ${
            selectedCategorie === undefined ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Tout
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategorie(cat.id)}
            className={`px-3 py-1 rounded-lg whitespace-nowrap text-sm transition ${
              selectedCategorie === cat.id ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
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
            const variantes      = produit.variantes ?? [];
            const imageUrl       = produit.photo_url ? getImageUrl(produit.photo_url) : null;
            const hasMultiple    = variantes.length > 1;
            const isExpanded     = expandedProduit === produit.id;
            const premiereVariante = variantes[0];

            // Fourchette de prix
            const prixMin = produit.prix_min ?? getPrixVariante(premiereVariante ?? {} as ProduitVariante);
            const prixMax = produit.prix_max ?? prixMin;
            const prixLabel = prixMin !== prixMax
              ? `${prixMin.toLocaleString()} – ${prixMax.toLocaleString()} F`
              : `${(prixMin ?? 0).toLocaleString()} F`;

            // Stock total vente agrégé
            const stockTotalVente = variantes.reduce((s, v) => s + getStockVenteVariante(v), 0);

            return (
              <div key={produit.id} className="border rounded-lg overflow-hidden hover:shadow-sm transition">

                {/* Header produit parent */}
                <div className="flex items-start gap-3 p-3">
                  {/* Image */}
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {imageUrl ? (
                      <img src={imageUrl} alt={produit.nom} className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <Package size={20} className="text-gray-400" />
                    )}
                  </div>

                  {/* Infos produit */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{produit.nom}</h4>
                    {produit.marque && (
                      <p className="text-xs text-gray-400">{produit.marque}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-bold text-green-600">{prixLabel}</span>
                      <span className={`text-xs ${stockTotalVente === 0 ? 'text-red-500' : 'text-gray-500'}`}>
                        Stock : {stockTotalVente}
                      </span>
                      {hasMultiple && (
                        <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">
                          {variantes.length} variantes
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bouton : produit à 1 seule variante → ajouter direct */}
                  {!hasMultiple && premiereVariante && (
                    <button
                      onClick={() => handleSelectVariante(produit, premiereVariante)}
                      disabled={getStockVenteVariante(premiereVariante) < 1}
                      className="flex-shrink-0 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1 transition"
                    >
                      <ShoppingCart size={12} />
                      Ajouter
                    </button>
                  )}

                  {/* Bouton : multi-variantes → expand */}
                  {hasMultiple && (
                    <button
                      onClick={() => setExpandedProduit(isExpanded ? null : produit.id)}
                      className="flex-shrink-0 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium hover:bg-indigo-100 flex items-center gap-1 transition"
                    >
                      Variantes
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  )}
                </div>

                {/* Variantes dépliées */}
                {hasMultiple && isExpanded && (
                  <div className="border-t bg-white px-3 pb-3 pt-2 space-y-2">
                    {variantes.map(v => renderVarianteLigne(produit, v))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};