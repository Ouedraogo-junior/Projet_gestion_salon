// src/hooks/useCart.ts

import { useState, useCallback } from 'react';
import type { CartItem, VariantePublique, ProduitPublicDetail } from '@/types/public.types';

/** Construit un label lisible à partir des attributs de la variante */
function buildVarianteLabel(variante: VariantePublique): string {
  if (variante.valeurs_attributs.length === 0) {
    return variante.reference ?? `Variante #${variante.id}`;
  }
  return variante.valeurs_attributs
    .map((va) => va.valeur)
    .join(' – ');
}

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback(
    (produit: ProduitPublicDetail, variante: VariantePublique, quantite = 1) => {
      const key = `${produit.id}-${variante.id}`;
      setItems((prev) => {
        const existing = prev.find((i) => i.key === key);
        if (existing) {
          return prev.map((i) =>
            i.key === key
              ? { ...i, quantite: Math.min(i.quantite + quantite, i.stock_max) }
              : i
          );
        }
        return [
          ...prev,
          {
            key,
            produit_id: produit.id,
            produit_nom: produit.nom,
            produit_photo: produit.photo_url,
            variante_id: variante.id,
            variante_label: buildVarianteLabel(variante),
            prix_unitaire: variante.prix_actuel,
            quantite,
            stock_max: variante.stock_vente,
          },
        ];
      });
    },
    []
  );

  const updateQuantite = useCallback((key: string, quantite: number) => {
    setItems((prev) =>
      quantite <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, quantite: Math.min(quantite, i.stock_max) } : i))
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.prix_unitaire * i.quantite, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantite, 0);

  return { items, addItem, updateQuantite, removeItem, clearCart, total, totalItems };
};