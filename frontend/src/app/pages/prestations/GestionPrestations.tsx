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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                Types de Prestations
              </h1>
              <p className="text-gray-600">
                Gérez les prestations disponibles dans votre salon
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Nouvelle Prestation
            </button>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border-2 border-purple-200 p-4">
              <div className="text-sm font-medium text-gray-600">Total</div>
              <div className="text-3xl font-black text-purple-600">{total}</div>
            </div>
            <div className="bg-white rounded-xl border-2 border-green-200 p-4">
              <div className="text-sm font-medium text-gray-600">Actives</div>
              <div className="text-3xl font-black text-green-600">
                {prestations.filter((p) => p.actif).length}
              </div>
            </div>
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-600">Inactives</div>
              <div className="text-3xl font-black text-gray-600">
                {prestations.filter((p) => !p.actif).length}
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-6">
          <PrestationFilters
            filters={filters}
            onFilterChange={updateFilters}
            totalCount={total}
          />
        </div>

        {/* Contenu */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Chargement des prestations...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-4">
            <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-red-900 mb-1">Erreur</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        ) : prestations.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="text-purple-600" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Aucune prestation
              </h3>
              <p className="text-gray-600 mb-6">
                Commencez par créer votre première prestation
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
              >
                Créer une prestation
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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