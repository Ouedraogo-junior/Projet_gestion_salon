// src/app/pages/Pointages/components/StatsPointages.tsx

import React, { useState, useMemo } from 'react';
import { Calendar, Users, TrendingUp, Clock, Download } from 'lucide-react';
import { usePointagesStats } from '../../../../hooks/usePointages';
import type { EmployeeStats } from '../../../../types/pointage.types';

export const StatsPointages: React.FC = () => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0];

  const [dateDebut, setDateDebut] = useState(firstDayOfMonth);
  const [dateFin, setDateFin] = useState(lastDayOfMonth);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);

  const { data, isLoading } = usePointagesStats(dateDebut, dateFin, selectedUserId);
  const stats = data?.data;

  const statsGlobales = useMemo(() => {
    if (!stats) return null;

    const tauxPresence = stats.total_jours > 0
      ? ((stats.presents / stats.total_jours) * 100).toFixed(1)
      : '0';

    const tauxRetard = stats.total_jours > 0
      ? ((stats.retards / stats.total_jours) * 100).toFixed(1)
      : '0';

    const moyenneHeures = stats.presents > 0
      ? (stats.total_heures / stats.presents).toFixed(1)
      : '0';

    return { tauxPresence, tauxRetard, moyenneHeures };
  }, [stats]);

  const handlePeriodChange = (period: 'week' | 'month' | 'quarter') => {
    const today = new Date();
    let debut: Date;
    let fin = today;

    switch (period) {
      case 'week':
        debut = new Date(today);
        debut.setDate(today.getDate() - 7);
        break;
      case 'month':
        debut = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'quarter':
        debut = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        break;
    }

    setDateDebut(debut.toISOString().split('T')[0]);
    setDateFin(fin.toISOString().split('T')[0]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filtres */}
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
        {/* Dates : 1 col mobile, 2 col sm, puis dates + périodes côte à côte md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date début
            </label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date fin
            </label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Périodes rapides
            </label>
            {/* Scroll horizontal sur très petit écran si les 3 boutons ne tiennent pas */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => handlePeriodChange('week')}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition text-sm whitespace-nowrap flex-shrink-0"
              >
                7 derniers jours
              </button>
              <button
                onClick={() => handlePeriodChange('month')}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition text-sm whitespace-nowrap flex-shrink-0"
              >
                Mois en cours
              </button>
              <button
                onClick={() => handlePeriodChange('quarter')}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition text-sm whitespace-nowrap flex-shrink-0"
              >
                3 derniers mois
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques globales */}
      {stats && (
        <>
          {/* Cards : 2 cols mobile, 4 cols md+ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Total jours</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.total_jours}</p>
                </div>
                <Calendar className="w-7 h-7 sm:w-10 sm:h-10 text-gray-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Taux présence</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{statsGlobales?.tauxPresence}%</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.presents} présents</p>
                </div>
                <TrendingUp className="w-7 h-7 sm:w-10 sm:h-10 text-green-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Taux retard</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600 mt-1">{statsGlobales?.tauxRetard}%</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.retards} retards</p>
                </div>
                <Clock className="w-7 h-7 sm:w-10 sm:h-10 text-orange-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Moy. heures/jour</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">{statsGlobales?.moyenneHeures}h</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.total_heures.toFixed(1)}h total</p>
                </div>
                <Users className="w-7 h-7 sm:w-10 sm:h-10 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Répartition des statuts */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Répartition des statuts</h3>
            <div className="space-y-3">
              {[
                { color: 'bg-green-500', label: 'Présents', value: stats.presents },
                { color: 'bg-orange-500', label: 'En retard', value: stats.retards },
                { color: 'bg-red-500', label: 'Absents', value: stats.absents },
                { color: 'bg-blue-500', label: 'Congés', value: stats.conges },
              ].map(({ color, label, value }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-24 flex-shrink-0">
                    <div className={`w-3.5 h-3.5 ${color} rounded`}></div>
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </div>
                  {/* Barre : flex-1 au lieu de w-48 fixe → s'adapte à l'espace disponible */}
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`${color} h-2 rounded-full`}
                      style={{
                        width: `${stats.total_jours > 0 ? (value / stats.total_jours) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-8 text-right flex-shrink-0">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats par employé */}
          {stats.par_employe && stats.par_employe.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Statistiques par employé</h3>
                <button className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm flex items-center gap-1.5">
                  <Download className="w-4 h-4" />
                  Exporter
                </button>
              </div>

              {/* Tableau : scroll horizontal sur mobile */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employé
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Présents
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Retards
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Absents
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Congés
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Heures
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Présence
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.par_employe.map((employe: EmployeeStats) => {
                      const tauxPresence = employe.total_jours > 0
                        ? ((employe.presents / employe.total_jours) * 100).toFixed(1)
                        : '0';

                      return (
                        <tr key={employe.user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {employe.user.nom_complet}
                              </div>
                              <div className="text-xs text-gray-500 capitalize">
                                {employe.user.role}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              {employe.presents}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                              {employe.retards}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              {employe.absents}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {employe.conges}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                            {employe.total_heures.toFixed(1)}h
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                parseFloat(tauxPresence) >= 90
                                  ? 'bg-green-100 text-green-800'
                                  : parseFloat(tauxPresence) >= 70
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {tauxPresence}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};