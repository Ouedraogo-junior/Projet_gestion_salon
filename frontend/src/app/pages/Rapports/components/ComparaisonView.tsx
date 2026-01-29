// src/app/pages/Rapports/components/ComparaisonView.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ComparaisonPeriodes } from '@/types/rapport.types';

interface ComparaisonViewProps {
  data?: ComparaisonPeriodes;
}

export function ComparaisonView({ data }: ComparaisonViewProps) {
  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Aucune donnée disponible
        </CardContent>
      </Card>
    );
  }

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant);
  };

  const getEvolutionBadge = (pourcentage: number) => {
    if (pourcentage > 0) {
      return (
        <Badge variant="outline" className="border-green-500 text-green-600">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{pourcentage.toFixed(2)}%
        </Badge>
      );
    } else if (pourcentage < 0) {
      return (
        <Badge variant="outline" className="border-red-500 text-red-600">
          <TrendingDown className="h-3 w-3 mr-1" />
          {pourcentage.toFixed(2)}%
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="border-gray-500 text-gray-600">
          <Minus className="h-3 w-3 mr-1" />
          0%
        </Badge>
      );
    }
  };

  const actuelle = data.periode_actuelle;
  const precedente = data.periode_precedente;

  return (
    <div className="space-y-6">
      {/* Header comparaison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Période Actuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{actuelle.periode.libelle}</p>
            <p className="text-xs text-muted-foreground">
              Du {actuelle.periode.date_debut} au {actuelle.periode.date_fin}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Période Précédente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{precedente.periode.libelle}</p>
            <p className="text-xs text-muted-foreground">
              Du {precedente.periode.date_debut} au {precedente.periode.date_fin}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Évolutions principales */}
      <Card>
        <CardHeader>
          <CardTitle>Évolutions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* CA */}
            <div className="flex items-center justify-between">
              <span className="font-medium">Chiffre d'Affaires</span>
              {getEvolutionBadge(data.evolution.ca_pct)}
            </div>

            {/* Bénéfice */}
            <div className="flex items-center justify-between">
              <span className="font-medium">Bénéfice Net</span>
              {getEvolutionBadge(data.evolution.benefice_pct)}
            </div>

            {/* Dépenses */}
            <div className="flex items-center justify-between">
              <span className="font-medium">Dépenses</span>
              {getEvolutionBadge(data.evolution.depenses_pct)}
            </div>

            {/* Nombre de ventes */}
            <div className="flex items-center justify-between">
              <span className="font-medium">Nombre de Ventes</span>
              {getEvolutionBadge(data.evolution.nb_ventes_pct)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparaison CA */}
      <Card>
        <CardHeader>
          <CardTitle>Chiffre d'Affaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Période précédente</p>
              <p className="text-2xl font-bold">{formatMontant(precedente.chiffre_affaires.total)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Période actuelle</p>
              <p className="text-2xl font-bold">{formatMontant(actuelle.chiffre_affaires.total)}</p>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <span className="text-sm">Différence</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {formatMontant(actuelle.chiffre_affaires.total - precedente.chiffre_affaires.total)}
              </span>
              {getEvolutionBadge(data.evolution.ca_pct)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparaison Bénéfice */}
      <Card>
        <CardHeader>
          <CardTitle>Bénéfice Net</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Période précédente</p>
              <p className="text-2xl font-bold">{formatMontant(precedente.benefice.net)}</p>
              <p className="text-xs text-muted-foreground">
                Marge : {precedente.benefice.marge_nette_pct}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Période actuelle</p>
              <p className="text-2xl font-bold">{formatMontant(actuelle.benefice.net)}</p>
              <p className="text-xs text-muted-foreground">
                Marge : {actuelle.benefice.marge_nette_pct}%
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <span className="text-sm">Différence</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {formatMontant(actuelle.benefice.net - precedente.benefice.net)}
              </span>
              {getEvolutionBadge(data.evolution.benefice_pct)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparaison Dépenses */}
      <Card>
        <CardHeader>
          <CardTitle>Dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Période précédente</p>
              <p className="text-2xl font-bold">{formatMontant(precedente.depenses.total)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Période actuelle</p>
              <p className="text-2xl font-bold">{formatMontant(actuelle.depenses.total)}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <span className="text-sm">Différence</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {formatMontant(actuelle.depenses.total - precedente.depenses.total)}
              </span>
              {getEvolutionBadge(data.evolution.depenses_pct)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparaison Statistiques */}
      <Card>
        <CardHeader>
          <CardTitle>Activité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Nombre de ventes</span>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">{precedente.statistiques.nb_ventes}</span>
                <span className="font-semibold">{actuelle.statistiques.nb_ventes}</span>
                {getEvolutionBadge(data.evolution.nb_ventes_pct)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Clients uniques</span>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">{precedente.statistiques.nb_clients}</span>
                <span className="font-semibold">{actuelle.statistiques.nb_clients}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Panier moyen</span>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">
                  {formatMontant(precedente.statistiques.panier_moyen)}
                </span>
                <span className="font-semibold">{formatMontant(actuelle.statistiques.panier_moyen)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}