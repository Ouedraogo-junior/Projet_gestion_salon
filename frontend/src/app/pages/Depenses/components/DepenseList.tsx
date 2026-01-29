// src/app/pages/Depenses/components/DepenseList.tsx
import { DepenseCard } from './DepenseCard';
import { Depense } from '@/types/depense';
import { Button } from '@/app/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DepenseListProps {
  depenses: Depense[];
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  onEdit: (depense: Depense) => void;
  onDelete: (id: number) => void;
}

export const DepenseList = ({
  depenses,
  currentPage,
  lastPage,
  onPageChange,
  onEdit,
  onDelete,
}: DepenseListProps) => {
  if (depenses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucune dépense enregistrée</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {depenses.map((depense) => (
          <DepenseCard
            key={depense.id}
            depense={depense}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {lastPage > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} sur {lastPage}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === lastPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};