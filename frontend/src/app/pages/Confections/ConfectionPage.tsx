// src/app/pages/Confections/ConfectionsPage.tsx
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useConfections } from '@/hooks/useConfections';
import { ConfectionFilters as Filters } from '@/types/confection';
import ConfectionTable from './components/ConfectionTable';
import ConfectionFilters from './components/ConfectionFilters';
import ConfectionDialog from './components/ConfectionDialog';
import ConfectionDetailDialog from './components/ConfectionDetailDialog';
import StatsCards from './components/StatsCards';

export default function ConfectionsPage() {
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    per_page: 1000, // Récupérer un grand nombre d'éléments
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedConfectionId, setSelectedConfectionId] = useState<number | null>(null);

  const { data, isLoading, error } = useConfections(filters);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleViewDetail = (id: number) => {
    setSelectedConfectionId(id);
    setDetailDialogOpen(true);
  };

  const handleEdit = (id: number) => {
    setSelectedConfectionId(id);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedConfectionId(null);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedConfectionId(null);
  };

  return (
    <div className="flex h-full flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Confections</h1>
          <p className="text-muted-foreground">
            Gérez la production de vos produits personnalisés
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle confection
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards filters={filters} />

      {/* Filters */}
      <ConfectionFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Table */}
      <div className="flex-1 overflow-hidden rounded-lg border bg-card">
        <ConfectionTable
          data={data?.data || []}
          isLoading={isLoading}
          error={error}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
        />
      </div>

      {/* Dialogs */}
      <ConfectionDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        confectionId={selectedConfectionId}
      />

      <ConfectionDetailDialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        confectionId={selectedConfectionId}
      />
    </div>
  );
}