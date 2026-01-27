// src/app/components/ProduitStats.tsx
import { Package, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ProduitStatistiques } from '@/types/produit.types';

interface ProduitStatsProps {
  stats?: ProduitStatistiques;
  isLoading?: boolean;
  className?: string;
}

export function ProduitStats({ stats, isLoading, className }: ProduitStatsProps) {
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value) + ' FCFA';
  };

  const statsData = [
    {
      title: 'Total Produits',
      value: stats.total_produits,
      subtitle: `${stats.produits_actifs} actifs`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: null
    },
    {
      title: 'Valeur Stock Total',
      value: formatCurrency(stats.valeur_stock_total),
      subtitle: `Vente: ${formatCurrency(stats.valeur_stock_vente)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: null
    },
    {
      title: 'Alertes Stock',
      value: stats.alertes_stock_vente + stats.alertes_stock_utilisation,
      subtitle: `${stats.critiques_stock_vente + stats.critiques_stock_utilisation} critiques`,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      alert: (stats.alertes_stock_vente + stats.alertes_stock_utilisation) > 0
    },
    {
      title: 'Marge Moyenne',
      value: `${stats.marge_moyenne.toFixed(1)}%`,
      subtitle: `${stats.produits_en_promo} en promo`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: stats.marge_moyenne > 30 ? 'up' : 'down'
    }
  ];

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {stat.subtitle}
                  </p>
                </div>
                <div className={cn(
                  'p-3 rounded-lg',
                  stat.bgColor
                )}>
                  <Icon className={cn('w-6 h-6', stat.color)} />
                </div>
              </div>
              
              {stat.alert && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-orange-600 font-medium">
                    ⚠️ Attention requise
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}