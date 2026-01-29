// src/app/pages/Confections/components/StatsCards.tsx
import { Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { useConfectionStatistiques } from '@/hooks/useConfections';
import { ConfectionFilters } from '@/types/confection';

interface StatsCardsProps {
  filters: ConfectionFilters;
}

export default function StatsCards({ filters }: StatsCardsProps) {
  const { data, isLoading } = useConfectionStatistiques(filters.date_debut, filters.date_fin);

  const stats = [
    {
      label: 'Total confections',
      value: data?.total_confections || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'En cours',
      value: data?.en_cours || 0,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Terminées',
      value: data?.terminees || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Annulées',
      value: data?.annulees || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 animate-pulse rounded bg-muted"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`rounded-full p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}