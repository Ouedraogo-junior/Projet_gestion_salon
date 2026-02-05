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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium">Total du mois</CardTitle>
          <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          {loadingTotal ? (
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
          ) : (
            <div className="text-xl sm:text-2xl font-bold">
              {(total || 0).toLocaleString('fr-FR')} FCFA
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <CardTitle className="text-xs sm:text-sm font-medium">Par catégorie</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          {loadingStats ? (
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
          ) : (
            <div className="space-y-1.5 sm:space-y-2">
              {stats && Array.isArray(stats) && stats.length > 0 ? (
                stats.map((stat) => (
                  <div key={stat.categorie} className="flex justify-between items-center gap-2">
                    <span className="text-xs sm:text-sm capitalize truncate flex-1">
                      {stat.categorie}
                    </span>
                    <span className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                      {stat.total.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Aucune dépense ce mois
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};