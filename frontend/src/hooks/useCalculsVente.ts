// src/hooks/useCalculsVente.ts

import { useMemo } from 'react';
import type { ArticlePanier, Reduction, Paiement } from '../types/vente.types';

interface UseCalculsVenteProps {
  articles: ArticlePanier[];
  reduction?: Reduction;
  pointsUtilises?: number;
}

export const useCalculsVente = ({
  articles,
  reduction,
  pointsUtilises = 0,
}: UseCalculsVenteProps) => {
  
  const totaux = useMemo(() => {
    // 1. Calculer montant HT des articles
    const montantHT = articles.reduce((sum, article) => {
      const sousTotal = (article.prix_unitaire * article.quantite) - article.reduction;
      return sum + sousTotal;
    }, 0);

    // 2. Calculer réduction globale
    let montantReduction = 0;
    if (reduction) {
      if (reduction.type === 'pourcentage') {
        montantReduction = (montantHT * reduction.valeur) / 100;
      } else {
        montantReduction = reduction.valeur;
      }
    }

    // 3. Calculer réduction par points
    let montantReductionPoints = 0;
    if (pointsUtilises > 0) {
      // 100 points = 1000 FCFA
      montantReductionPoints = (pointsUtilises / 100) * 1000;
    }

    // 4. Calculer montant total TTC
    const montantTTC = Math.max(0, montantHT - montantReduction - montantReductionPoints);

    // 5. Calculer points gagnés (1 point par 1000 FCFA)
    const pointsGagnes = Math.floor(montantTTC / 1000);

    return {
      montantHT,
      montantReduction,
      montantReductionPoints,
      montantTTC,
      pointsGagnes,
      totalReductionGlobale: montantReduction + montantReductionPoints,
    };
  }, [articles, reduction, pointsUtilises]);

  /**
   * Valider les paiements
   */
  const validerPaiements = (paiements: Paiement[]) => {
    const totalPaiements = paiements.reduce((sum, p) => sum + p.montant, 0);
    const montantManquant = totaux.montantTTC - totalPaiements;
    const montantRendu = Math.max(0, totalPaiements - totaux.montantTTC);

    return {
      totalPaiements,
      montantManquant,
      montantRendu,
      estValide: montantManquant <= 0,
    };
  };

  /**
   * Calculer le pourcentage de réduction
   */
  const pourcentageReduction = useMemo(() => {
    if (totaux.montantHT === 0) return 0;
    return (totaux.totalReductionGlobale / totaux.montantHT) * 100;
  }, [totaux]);

  /**
   * Formater un montant en FCFA
   */
  const formaterMontant = (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant);
  };

  return {
    totaux,
    validerPaiements,
    pourcentageReduction,
    formaterMontant,
  };
};