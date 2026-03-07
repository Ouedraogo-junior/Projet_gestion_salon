// src/app/pages/public/components/ProduitDetailsModal.tsx

import React, { useEffect, useState } from 'react';
import { X, ShoppingCart, Loader2, Check } from 'lucide-react';
import { publicApiService } from '@/services/publicApi';
import type { ProduitPublicDetail, VariantePublique } from '@/types/public.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  produitId: number;
  onAddToCart: (produit: ProduitPublicDetail, variante: VariantePublique) => void;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(v);

export const ProduitDetailsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  produitId,
  onAddToCart,
}) => {
  const [produit, setProduit] = useState<ProduitPublicDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedVariante, setSelectedVariante] = useState<VariantePublique | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setProduit(null);
    setSelectedVariante(null);
    publicApiService
      .getProduitDetails(produitId)
      .then((res) => {
        if (res.success) {
          setProduit(res.data);
          // Pré-sélectionner la première variante disponible
          const dispo = res.data.variantes.find((v) => v.stock_vente > 0);
          setSelectedVariante(dispo ?? res.data.variantes[0] ?? null);
        }
      })
      .finally(() => setLoading(false));
  }, [isOpen, produitId]);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!produit || !selectedVariante) return;
    onAddToCart(produit, selectedVariante);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const varianteLabel = (v: VariantePublique) => {
    if (v.valeurs_attributs.length === 0) return v.reference ?? `#${v.id}`;
    return v.valeurs_attributs.map((va) => va.valeur).join(' – ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-800">Détails du produit</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-indigo-600" size={36} />
            </div>
          )}

          {!loading && produit && (
            <div className="space-y-5">
              {/* Image */}
              {produit.photo_url && (
                <img
                  src={produit.photo_url}
                  alt={produit.nom}
                  className="w-full h-56 object-cover rounded-xl"
                />
              )}

              {/* Infos produit */}
              <div>
                <h3 className="text-xl font-bold text-gray-900">{produit.nom}</h3>
                {produit.marque && (
                  <p className="text-sm text-gray-500 mt-1">{produit.marque}</p>
                )}
                {produit.categorie && (
                  <span
                    className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: produit.categorie.couleur ?? '#6366f1' }}
                  >
                    {produit.categorie.nom}
                  </span>
                )}
                {produit.description && (
                  <p className="mt-3 text-sm text-gray-600">{produit.description}</p>
                )}
              </div>

              {/* Sélection variante */}
              {produit.variantes.length > 1 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Choisissez une option
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {produit.variantes.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariante(v)}
                        disabled={v.stock_vente === 0}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition
                          ${selectedVariante?.id === v.id
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                            : 'border-gray-200 text-gray-700 hover:border-indigo-300'}
                          ${v.stock_vente === 0 ? 'opacity-40 cursor-not-allowed line-through' : ''}
                        `}
                      >
                        {varianteLabel(v)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Prix variante sélectionnée */}
              {selectedVariante && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                  {selectedVariante.en_promo && selectedVariante.prix_promo ? (
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-bold text-red-600">
                        {fmt(selectedVariante.prix_promo)} FCFA
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {fmt(selectedVariante.prix_vente)} FCFA
                      </span>
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                        -{Math.round(((selectedVariante.prix_vente - selectedVariante.prix_promo) / selectedVariante.prix_vente) * 100)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-indigo-600">
                      {fmt(selectedVariante.prix_vente)} FCFA
                    </span>
                  )}
                  <p className="text-xs text-gray-500">
                    {selectedVariante.stock_vente > 0
                      ? `${selectedVariante.stock_vente} en stock`
                      : 'Épuisé'}
                  </p>
                </div>
              )}

              {/* Attributs de la variante sélectionnée */}
              {selectedVariante && selectedVariante.valeurs_attributs.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Caractéristiques</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedVariante.valeurs_attributs.map((va) => (
                      <div key={va.id} className="bg-gray-50 rounded-lg p-2.5">
                        <p className="text-xs text-gray-400">{va.attribut.nom}</p>
                        <p className="text-sm font-medium text-gray-800">
                          {va.valeur}
                          {va.attribut.unite ? ` ${va.attribut.unite}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — bouton ajouter */}
        {!loading && produit && selectedVariante && (
          <div className="p-5 border-t sticky bottom-0 bg-white">
            <button
              onClick={handleAdd}
              disabled={selectedVariante.stock_vente === 0 || added}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all
                ${added
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
            >
              {added ? (
                <><Check size={20} /> Ajouté au panier</>
              ) : (
                <><ShoppingCart size={20} /> Ajouter au panier</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};