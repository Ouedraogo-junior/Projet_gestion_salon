// src/app/pages/prestations/GestionPrestations.tsx

import React, { useState } from 'react';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { usePrestations } from '../../../hooks/usePrestations';
import { PrestationCard } from './components/PrestationCard';
import { PrestationFormModal } from './components/PrestationFormModal';
import { PrestationFilters } from './components/PrestationFilters';
import type { TypePrestation, CreateTypePrestationDTO } from '../../../types/prestation.types';

export const GestionPrestations: React.FC = () => {
  const {
    prestations,
    isLoading,
    error,
    filters,
    total,
    createPrestation,
    updatePrestation,
    deletePrestation,
    toggleActif,
    updateFilters,
  } = usePrestations({ all: true });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrestation, setEditingPrestation] = useState<TypePrestation | null>(null);

  // Ouvrir modal pour création
  const handleOpenCreateModal = () => {
    setEditingPrestation(null);
    setIsModalOpen(true);
  };

  // Ouvrir modal pour modification
  const handleEdit = (prestation: TypePrestation) => {
    setEditingPrestation(prestation);
    setIsModalOpen(true);
  };

  // Soumettre le formulaire
  const handleSubmit = async (data: CreateTypePrestationDTO) => {
    if (editingPrestation) {
      await updatePrestation(editingPrestation.id, data);
    } else {
      await createPrestation(data);
    }
  };

  // Supprimer
  const handleDelete = async (id: number) => {
    try {
      await deletePrestation(id);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // Activer/Désactiver
  const handleToggleActif = async (id: number) => {
    try {
      await toggleActif(id);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-1 sm:mb-2">
                Types de Prestations
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Gérez les prestations disponibles dans votre salon
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
              <span className="whitespace-nowrap">Nouvelle Prestation</span>
            </button>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-white rounded-lg sm:rounded-xl border-2 border-purple-200 p-3 sm:p-4">
              <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-purple-600">{total}</div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl border-2 border-green-200 p-3 sm:p-4">
              <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Actives</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-green-600">
                {prestations.filter((p) => p.actif).length}
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 p-3 sm:p-4">
              <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Inactives</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-600">
                {prestations.filter((p) => !p.actif).length}
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-4 sm:mb-6">
          <PrestationFilters
            filters={filters}
            onFilterChange={updateFilters}
            totalCount={total}
          />
        </div>

        {/* Contenu */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 animate-spin mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-600 font-medium text-center px-4">
              Chargement des prestations...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg sm:rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <AlertCircle className="text-red-600 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-red-900 mb-1 text-sm sm:text-base">Erreur</h3>
              <p className="text-red-700 text-sm sm:text-base break-words">{error}</p>
            </div>
          </div>
        ) : prestations.length === 0 ? (
          <div className="bg-white rounded-lg sm:rounded-xl border-2 border-dashed border-gray-300 p-6 sm:p-8 lg:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Plus className="text-purple-600 w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Aucune prestation
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Commencez par créer votre première prestation
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition text-sm sm:text-base"
              >
                Créer une prestation
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {prestations.map((prestation) => (
              <PrestationCard
                key={prestation.id}
                prestation={prestation}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActif={handleToggleActif}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <PrestationFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPrestation(null);
        }}
        onSubmit={handleSubmit}
        prestation={editingPrestation}
      />
    </div>
  );
};

export default GestionPrestations;