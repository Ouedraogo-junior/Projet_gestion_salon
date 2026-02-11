import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ChevronDown, ChevronUp, User, Clock, CreditCard, Calendar } from 'lucide-react';
import type { VentesDetail } from '@/types/rapport.types';

interface VentesDetailAvecTransactionsProps {
  data?: VentesDetail & {
    transactions?: Array<{
      id: number;
      type: string;
      montant: number | string;
      mode_paiement: string;
      date: string;
      vendeur?: { prenom: string; nom: string };
      client?: { prenom: string; nom: string };
      prestation?: { nom: string };
      produit?: { nom: string };
    }>;
  };
}

export function VentesDetailAvecTransactions({ data }: VentesDetailAvecTransactionsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    paiements: false,
    transactions: true,
    prestations: false,
    produits: false,
  });

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Aucune donnée disponible
        </CardContent>
      </Card>
    );
  }

  const formatMontant = (montant: number | string) => {
    const value = typeof montant === 'string' ? parseFloat(montant) : montant;
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) + ' FCFA';
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const formatHeure = (dateStr: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getModePaiementColor = (mode: string) => {
    const colors: Record<string, string> = {
      especes: 'bg-green-100 text-green-800',
      orange_money: 'bg-orange-100 text-orange-800',
      moov_money: 'bg-blue-100 text-blue-800',
      carte_bancaire: 'bg-purple-100 text-purple-800',
    };
    return colors[mode] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      prestation: 'bg-blue-100 text-blue-800',
      produit: 'bg-green-100 text-green-800',
      acompte: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {/* Liste des transactions détaillées */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition"
          onClick={() => toggleSection('transactions')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Toutes les Transactions</CardTitle>
            {expandedSections.transactions ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </CardHeader>
        
        {expandedSections.transactions && (
          <CardContent>
            {!data.transactions || data.transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune transaction sur cette période
              </p>
            ) : (
              <div className="space-y-3">
                {data.transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(transaction.type)}>
                          {transaction.type}
                        </Badge>
                        <span className="font-bold text-lg">
                          {formatMontant(transaction.montant)}
                        </span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={getModePaiementColor(transaction.mode_paiement)}
                      >
                        {transaction.mode_paiement.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {/* Date et heure */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(transaction.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{formatHeure(transaction.date)}</span>
                      </div>

                      {/* Vendeur */}
                      {transaction.vendeur && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span>{transaction.vendeur.prenom} {transaction.vendeur.nom}</span>
                        </div>
                      )}

                      {/* Client */}
                      {transaction.client && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="font-medium">
                            {transaction.client.prenom} {transaction.client.nom}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Détail prestation/produit */}
                    {transaction.prestation && (
                      <div className="mt-2 text-sm text-gray-700">
                        <span className="font-medium">Prestation:</span> {transaction.prestation.nom}
                      </div>
                    )}
                    {transaction.produit && (
                      <div className="mt-2 text-sm text-gray-700">
                        <span className="font-medium">Produit:</span> {transaction.produit.nom}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Ventes par mode de paiement */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition"
          onClick={() => toggleSection('paiements')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Par Mode de Paiement</CardTitle>
            {expandedSections.paiements ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </CardHeader>
        
        {expandedSections.paiements && (
          <CardContent>
            <div className="space-y-3">
              {data.par_mode_paiement.map((mode) => (
                <div key={mode.mode} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getModePaiementColor(mode.mode)}>
                      {mode.mode.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {mode.nb_transactions} transaction{mode.nb_transactions > 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="font-semibold">{formatMontant(mode.montant)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Top prestations */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition"
          onClick={() => toggleSection('prestations')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Top 10 Prestations</CardTitle>
            {expandedSections.prestations ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </CardHeader>
        
        {expandedSections.prestations && (
          <CardContent>
            {data.top_prestations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune prestation vendue sur cette période
              </p>
            ) : (
              <div className="space-y-3">
                {data.top_prestations.map((prestation, index) => (
                  <div key={prestation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
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
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Top produits */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition"
          onClick={() => toggleSection('produits')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Top 10 Produits</CardTitle>
            {expandedSections.produits ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </CardHeader>
        
        {expandedSections.produits && (
          <CardContent>
            {data.top_produits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun produit vendu sur cette période
              </p>
            ) : (
              <div className="space-y-3">
                {data.top_produits.map((produit, index) => (
                  <div key={produit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
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
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}