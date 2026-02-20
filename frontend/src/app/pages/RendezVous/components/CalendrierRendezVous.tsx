// src/app/pages/RendezVous/components/CalendrierRendezVous.tsx

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, X, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import type { RendezVous } from '../../../../types/rendezVous.types';
import { ModalDetailsRendezVous } from './ModalDetailsRendezVous';

interface Props {
  rendezVous: RendezVous[];
  isLoading: boolean;
  onRefresh: () => void;
  selectedRdvFromSearch?: RendezVous | null; 
  onClearSelection?: () => void; 
}

export const CalendrierRendezVous: React.FC<Props> = ({ rendezVous, isLoading, onRefresh, selectedRdvFromSearch, onClearSelection }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRdv, setSelectedRdv] = useState<RendezVous | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<{ day: number; rdvs: RendezVous[] } | null>(null);
  const [returnToDayModal, setReturnToDayModal] = useState(false); // Pour savoir si on doit revenir au modal du jour

  // Ouvrir automatiquement et naviguer vers le mois du RDV
  React.useEffect(() => {
    if (selectedRdvFromSearch) {
      const rdvDate = new Date(selectedRdvFromSearch.date_heure);
      setCurrentDate(rdvDate);
      setSelectedRdv(selectedRdvFromSearch);
      onClearSelection?.();
    }
  }, [selectedRdvFromSearch, onClearSelection]);

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

  const getStatutBadgeColor = (statut: string) => {
    const colors = {
      en_attente: 'bg-yellow-100 text-yellow-800',
      confirme: 'bg-green-100 text-green-800',
      en_cours: 'bg-blue-100 text-blue-800',
      termine: 'bg-gray-100 text-gray-800',
      annule: 'bg-red-100 text-red-800',
      no_show: 'bg-orange-100 text-orange-800',
    };
    return colors[statut as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleShowAllRdvs = (day: number, rdvs: RendezVous[]) => {
    setSelectedDay({ day, rdvs });
    setShowDayModal(true);
    setReturnToDayModal(false);
  };

  const handleRdvClick = (rdv: RendezVous) => {
    setReturnToDayModal(showDayModal); // Mémoriser si on vient du modal du jour
    setShowDayModal(false);
    setSelectedRdv(rdv);
  };

  const handleCloseDetails = () => {
    setSelectedRdv(null);
    // Si on venait du modal du jour, on le réouvre
    if (returnToDayModal && selectedDay) {
      setShowDayModal(true);
      setReturnToDayModal(false);
    }
  };

  const handleBackToDayModal = () => {
    setSelectedRdv(null);
    setShowDayModal(true);
    setReturnToDayModal(false);
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
      <style>
        {`
          @keyframes pulse-dot {
            0%, 100% { 
              opacity: 1;
              transform: scale(1);
            }
            50% { 
              opacity: 0.3;
              transform: scale(1.2);
            }
          }
          .animate-pulse-dot {
            animation: pulse-dot 1s ease-in-out infinite;
          }
        `}
      </style>

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
              const MAX_VISIBLE_MOBILE = 1;
              const MAX_VISIBLE_DESKTOP = 3;

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
                    {/* Mobile : 1 RDV max affiché */}
                    {rdvs.slice(0, MAX_VISIBLE_MOBILE).map((rdv) => (
                      <div
                        key={rdv.id}
                        onClick={() => handleRdvClick(rdv)}
                        className={`sm:hidden text-xs p-1 rounded cursor-pointer hover:opacity-80 transition ${getStatutColor(rdv.statut)} text-white relative`}
                      >
                        {/* Point rouge clignotant si c'est aujourd'hui */}
                        {today && (
                          <div className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 animate-pulse-dot"></span>
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span className="font-medium">
                            {new Date(rdv.date_heure).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Desktop : 3 RDV max affichés */}
                    {rdvs.slice(0, MAX_VISIBLE_DESKTOP).map((rdv) => (
                      <div
                        key={rdv.id}
                        onClick={() => handleRdvClick(rdv)}
                        className={`hidden sm:block text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition ${getStatutColor(rdv.statut)} text-white relative`}
                      >
                        {/* Point rouge clignotant si c'est aujourd'hui */}
                        {today && (
                          <div className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 animate-pulse-dot"></span>
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 mb-0.5">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">
                            {new Date(rdv.date_heure).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 truncate">
                          <User className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {rdv.client?.prenom} {rdv.client?.nom}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Indicateur "+X RDV" cliquable - Mobile */}
                    {rdvs.length > MAX_VISIBLE_MOBILE && (
                      <button
                        onClick={() => handleShowAllRdvs(day, rdvs)}
                        className={`sm:hidden w-full text-xs text-orange-600 hover:text-orange-700 font-medium py-1 px-1 bg-orange-50 hover:bg-orange-100 rounded transition text-center relative`}
                      >
                        {/* Point rouge clignotant si c'est aujourd'hui */}
                        {today && (
                          <div className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 animate-pulse-dot"></span>
                            </span>
                          </div>
                        )}
                        +{rdvs.length - MAX_VISIBLE_MOBILE} RDV
                      </button>
                    )}

                    {/* Indicateur "+X RDV" cliquable - Desktop */}
                    {rdvs.length > MAX_VISIBLE_DESKTOP && (
                      <button
                        onClick={() => handleShowAllRdvs(day, rdvs)}
                        className={`hidden sm:block w-full text-xs text-orange-600 hover:text-orange-700 font-medium py-1 px-1.5 bg-orange-50 hover:bg-orange-100 rounded transition text-center relative`}
                      >
                        {/* Point rouge clignotant si c'est aujourd'hui */}
                        {today && (
                          <div className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 animate-pulse-dot"></span>
                            </span>
                          </div>
                        )}
                        +{rdvs.length - MAX_VISIBLE_DESKTOP} RDV
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal pour afficher tous les RDV d'un jour */}
      {showDayModal && selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header du modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-6 h-6 text-orange-600" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedDay.day} {monthNames[month]} {year}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedDay.rdvs.length} rendez-vous
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDayModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Liste des RDV */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {selectedDay.rdvs.map((rdv) => (
                  <div
                    key={rdv.id}
                    onClick={() => handleRdvClick(rdv)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-orange-500 hover:bg-orange-50 cursor-pointer transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {/* Heure */}
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <span className="font-bold text-gray-900">
                            {new Date(rdv.date_heure).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {/* Client */}
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {rdv.client?.prenom} {rdv.client?.nom}
                          </span>
                        </div>

                        {/* Prestation */}
                        {rdv.typePrestation && (
                          <div className="text-sm text-gray-600 ml-7">
                            {rdv.typePrestation.nom}
                          </div>
                        )}

                        {/* Coiffeur */}
                        {rdv.coiffeur && (
                          <div className="text-sm text-gray-600 ml-7 mt-1">
                            Coiffeur: {rdv.coiffeur.prenom} {rdv.coiffeur.nom}
                          </div>
                        )}
                      </div>

                      {/* Badge statut */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatutBadgeColor(rdv.statut)}`}>
                        {rdv.statut.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer du modal */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDayModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal détails du RDV avec bouton retour si nécessaire */}
      {selectedRdv && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header personnalisé avec bouton retour */}
            {returnToDayModal && (
              <div className="px-6 py-3 border-b border-gray-200 bg-orange-50">
                <button
                  onClick={handleBackToDayModal}
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Retour à la liste du jour
                </button>
              </div>
            )}

            {/* Contenu du modal de détails */}
            <div className="flex-1 overflow-hidden">
              <ModalDetailsRendezVous
                rdv={selectedRdv}
                isOpen={!!selectedRdv}
                onClose={handleCloseDetails}
                onSuccess={() => {
                  handleCloseDetails();
                  onRefresh();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};