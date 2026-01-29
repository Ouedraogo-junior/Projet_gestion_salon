// src/app/pages/Pointages/components/ListeEmployesPointage.tsx

import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { useEmployeesAujourdhui } from '../../../../hooks/usePointages';
import { ModalPointerEmploye } from './ModalPointerEmploye';
import { ModalModifierPointage } from './ModalModifierPointage';
import type { EmployeeAujourdhui, Pointage } from '../../../../types/pointage.types';

export const ListeEmployesPointage: React.FC = () => {
  const { data, isLoading, refetch } = useEmployeesAujourdhui();
  const [showModalPointer, setShowModalPointer] = useState(false);
  const [showModalModifier, setShowModalModifier] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeAujourdhui | null>(null);
  const [selectedPointage, setSelectedPointage] = useState<Pointage | null>(null);

  const handlePointer = (employee: EmployeeAujourdhui) => {
    setSelectedEmployee(employee);
    setShowModalPointer(true);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const employees = data?.data || [];
  const pointes = employees.filter(e => e.a_pointe);
  const nonPointes = employees.filter(e => !e.a_pointe);

  return (
    <div className="space-y-6">
      {/* Résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Pointés</p>
              <p className="text-3xl font-bold text-green-700">{pointes.length}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Non pointés</p>
              <p className="text-3xl font-bold text-red-700">{nonPointes.length}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total employés</p>
              <p className="text-3xl font-bold text-blue-700">{employees.length}</p>
            </div>
            <Clock className="w-10 h-10 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Liste des employés */}
      <div className="space-y-4">
        {/* Non pointés */}
        {nonPointes.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              À pointer ({nonPointes.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {nonPointes.map((employee) => (
                <div
                  key={employee.id}
                  className="bg-white border-2 border-red-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{employee.nom_complet}</h4>
                      <p className="text-sm text-gray-600 capitalize">{employee.role}</p>
                    </div>
                    <button
                      onClick={() => handlePointer(employee)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                    >
                      Pointer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Déjà pointés */}
        {pointes.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Déjà pointés ({pointes.length})
            </h3>
            <div className="space-y-2">
              {pointes.map((employee) => {
                const pointage = employee.pointage!;
                return (
                  <div
                    key={employee.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{employee.nom_complet}</h4>
                          <p className="text-sm text-gray-600 capitalize">{employee.role}</p>
                        </div>
                        {getStatutBadge(pointage.statut)}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Arrivée</p>
                          <p className="font-medium text-gray-900">{pointage.heure_arrivee}</p>
                        </div>
                        {pointage.heure_depart && (
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Départ</p>
                            <p className="font-medium text-gray-900">{pointage.heure_depart}</p>
                          </div>
                        )}
                        <button
                          onClick={() => handleModifier(pointage)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                        >
                          Modifier
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModalPointer && selectedEmployee && (
        <ModalPointerEmploye
          employee={selectedEmployee}
          isOpen={showModalPointer}
          onClose={() => {
            setShowModalPointer(false);
            setSelectedEmployee(null);
          }}
          onSuccess={() => {
            refetch();
            setShowModalPointer(false);
            setSelectedEmployee(null);
          }}
        />
      )}

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