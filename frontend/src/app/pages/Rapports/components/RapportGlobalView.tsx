// src/app/pages/Rapports/components/RapportGlobalView.tsx

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Calendar, Briefcase } from 'lucide-react';
import type { RapportGlobal } from '@/types/rapport.types';

interface RapportGlobalViewProps {
  data?: RapportGlobal;
}

export function RapportGlobalView({ data }: RapportGlobalViewProps) {
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

  return (
    <div className="space-y-6">
      {/* Titre période */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {data.periode.libelle}
          </CardTitle>
          <CardDescription>
            Du {data.periode.date_debut} au {data.periode.date_fin} ({data.periode.jours} jours)
          </CardDescription>
        </CardHeader>
      </Card>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Chiffre d'affaires */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMontant(data.chiffre_affaires.total)}</div>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Ventes directes</span>
                <span>{formatMontant(data.chiffre_affaires.ventes_directes)}</span>
              </div>
              <div className="flex justify-between">
                <span>Acomptes RDV</span>
                <span>{formatMontant(data.chiffre_affaires.acomptes_rdv)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bénéfice net */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bénéfice Net</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.benefice.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatMontant(data.benefice.net)}
            </div>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Marge nette</span>
                <span>{data.benefice.marge_nette_pct}%</span>
              </div>
              <div className="flex justify-between">
                <span>Marge brute</span>
                <span>{data.benefice.marge_brute_pct}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dépenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dépenses Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatMontant(data.depenses.total)}
            </div>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Confections</span>
                <span>{formatMontant(data.depenses.confections)}</span>
              </div>
              <div className="flex justify-between">
                <span>Salaires</span>
                <span className="text-purple-600">{formatMontant(data.depenses.salaires)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détails CA */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition du Chiffre d'Affaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Prestations</span>
              <span className="font-semibold">{formatMontant(data.chiffre_affaires.prestations)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Produits</span>
              <span className="font-semibold">{formatMontant(data.chiffre_affaires.produits)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Confections vendues</span>
              <span className="font-semibold">{formatMontant(data.chiffre_affaires.confections_vendues)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-sm">Acomptes RDV</span>
              <span className="font-semibold text-blue-600">
                {formatMontant(data.chiffre_affaires.acomptes_rdv)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dépenses par catégorie */}
        <Card>
          <CardHeader>
            <CardTitle>Dépenses par Catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.depenses.par_categorie.map((cat) => (
                <div key={cat.categorie} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{cat.categorie}</span>
                    <span className="text-xs text-muted-foreground">({cat.pourcentage}%)</span>
                  </div>
                  <span className="font-semibold">{formatMontant(cat.montant)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Salaires détail - NOUVEAU */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Salaires ({data.periode.jours} jours)
            </CardTitle>
            <CardDescription>
              {data.salaires_detail.nombre_employes} employé(s) · 
              Total mensuel: {formatMontant(data.depenses.salaires_mensuel_total)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.salaires_detail.employes.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{emp.nom_complet}</p>
                    <p className="text-xs text-muted-foreground capitalize">{emp.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-purple-600">
                      {formatMontant(emp.salaire_periode)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      / {formatMontant(emp.salaire_mensuel)} mois
                    </p>
                  </div>
                </div>
              ))}
              
              <div className="flex items-center justify-between border-t pt-3">
                <span className="font-semibold">Total période</span>
                <span className="text-lg font-bold text-purple-600">
                  {formatMontant(data.salaires_detail.total_periode)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activité Ventes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Nombre de ventes
              </span>
              <span className="font-semibold">{data.statistiques.nb_ventes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Clients uniques
              </span>
              <span className="font-semibold">{data.statistiques.nb_clients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Panier moyen</span>
              <span className="font-semibold">{formatMontant(data.statistiques.panier_moyen)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rendez-vous</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">RDV honorés</span>
              <span className="font-semibold">{data.statistiques.nb_rdv_honores}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Taux d'annulation</span>
              <span className="font-semibold">{data.statistiques.taux_annulation_rdv}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}