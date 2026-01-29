// src/app/pages/Pointages/components/TableauPointages.tsx

import React, { useState } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, Edit2, Trash2, Calendar } from 'lucide-react';
import { usePointages } from '../../../../hooks/usePointages';
import { ModalModifierPointage } from './ModalModifierPointage';
import type { PointageFilters, Pointage } from '../../../../types/pointage.types';

interface TableauPointagesProps {
  filters: PointageFilters;
  onFiltersChange: (filters: PointageFilters) => void;
}

export const TableauPointages: React.FC<TableauPointagesProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [localFilters, setLocalFilters] = useState<PointageFilters>({
    ...filters,
    per_page: 15,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showModalModifier, setShowModalModifier] = useState(false);
  const [selectedPointage, setSelectedPointage] = useState<Pointage | null>(null);

  const { pointages, pagination, isLoading, refetch } = usePointages(localFilters);

  const handleFilterChange = (key: keyof PointageFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePageChange = (page: number) => {
    handleFilterChange('per_page', page);
  };

  const handleModifier = (pointage: Pointage) => {
    setSelectedPointage(pointage);
    setShowModalModifier(true);
  };

  const getStatutBadge = (statut: string) => {
    const configs = {
      present: { bg: 'bg-green-100', text: 'text-green-800', label: 'Présent' },
      retard: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'En retard' },
      absent: { bg: 'bg-red-100', text: 'text-red-800', label: 'Absent' },
      conge: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Congé' },
    };
    const config = configs[statut as keyof typeof configs] || configs.present;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const filteredPointages = pointages.filter((p) =>
    searchTerm
      ? p.user?.nom_complet.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Date début */}
          <div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={localFilters.date_debut || ''}
                onChange={(e) => handleFilterChange('date_debut', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Date début"
              />
            </div>
          </div>

          {/* Date fin */}
          <div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={localFilters.date_fin || ''}
                onChange={(e) => handleFilterChange('date_fin', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Date fin"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Statut */}
          <select
            value={localFilters.statut || ''}
            onChange={(e) => handleFilterChange('statut', e.target.value || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="present">Présent</option>
            <option value="retard">En retard</option>
            <option value="absent">Absent</option>
            <option value="conge">Congé</option>
          </select>

          {/* Boutons */}
          <button
            onClick={() => {
              setLocalFilters({ per_page: 15 });
              setSearchTerm('');
              onFiltersChange({ per_page: 15 });
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Réinitialiser
          </button>

          <button
            onClick={() => refetch()}
            className="ml-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            <Download className="w-4 h-4 inline mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Tableau */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : filteredPointages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun pointage trouvé</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Arrivée
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Départ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durée
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPointages.map((pointage) => (
                    <tr key={pointage.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {pointage.user?.nom_complet}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {pointage.user?.role}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(pointage.date_pointage).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pointage.heure_arrivee}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pointage.heure_depart || (
                          <span className="text-orange-600">En cours</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pointage.heures_travaillees || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatutBadge(pointage.statut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleModifier(pointage)}
                          className="text-orange-600 hover:text-orange-900 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{((pagination.current_page - 1) * pagination.per_page) + 1}</span> à{' '}
                <span className="font-medium">
                  {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                </span>{' '}
                sur <span className="font-medium">{pagination.total}</span> résultats
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          pagination.current_page === page
                            ? 'bg-orange-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Modifier */}
      {showModalModifier && selectedPointage && (
        <ModalModifierPointage
          pointage={selectedPointage}
          isOpen={showModalModifier}
          onClose={() => {
            setShowModalModifier(false);
            setSelectedPointage(null);
          }}
          onSuccess={() => {
            refetch();
            setShowModalModifier(false);
            setSelectedPointage(null);
          }}
        />
      )}
    </div>
  );
};