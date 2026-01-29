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
    <div className="space-y-6">
      {/* Filtres */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date début
            </label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date fin
            </label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Périodes rapides
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handlePeriodChange('week')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition text-sm"
              >
                7 derniers jours
              </button>
              <button
                onClick={() => handlePeriodChange('month')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition text-sm"
              >
                Mois en cours
              </button>
              <button
                onClick={() => handlePeriodChange('quarter')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition text-sm"
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total jours</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_jours}</p>
                </div>
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Taux présence</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{statsGlobales?.tauxPresence}%</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.presents} présents</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Taux retard</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">{statsGlobales?.tauxRetard}%</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.retards} retards</p>
                </div>
                <Clock className="w-10 h-10 text-orange-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Moy. heures/jour</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{statsGlobales?.moyenneHeures}h</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.total_heures.toFixed(1)}h total</p>
                </div>
                <Users className="w-10 h-10 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Répartition des statuts */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des statuts</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm font-medium text-gray-700">Présents</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 w-48">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${stats.total_jours > 0 ? (stats.presents / stats.total_jours) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-12 text-right">
                    {stats.presents}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-sm font-medium text-gray-700">En retard</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 w-48">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{
                        width: `${stats.total_jours > 0 ? (stats.retards / stats.total_jours) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-12 text-right">
                    {stats.retards}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm font-medium text-gray-700">Absents</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 w-48">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${stats.total_jours > 0 ? (stats.absents / stats.total_jours) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-12 text-right">
                    {stats.absents}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm font-medium text-gray-700">Congés</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 w-48">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${stats.total_jours > 0 ? (stats.conges / stats.total_jours) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-12 text-right">
                    {stats.conges}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats par employé */}
          {stats.par_employe && stats.par_employe.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Statistiques par employé</h3>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm">
                  <Download className="w-4 h-4 inline mr-2" />
                  Exporter
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employé
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Présents
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Retards
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Absents
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Congés
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total heures
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Taux présence
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="font-medium text-gray-900">
                                {employe.user.nom_complet}
                              </div>
                              <div className="text-sm text-gray-500 capitalize">
                                {employe.user.role}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              {employe.presents}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                              {employe.retards}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                              {employe.absents}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {employe.conges}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                            {employe.total_heures.toFixed(1)}h
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-sm font-medium ${
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