import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { cn } from '@/lib/utils';

interface StockBadgeProps {
  stock: number;
  seuilAlerte: number;
  seuilCritique: number;
  type?: 'vente' | 'utilisation';
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StockBadge({
  stock,
  seuilAlerte,
  seuilCritique,
  type = 'vente',
  className,
  showIcon = true,
  size = 'md'
}: StockBadgeProps) {
  const getStockStatus = () => {
    if (stock <= seuilCritique) {
      return {
        label: 'Rupture',
        variant: 'destructive' as const,
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        icon: XCircle,
        progress: 10
      };
    }
    if (stock <= seuilAlerte) {
      return {
        label: 'Stock bas',
        variant: 'secondary' as const,
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50',
        icon: AlertCircle,
        progress: 50
      };
    }
    return {
      label: 'Stock OK',
      variant: 'default' as const,
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      icon: CheckCircle,
      progress: 100
    };
  };

  const status = getStockStatus();
  const Icon = status.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <Badge
      variant={status.variant}
      className={cn(
        'flex items-center gap-1.5 font-medium',
        sizeClasses[size],
        status.bgColor,
        status.textColor,
        'border-0',
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{status.label}</span>
      {type === 'utilisation' && (
        <span className="text-xs opacity-75">(util.)</span>
      )}
    </Badge>
  );
}

// Export du composant avec progress pour usage externe
export function StockProgress({
  stock,
  seuilAlerte,
  seuilCritique
}: {
  stock: number;
  seuilAlerte: number;
  seuilCritique: number;
}) {
  const getProgress = () => {
    if (stock <= seuilCritique) return 10;
    if (stock <= seuilAlerte) return 50;
    return 100;
  };

  const getColor = () => {
    if (stock <= seuilCritique) return 'bg-red-500';
    if (stock <= seuilAlerte) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300', getColor())}
          style={{ width: `${getProgress()}%` }}
        />
      </div>
    </div>
  );
}