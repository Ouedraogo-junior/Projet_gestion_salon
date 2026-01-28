// hooks/usePanier.ts

import { useState, useCallback, useMemo } from 'react';
import type { ArticlePanier, TypeArticle, SourceStock } from '../types/vente.types';

export const usePanier = () => {
  const [articles, setArticles] = useState<ArticlePanier[]>([]);

  /**
   * Ajouter un article au panier
   */
  const ajouterArticle = useCallback((
    id: number,
    type: TypeArticle,
    nom: string,
    prixUnitaire: number,
    sourceStock?: SourceStock,
    reference?: string
  ) => {
    setArticles((prev) => {
      // Vérifier si l'article existe déjà
      const existingIndex = prev.findIndex(
        (item) => item.id === id && item.type === type && item.source_stock === sourceStock
      );

      if (existingIndex !== -1) {
        // Incrémenter la quantité
        const updated = [...prev];
        updated[existingIndex].quantite += 1;
        return updated;
      }

      // Ajouter nouvel article
      return [
        ...prev,
        {
          id,
          type,
          nom,
          prix_unitaire: prixUnitaire,
          quantite: 1,
          reduction: 0,
          source_stock: sourceStock,
          reference,
        },
      ];
    });
  }, []);

  /**
   * Modifier la quantité d'un article
   */
  const modifierQuantite = useCallback((index: number, quantite: number) => {
    if (quantite < 1) return;

    setArticles((prev) => {
      const updated = [...prev];
      updated[index].quantite = quantite;
      return updated;
    });
  }, []);

  /**
   * Modifier le prix unitaire d'un article
   */
  const modifierPrix = useCallback((index: number, prix: number) => {
    if (prix < 0) return;

    setArticles((prev) => {
      const updated = [...prev];
      updated[index].prix_unitaire = prix;
      return updated;
    });
  }, []);

  /**
   * Appliquer une réduction sur un article
   */
  const appliquerReductionArticle = useCallback((index: number, reduction: number) => {
    if (reduction < 0) return;

    setArticles((prev) => {
      const updated = [...prev];
      updated[index].reduction = reduction;
      return updated;
    });
  }, []);

  /**
   * Supprimer un article du panier
   */
  const supprimerArticle = useCallback((index: number) => {
    setArticles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Vider le panier
   */
  const viderPanier = useCallback(() => {
    setArticles([]);
  }, []);

  /**
   * Calculer le sous-total d'un article
   */
  const calculerSousTotal = useCallback((article: ArticlePanier): number => {
    return (article.prix_unitaire * article.quantite) - article.reduction;
  }, []);

  /**
   * Calculs globaux
   */
  const totaux = useMemo(() => {
    const montantPrestations = articles
      .filter((a) => a.type === 'prestation')
      .reduce((sum, a) => sum + calculerSousTotal(a), 0);

    const montantProduits = articles
      .filter((a) => a.type === 'produit')
      .reduce((sum, a) => sum + calculerSousTotal(a), 0);

    const totalHT = montantPrestations + montantProduits;

    const totalReductions = articles.reduce((sum, a) => sum + a.reduction, 0);

    return {
      montantPrestations,
      montantProduits,
      totalHT,
      totalReductions,
      nombreArticles: articles.length,
      quantiteTotale: articles.reduce((sum, a) => sum + a.quantite, 0),
    };
  }, [articles, calculerSousTotal]);

  return {
    articles,
    ajouterArticle,
    modifierQuantite,
    modifierPrix,
    appliquerReductionArticle,
    supprimerArticle,
    viderPanier,
    calculerSousTotal,
    totaux,
  };
};