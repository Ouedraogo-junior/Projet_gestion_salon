// src/app/pages/Rapports/components/TresorerieView.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { ArrowDownCircle, ArrowUpCircle, AlertCircle } from 'lucide-react';
import type { Tresorerie } from '@/types/rapport.types';

interface TresorerieViewProps {
  data?: Tresorerie;
}

export function TresorerieView({ data }: TresorerieViewProps) {
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
      {/* Solde net */}
      <Card className={data.solde_net >= 0 ? 'border-green-500' : 'border-red-500'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {data.solde_net >= 0 ? (
              <ArrowUpCircle className="h-5 w-5 text-green-600" />
            ) : (
              <ArrowDownCircle className="h-5 w-5 text-red-600" />
            )}
            Solde Net de Trésorerie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-4xl font-bold ${data.solde_net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatMontant(data.solde_net)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Encaissements - Décaissements
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Encaissements */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-600">
              <ArrowUpCircle className="h-5 w-5" />
              Encaissements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Espèces</span>
                <span className="font-semibold">{formatMontant(data.encaissements.especes)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Orange Money</span>
                <span className="font-semibold">{formatMontant(data.encaissements.orange_money)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Moov Money</span>
                <span className="font-semibold">{formatMontant(data.encaissements.moov_money)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Carte bancaire</span>
                <span className="font-semibold">{formatMontant(data.encaissements.carte)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-sm">Acomptes RDV</span>
                <span className="font-semibold text-blue-600">
                  {formatMontant(data.encaissements.acomptes_rdv)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <span className="font-semibold">Total Encaissements</span>
              <span className="text-xl font-bold text-green-600">
                {formatMontant(data.encaissements.total)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Décaissements */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-600">
              <ArrowDownCircle className="h-5 w-5" />
              Décaissements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Dépenses opérationnelles</span>
                <span className="font-semibold">
                  {formatMontant(data.decaissements.depenses_operationnelles)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Achats de stock</span>
                <span className="font-semibold">{formatMontant(data.decaissements.achats_stock)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Coûts confections</span>
                <span className="font-semibold">{formatMontant(data.decaissements.confections)}</span>
              </div>
              {/* ✅ AJOUTÉ : Salaires */}
              <div className="flex items-center justify-between">
                <span className="text-sm">Salaires</span>
                <span className="font-semibold text-purple-600">
                  {formatMontant(data.decaissements.salaires)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <span className="font-semibold">Total Décaissements</span>
              <span className="text-xl font-bold text-red-600">
                {formatMontant(data.decaissements.total)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Créances */}
      {data.creances.nb_factures > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Créances à recouvrer</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Nombre de factures impayées :</span>
                <span className="font-semibold">{data.creances.nb_factures}</span>
              </div>
              <div className="flex justify-between">
                <span>Montant total à recouvrer :</span>
                <span className="font-semibold text-orange-600">
                  {formatMontant(data.creances.ventes_impayes)}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              ⚠️ Ces montants ne sont pas inclus dans la trésorerie (comptabilité de caisse)
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Résumé visuel */}
      <Card>
        <CardHeader>
          <CardTitle>Flux de Trésorerie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-green-600">
              <span className="flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4" />
                Entrées d'argent
              </span>
              <span className="font-bold">{formatMontant(data.encaissements.total)}</span>
            </div>
            <div className="flex items-center justify-between text-red-600">
              <span className="flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4" />
                Sorties d'argent
              </span>
              <span className="font-bold">{formatMontant(data.decaissements.total)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="font-semibold">Solde</span>
              <span className={`text-xl font-bold ${data.solde_net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatMontant(data.solde_net)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}