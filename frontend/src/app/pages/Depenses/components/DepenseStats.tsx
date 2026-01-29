// src/app/pages/Depenses/components/DepenseStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useTotalMois, useStatsCategorie } from '@/hooks/useDepenses';
import { TrendingDown, Loader2 } from 'lucide-react';

interface DepenseStatsProps {
  mois: number;
  annee: number;
}

export const DepenseStats = ({ mois, annee }: DepenseStatsProps) => {
  const { data: total, isLoading: loadingTotal } = useTotalMois(mois, annee);
  const { data: stats, isLoading: loadingStats } = useStatsCategorie(mois, annee);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total du mois</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loadingTotal ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <div className="text-2xl font-bold">
              {(total || 0).toLocaleString('fr-FR')} FCFA
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStats ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <div className="space-y-2">
              {stats && Array.isArray(stats) && stats.length > 0 ? (
                stats.map((stat) => (
                  <div key={stat.categorie} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{stat.categorie}</span>
                    <span className="font-semibold">
                      {stat.total.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Aucune dépense ce mois</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};