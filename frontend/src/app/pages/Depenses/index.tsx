// src/app/pages/Depenses/index.tsx
import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { DepenseForm } from './components/DepenseForm';
import { DepenseList } from './components/DepenseList';
import { DepenseFilters } from './components/DepenseFilters';
import { DepenseStats } from './components/DepenseStats';
import { useDepenses, useDeleteDepense } from '@/hooks/useDepenses';
import { Depense } from '@/types/depense';

export default function Depenses() {
  const [showForm, setShowForm] = useState(false);
  const [selectedDepense, setSelectedDepense] = useState<Depense | undefined>();
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [categorie, setCategorie] = useState('tous');
  const [page, setPage] = useState(1);

  const filters = {
    mois,
    annee,
    categorie: categorie !== 'tous' ? categorie : undefined,
    page
  };

  const { data, isLoading } = useDepenses(filters);
  const deleteMutation = useDeleteDepense();

  const handleEdit = (depense: Depense) => {
    setSelectedDepense(depense);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedDepense(undefined);
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-5 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
            Gestion des dépenses
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Suivez toutes les dépenses du salon
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="whitespace-nowrap w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
        >
          <Plus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Nouvelle dépense
        </Button>
      </div>

      {/* Statistiques */}
      <DepenseStats mois={mois} annee={annee} />

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
        <DepenseFilters
          mois={mois}
          annee={annee}
          categorie={categorie}
          onMoisChange={setMois}
          onAnneeChange={setAnnee}
          onCategorieChange={setCategorie}
        />
      </div>

      {/* Liste des dépenses */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12 sm:py-16">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DepenseList
          depenses={data?.data || []}
          currentPage={data?.current_page || 1}
          lastPage={data?.last_page || 1}
          onPageChange={setPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Formulaire */}
      <DepenseForm
        open={showForm}
        onClose={handleCloseForm}
        depense={selectedDepense}
      />
    </div>
  );
}