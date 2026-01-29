// src/app/pages/Rapports/RapportsPage.tsx

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Loader2 } from 'lucide-react';

// Composants rapports
import { PeriodeSelector } from './components/PeriodeSelector';
import { RapportGlobalView } from './components/RapportGlobalView';
import { VentesDetailView } from './components/VentesDetailView';
import { TresorerieView } from './components/TresorerieView';
import { ComparaisonView } from './components/ComparaisonView';

// Hooks
import { useRapportGlobal, useVentesDetail, useTresorerie, useComparaisonPeriodes } from '@/hooks/useRapports';
import { rapportApi } from '@/services/rapportApi';

export default function RapportsPage() {
  // État pour la période sélectionnée
  const [filters, setFilters] = useState(() => rapportApi.getPeriodePreset('mois'));

  // Requêtes React Query
  const rapportGlobal = useRapportGlobal(filters);
  const ventesDetail = useVentesDetail(filters);
  const tresorerie = useTresorerie(filters);
  const comparaison = useComparaisonPeriodes(filters);

  // Handler changement de période
  const handlePeriodeChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Loading state global
  const isLoading = 
    rapportGlobal.isLoading || 
    ventesDetail.isLoading || 
    tresorerie.isLoading || 
    comparaison.isLoading;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapports Comptables</h1>
          <p className="text-muted-foreground">
            Analyse financière et statistiques du salon
          </p>
        </div>
      </div>

      {/* Sélecteur de période */}
      <PeriodeSelector 
        currentFilters={filters} 
        onPeriodeChange={handlePeriodeChange} 
      />

      {/* Loading global */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Chargement des données...</span>
          </CardContent>
        </Card>
      )}

      {/* Contenu principal */}
      {!isLoading && (
        <Tabs defaultValue="global" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="global">Vue Globale</TabsTrigger>
            <TabsTrigger value="ventes">Détail Ventes</TabsTrigger>
            <TabsTrigger value="tresorerie">Trésorerie</TabsTrigger>
            <TabsTrigger value="comparaison">Comparaison</TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="space-y-4">
            <RapportGlobalView data={rapportGlobal.data} />
          </TabsContent>

          <TabsContent value="ventes" className="space-y-4">
            <VentesDetailView data={ventesDetail.data} />
          </TabsContent>

          <TabsContent value="tresorerie" className="space-y-4">
            <TresorerieView data={tresorerie.data} />
          </TabsContent>

          <TabsContent value="comparaison" className="space-y-4">
            <ComparaisonView data={comparaison.data} />
          </TabsContent>
        </Tabs>
      )}

      {/* Erreurs */}
      {(rapportGlobal.error || ventesDetail.error || tresorerie.error || comparaison.error) && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Une erreur est survenue lors du chargement des données.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}