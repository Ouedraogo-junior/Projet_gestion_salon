// src/app/pages/Confections/components/ConfectionFilters.tsx
import { Search, X } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { ConfectionFilters as Filters } from '@/types/confection';

interface ConfectionFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
}

export default function ConfectionFilters({ filters, onFilterChange }: ConfectionFiltersProps) {
  const hasActiveFilters = filters.statut || filters.destination || filters.search || filters.date_debut || filters.date_fin;

  const handleReset = () => {
    onFilterChange({
      statut: undefined,
      destination: undefined,
      search: undefined,
      date_debut: undefined,
      date_fin: undefined,
    });
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Recherche */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou numéro..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value || undefined })}
            className="pl-9"
          />
        </div>

        {/* Statut */}
        <Select
          value={filters.statut || 'all'}
          onValueChange={(value) => onFilterChange({ statut: value === 'all' ? undefined : value as any })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="en_cours">En cours</SelectItem>
            <SelectItem value="terminee">Terminée</SelectItem>
            <SelectItem value="annulee">Annulée</SelectItem>
          </SelectContent>
        </Select>

        {/* Destination */}
        <Select
          value={filters.destination || 'all'}
          onValueChange={(value) => onFilterChange({ destination: value === 'all' ? undefined : value as any })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Destination" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes destinations</SelectItem>
            <SelectItem value="vente">Vente</SelectItem>
            <SelectItem value="utilisation">Utilisation</SelectItem>
            <SelectItem value="mixte">Mixte</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={handleReset} className="w-full">
            <X className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Date Range */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Date début</label>
          <Input
            type="date"
            value={filters.date_debut || ''}
            onChange={(e) => onFilterChange({ date_debut: e.target.value || undefined })}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Date fin</label>
          <Input
            type="date"
            value={filters.date_fin || ''}
            onChange={(e) => onFilterChange({ date_fin: e.target.value || undefined })}
          />
        </div>
      </div>
    </div>
  );
}