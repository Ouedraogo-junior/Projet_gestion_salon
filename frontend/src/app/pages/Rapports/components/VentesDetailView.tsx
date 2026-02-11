// src/app/pages/Rapports/components/VentesDetailView.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import type { VentesDetail } from '@/types/rapport.types';

interface VentesDetailViewProps {
  data?: VentesDetail;
}

export function VentesDetailView({ data }: VentesDetailViewProps) {
  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Aucune donnée disponible
        </CardContent>
      </Card>
    );
  }

  // 🔍 DEBUGGING - Afficher toutes les données reçues
  // console.log('📊 VentesDetailView - Données complètes:', data);
  // console.log('🎯 Top Prestations:', data.top_prestations);
  // console.log('📦 Top Produits:', data.top_produits);
  // console.log('💰 Par Mode Paiement:', data.par_mode_paiement);
  // console.log('📅 Par Jour:', data.par_jour);

  const formatMontant = (montant: number | string) => {
    //console.log('💵 formatMontant input:', montant, 'type:', typeof montant);
    const value = typeof montant === 'string' ? parseFloat(montant) : montant;
    //console.log('💵 formatMontant value après conversion:', value);
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) + ' FCFA';
  };

  return (
    <div className="space-y-6">
      {/* Ventes par mode de paiement */}
      <Card>
        <CardHeader>
          <CardTitle>Ventes par Mode de Paiement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.par_mode_paiement.map((mode) => {
              //console.log('💳 Mode paiement:', mode);
              return (
                <div key={mode.mode} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{mode.mode}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {mode.nb_transactions} transaction{mode.nb_transactions > 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="font-semibold">{formatMontant(mode.montant)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ventes par type */}
      <Card>
        <CardHeader>
          <CardTitle>Ventes par Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.par_type.map((type) => {
             // console.log('🏷️ Type vente:', type);
              return (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge>{type.type}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {type.nb_ventes} vente{type.nb_ventes > 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="font-semibold">{formatMontant(type.montant)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top prestations */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Prestations</CardTitle>
        </CardHeader>
        <CardContent>
          {data.top_prestations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune prestation vendue sur cette période
            </p>
          ) : (
            <div className="space-y-3">
              {data.top_prestations.map((prestation, index) => {
                // console.log(`🎯 Prestation #${index + 1}:`, prestation);
                // console.log(`  - Nom: ${prestation.nom}`);
                // console.log(`  - Nb ventes: ${prestation.nb_ventes}`);
                // console.log(`  - Montant total: ${prestation.montant_total}`);
                return (
                  <div key={prestation.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{prestation.nom}</p>
                        <p className="text-xs text-muted-foreground">
                          {prestation.nb_ventes} vente{prestation.nb_ventes > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold">{formatMontant(prestation.montant_total)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top produits */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Produits</CardTitle>
        </CardHeader>
        <CardContent>
          {data.top_produits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun produit vendu sur cette période
            </p>
          ) : (
            <div className="space-y-3">
              {data.top_produits.map((produit, index) => {
                // console.log(`📦 Produit #${index + 1}:`, produit);
                // console.log(`  - Nom: ${produit.nom}`);
                // console.log(`  - Quantité vendue: ${produit.quantite_vendue}`);
                // console.log(`  - Montant total: ${produit.montant_total}`);
                return (
                  <div key={produit.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{produit.nom}</p>
                        <p className="text-xs text-muted-foreground">
                          {produit.quantite_vendue} unité{produit.quantite_vendue > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold">{formatMontant(produit.montant_total)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ventes par jour (tableau simple) */}
      <Card>
        <CardHeader>
          <CardTitle>Ventes par Jour</CardTitle>
        </CardHeader>
        <CardContent>
          {data.par_jour.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune vente sur cette période
            </p>
          ) : (
            <div className="space-y-2">
              {data.par_jour.slice(0, 10).map((jour) => {
                //console.log('📅 Jour:', jour);
                return (
                  <div key={jour.date} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{jour.date}</p>
                      <p className="text-xs text-muted-foreground">
                        {jour.nb_ventes} vente{jour.nb_ventes > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="font-semibold">{formatMontant(jour.montant)}</span>
                  </div>
                );
              })}
              {data.par_jour.length > 10 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  ... et {data.par_jour.length - 10} autres jour(s)
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}