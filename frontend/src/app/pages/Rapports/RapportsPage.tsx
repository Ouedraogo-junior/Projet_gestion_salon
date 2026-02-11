// src/app/pages/Rapports/RapportsPage.tsx

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; 
import { VentesDetailAvecTransactions } from './components/VentesDetailAvecTransactions';

// Composants rapports
import { PeriodeSelector } from './components/PeriodeSelector';
import { RapportGlobalView } from './components/RapportGlobalView';
import { VentesDetailView } from './components/VentesDetailView';
import { TresorerieView } from './components/TresorerieView';
import { ComparaisonView } from './components/ComparaisonView';
import { canViewTab } from '@/config/rapportPermissions';
import { CompteArreteButton } from './components/CompteArreteButton';

// Hooks
import { useRapportGlobal, useVentesDetail, useTresorerie, useComparaisonPeriodes } from '@/hooks/useRapports';
import { rapportApi } from '@/services/rapportApi';

export default function RapportsPage() {
  // AJOUT: Vérification du rôle utilisateur
  const { user } = useAuth();

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

  // Vérification accès - Tout le monde peut voir (gestionnaire, gérant, coiffeur)
  if (!user || !['gestionnaire', 'gerant', 'coiffeur'].includes(user.role)) {
    return (
      <div className="container mx-auto p-3 sm:p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-900 mb-2">Accès refusé</h2>
            <p className="text-red-700 max-w-md">
              Vous n'avez pas les permissions nécessaires pour accéder aux rapports.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header avec bouton Compte Arrêté */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Rapports Comptables</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Analyse financière et statistiques du salon
          </p>
        </div>
        
        {/* Bouton Compte Arrêté */}
        <CompteArreteButton userRole={user.role} />
      </div>

      {/* Sélecteur de période */}
      <PeriodeSelector 
        currentFilters={filters} 
        onPeriodeChange={handlePeriodeChange} 
      />

      {/* Loading global */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8 sm:py-12">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
            <span className="ml-3 text-base sm:text-lg">Chargement des données...</span>
          </CardContent>
        </Card>
      )}

      {/* Contenu principal */}
      {!isLoading && (
        <Tabs defaultValue="global" className="space-y-4">
          {/* Tabs dynamiques selon le rôle */}
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            {canViewTab(user.role, 'global') && (
              <TabsTrigger value="global" className="text-xs sm:text-sm px-2 py-2">
                Vue Globale
              </TabsTrigger>
            )}
            {canViewTab(user.role, 'ventes') && (
              <TabsTrigger value="ventes" className="text-xs sm:text-sm px-2 py-2">
                Détail Ventes
              </TabsTrigger>
            )}
            {canViewTab(user.role, 'tresorerie') && (
              <TabsTrigger value="tresorerie" className="text-xs sm:text-sm px-2 py-2">
                Trésorerie
              </TabsTrigger>
            )}
            {canViewTab(user.role, 'comparaison') && (
              <TabsTrigger value="comparaison" className="text-xs sm:text-sm px-2 py-2">
                Comparaison
              </TabsTrigger>
            )}
          </TabsList>

          {canViewTab(user.role, 'global') && (
            <TabsContent value="global" className="space-y-4 mt-4">
              <RapportGlobalView data={rapportGlobal.data} userRole={user.role} />
            </TabsContent>
          )}

          {canViewTab(user.role, 'ventes') && (
            <TabsContent value="ventes" className="space-y-4 mt-4">
              <VentesDetailView data={ventesDetail.data} userRole={user.role} />
            </TabsContent>
          )}

          {canViewTab(user.role, 'tresorerie') && (
            <TabsContent value="tresorerie" className="space-y-4 mt-4">
              <TresorerieView data={tresorerie.data} />
            </TabsContent>
          )}

          {canViewTab(user.role, 'comparaison') && (
            <TabsContent value="comparaison" className="space-y-4 mt-4">
              <ComparaisonView data={comparaison.data} />
            </TabsContent>
          )}

          <TabsContent value="ventes" className="space-y-4 mt-4">
            <VentesDetailAvecTransactions data={ventesDetail.data} />
          </TabsContent>
        </Tabs>
      )}

      {/* Erreurs */}
      {(rapportGlobal.error || ventesDetail.error || tresorerie.error || comparaison.error) && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive text-base sm:text-lg">Erreur</CardTitle>
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