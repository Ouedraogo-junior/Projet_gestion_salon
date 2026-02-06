// src/app/pages/ventes/components/Panier.tsx

import React from 'react';
import { ShoppingCart, Trash2, Minus, Plus, User } from 'lucide-react';
import type { ArticlePanier } from '../../../../types/vente.types';
import type { Client } from '../../../../types/vente.types';

interface PanierProps {
  articles: ArticlePanier[];
  onQuantiteChange: (index: number, quantite: number) => void;
  onPrixChange: (index: number, prix: number) => void;
  onReductionChange: (index: number, reduction: number) => void;
  onSupprimer: (index: number) => void;
  montantHT: number;
  montantReduction: number;
  montantTTC: number;
  clientSelectionne?: Client | null;
}

export const Panier: React.FC<PanierProps> = ({
  articles,
  onQuantiteChange,
  onPrixChange,
  onReductionChange,
  onSupprimer,
  montantHT,
  montantReduction,
  montantTTC,
  clientSelectionne,
}) => {
  // LOG DE DEBUG - À RETIRER APRÈS
  //console.log('Panier - clientSelectionne:', clientSelectionne);

  const formaterMontant = (montant: number): string => {
    return montant.toLocaleString('fr-FR') + ' F';
  };

  const calculerSousTotal = (article: ArticlePanier): number => {
    return (article.prix_unitaire * article.quantite) - article.reduction;
  };

  return (
    <div className="bg-white p-4 rounded-lg border h-full flex flex-col">
      {/* Affichage client sélectionné */}
      {clientSelectionne && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {clientSelectionne.prenom.charAt(0)}{clientSelectionne.nom.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-blue-900 truncate">
                {clientSelectionne.prenom} {clientSelectionne.nom}
              </p>
              <p className="text-xs text-blue-700">{clientSelectionne.telephone}</p>
            </div>
            {clientSelectionne.points_fidelite > 0 && (
              <div className="text-right">
                <p className="text-xs text-blue-600 font-medium">
                  {clientSelectionne.points_fidelite} pts
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <ShoppingCart size={18} />
        Panier ({articles.length})
      </h3>

      {/* Liste des articles */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 max-h-96">
        {articles.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
            <p>Panier vide</p>
            <p className="text-xs mt-1">Ajoutez des produits ou prestations</p>
          </div>
        ) : (
          articles.map((article, index) => (
            <div
              key={`${article.type}-${article.id}-${index}`}
              className="border rounded p-3 space-y-2 hover:bg-gray-50 transition"
            >
              {/* Nom et type */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{article.nom}</p>
                  <p className="text-xs text-gray-500">
                    {article.type === 'prestation' ? '✂️ Prestation' : '📦 Produit'}
                    {article.source_stock && ` (${article.source_stock})`}
                  </p>
                </div>
                <button
                  onClick={() => onSupprimer(index)}
                  className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Quantité */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Qté:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onQuantiteChange(index, article.quantite - 1)}
                    className="p-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                    disabled={article.quantite <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={article.quantite}
                    onChange={(e) =>
                      onQuantiteChange(index, parseInt(e.target.value) || 1)
                    }
                    className="w-16 text-center border rounded py-1 focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                  <button
                    onClick={() => onQuantiteChange(index, article.quantite + 1)}
                    className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Prix unitaire */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Prix unitaire:</span>
                <input
                  type="number"
                  value={article.prix_unitaire}
                  onChange={(e) =>
                    onPrixChange(index, parseFloat(e.target.value) || 0)
                  }
                  className="flex-1 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="100"
                />
                <span className="text-sm">F</span>
              </div>

              {/* Réduction */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Réduction:</span>
                <input
                  type="number"
                  value={article.reduction}
                  onChange={(e) =>
                    onReductionChange(index, parseFloat(e.target.value) || 0)
                  }
                  className="flex-1 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="100"
                />
                <span className="text-sm">F</span>
              </div>

              {/* Sous-total */}
              <div className="text-right font-semibold text-blue-600 pt-2 border-t">
                {formaterMontant(calculerSousTotal(article))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totaux */}
      {articles.length > 0 && (
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sous-total HT:</span>
            <span className="font-medium">{formaterMontant(montantHT)}</span>
          </div>

          {montantReduction > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Réduction:</span>
              <span className="font-medium text-red-600">
                - {formaterMontant(montantReduction)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>TOTAL TTC:</span>
            <span className="text-blue-600">{formaterMontant(montantTTC)}</span>
          </div>
        </div>
      )}
    </div>
  );
};