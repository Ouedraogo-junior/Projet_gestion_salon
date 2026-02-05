// src/app/pages/RendezVous/components/CalendrierRendezVous.tsx

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import type { RendezVous } from '../../../../types/rendezVous.types';
import { ModalDetailsRendezVous } from './ModalDetailsRendezVous';

interface Props {
  rendezVous: RendezVous[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const CalendrierRendezVous: React.FC<Props> = ({ rendezVous, isLoading, onRefresh }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRdv, setSelectedRdv] = useState<RendezVous | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getRendezVousForDay = (day: number) => {
    return rendezVous.filter(rdv => {
      const rdvDate = new Date(rdv.date_heure);
      return rdvDate.getDate() === day &&
        rdvDate.getMonth() === month &&
        rdvDate.getFullYear() === year;
    }).sort((a, b) => new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getStatutColor = (statut: string) => {
    const colors = {
      en_attente: 'bg-yellow-500',
      confirme: 'bg-green-500',
      en_cours: 'bg-blue-500',
      termine: 'bg-gray-500',
      annule: 'bg-red-500',
      no_show: 'bg-orange-500',
    };
    return colors[statut as keyof typeof colors] || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Chargement...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <h2 className="text-base sm:text-xl font-bold text-gray-900">
            {monthNames[month]} {year}
          </h2>

          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-2 sm:p-4">
          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-1 sm:py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="min-h-[60px] sm:min-h-[120px]" />
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const rdvs = getRendezVousForDay(day);
              const today = isToday(day);

              return (
                <div
                  key={day}
                  className={`min-h-[60px] sm:min-h-[120px] border rounded-lg p-1 sm:p-2 ${
                    today ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
                    today ? 'text-orange-600' : 'text-gray-700'
                  }`}>
                    {day}
                  </div>

                  <div className="space-y-0.5 sm:space-y-1">
                    {/* Mobile : 1 RDV max affiché, desktop : 3 */}
                    {rdvs.slice(0, 3).map((rdv, i) => (
                      <div
                        key={rdv.id}
                        onClick={() => setSelectedRdv(rdv)}
                        className={`text-xs p-1 sm:p-1.5 rounded cursor-pointer hover:opacity-80 transition ${
                          i >= 1 ? 'hidden sm:block' : ''
                        } ${getStatutColor(rdv.statut)} text-white`}
                      >
                        <div className="flex items-center gap-0.5 sm:gap-1 mb-0 sm:mb-0.5">
                          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span className="font-medium">
                            {new Date(rdv.date_heure).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {/* Nom du client caché sur mobile */}
                        <div className="hidden sm:flex items-center gap-1 truncate">
                          <User className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {rdv.client?.prenom} {rdv.client?.nom}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Compteur "reste" : adapté selon mobile/desktop */}
                    {rdvs.length > 1 && (
                      <div className="text-xs text-gray-500 text-center py-0.5 sm:hidden">
                        +{rdvs.length - 1} autre{rdvs.length - 1 > 1 ? 's' : ''}
                      </div>
                    )}
                    {rdvs.length > 3 && (
                      <div className="text-xs text-gray-500 text-center py-1 hidden sm:block">
                        +{rdvs.length - 3} autre{rdvs.length - 3 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedRdv && (
        <ModalDetailsRendezVous
          rdv={selectedRdv}
          isOpen={!!selectedRdv}
          onClose={() => setSelectedRdv(null)}
          onSuccess={() => {
            setSelectedRdv(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
};