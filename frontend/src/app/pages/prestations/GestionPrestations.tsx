// src/app/pages/prestations/GestionPrestations.tsx

import React, { useState } from 'react';
import { Plus, Loader2, AlertCircle, Scissors } from 'lucide-react';
import { usePrestations } from '../../../hooks/usePrestations';
import { PrestationCard } from './components/PrestationCard';
import { PrestationFormModal } from './components/PrestationFormModal';
import { PrestationFilters } from './components/PrestationFilters';
import type { TypePrestation, CreateTypePrestationDTO } from '../../../types/prestation.types';

export const GestionPrestations: React.FC = () => {
  const {
    prestations, isLoading, error, filters, total,
    createPrestation, updatePrestation, deletePrestation, toggleActif, updateFilters,
  } = usePrestations({ all: true });

  const [isModalOpen, setIsModalOpen]           = useState(false);
  const [editingPrestation, setEditingPrestation] = useState<TypePrestation | null>(null);

  const handleOpenCreateModal = () => { setEditingPrestation(null); setIsModalOpen(true); };
  const handleEdit = (p: TypePrestation) => { setEditingPrestation(p); setIsModalOpen(true); };

  const handleSubmit = async (data: CreateTypePrestationDTO) => {
    if (editingPrestation) await updatePrestation(editingPrestation.id, data);
    else await createPrestation(data);
  };

  const handleDelete = async (id: number) => {
    try { await deletePrestation(id); }
    catch (e: any) { alert(e.response?.data?.message || 'Erreur lors de la suppression'); }
  };

  const handleToggleActif = async (id: number) => {
    try { await toggleActif(id); }
    catch (e: any) { alert(e.response?.data?.message || 'Erreur lors de la modification'); }
  };

  const actives   = prestations.filter(p => p.actif).length;
  const inactives = prestations.filter(p => !p.actif).length;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5 lg:space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
              Types de Prestations
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Gérez les prestations disponibles dans votre salon
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            <Plus size={16} />
            Nouvelle prestation
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: 'Total',     value: total,     color: 'text-blue-600',  border: 'border-blue-100'  },
            { label: 'Actives',   value: actives,   color: 'text-green-600', border: 'border-green-100' },
            { label: 'Inactives', value: inactives, color: 'text-gray-500',  border: 'border-gray-100'  },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-lg border ${s.border} p-3 sm:p-4`}>
              <p className="text-xs text-gray-500 font-medium mb-1">{s.label}</p>
              <p className={`text-2xl sm:text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <PrestationFilters
          filters={filters}
          onFilterChange={updateFilters}
          totalCount={total}
        />

        {/* Contenu */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-gray-500">Chargement...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 w-5 h-5 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 text-sm">Erreur</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        ) : prestations.length === 0 ? (
          <div className="bg-white rounded-lg border border-dashed border-gray-200 p-12 text-center">
            <Scissors className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 mb-1">Aucune prestation</p>
            <p className="text-sm text-gray-400 mb-4">Commencez par créer votre première prestation</p>
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Créer une prestation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {prestations.map(p => (
              <PrestationCard
                key={p.id}
                prestation={p}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActif={handleToggleActif}
              />
            ))}
          </div>
        )}
      </div>

      <PrestationFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingPrestation(null); }}
        onSubmit={handleSubmit}
        prestation={editingPrestation}
      />
    </div>
  );
};

export default GestionPrestations;