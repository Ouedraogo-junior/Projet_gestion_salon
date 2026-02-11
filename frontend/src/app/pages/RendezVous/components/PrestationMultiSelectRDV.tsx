// src/app/pages/RendezVous/components/PrestationMultiSelectRDV.tsx

import React, { useState, useEffect } from 'react';
import { Search, Scissors, Clock, X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { prestationApi } from '../../../../services/prestationApi';
import type { TypePrestation } from '../../../../types/prestation.types';

interface PrestationMultiSelectRDVProps {
  selectedPrestations: TypePrestation[];
  onChange: (prestations: TypePrestation[]) => void;
}

export const PrestationMultiSelectRDV: React.FC<PrestationMultiSelectRDVProps> = ({
  selectedPrestations,
  onChange,
}) => {
  const [prestations, setPrestations] = useState<TypePrestation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false); // ✅ Liste dépliable

  useEffect(() => {
    chargerPrestations();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      chargerPrestations();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const chargerPrestations = async () => {
    setLoading(true);
    try {
      const response = await prestationApi.getAllActive();
      if (response.success) {
        let data = response.data;
        
        if (searchTerm) {
          data = data.filter((p: TypePrestation) =>
            p.nom.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setPrestations(data);
      }
    } catch (error) {
      console.error('Erreur chargement prestations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePrestation = (prestation: TypePrestation) => {
    const isSelected = selectedPrestations.some(p => p.id === prestation.id);
    
    if (isSelected) {
      onChange(selectedPrestations.filter(p => p.id !== prestation.id));
    } else {
      onChange([...selectedPrestations, prestation]);
    }
  };

  const handleRemovePrestation = (id: number) => {
    onChange(selectedPrestations.filter(p => p.id !== id));
  };

  const formatDuree = (minutes: number | null) => {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}min`;
    if (h > 0) return `${h}h`;
    return `${m}min`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  return (
    <div className="space-y-3">
      {/* Prestations sélectionnées */}
      {selectedPrestations.length > 0 && (
        <div className="space-y-2">
          {selectedPrestations.map((prestation, index) => (
            <div
              key={prestation.id}
              className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center justify-center w-6 h-6 bg-orange-600 text-white rounded-full text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <span className="font-medium text-gray-900 truncate">{prestation.nom}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-semibold text-orange-600">
                      {formatCurrency(prestation.prix_base)} FCFA
                    </span>
                    {prestation.duree_estimee_minutes && (
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuree(prestation.duree_estimee_minutes)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePrestation(prestation.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition ml-2"
                title="Retirer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bouton pour ouvrir/fermer la liste */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {selectedPrestations.length > 0 
            ? 'Ajouter une autre prestation' 
            : 'Sélectionner des prestations'}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* Liste dépliable */}
      {isOpen && (
        <div className="space-y-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une prestation..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            />
          </div>

          {/* Liste des prestations disponibles */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Chargement...</div>
            ) : prestations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Aucune prestation trouvée</div>
            ) : (
              prestations.map((prestation) => {
                const isSelected = selectedPrestations.some(p => p.id === prestation.id);
                
                return (
                  <label
                    key={prestation.id}
                    className={`
                      block border rounded-lg p-3 cursor-pointer transition bg-white
                      ${isSelected
                        ? 'border-orange-400 bg-orange-50 opacity-60'
                        : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTogglePrestation(prestation)}
                        className="mt-1 w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500 rounded"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900">{prestation.nom}</h4>
                        
                        {prestation.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {prestation.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-sm font-bold text-orange-600">
                            {formatCurrency(prestation.prix_base)} FCFA
                          </span>
                          
                          {prestation.duree_estimee_minutes && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={12} />
                              {formatDuree(prestation.duree_estimee_minutes)}
                            </span>
                          )}

                          {prestation.acompte_requis && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                              Acompte requis
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Message si aucune sélection */}
      {/* {selectedPrestations.length === 0 && !isOpen && (
        <div className="text-center py-4 text-sm text-gray-500">
          <Plus className="w-5 h-5 mx-auto mb-2 text-gray-400" />
          Cliquez sur le bouton ci-dessus pour sélectionner des prestations
        </div>
      )} */}
    </div>
  );
};