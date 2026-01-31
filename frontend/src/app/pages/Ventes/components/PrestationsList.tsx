// src/app/pages/ventes/components/PrestationsList.tsx

import React, { useState, useEffect } from 'react';
import { Search, Scissors, Clock, Plus } from 'lucide-react';
import { prestationApi } from '../../../../services/prestationApi';
import type { TypePrestation } from '../../../../types/prestation.types';

interface PrestationsListProps {
  onSelect: (prestation: TypePrestation, quantite: number) => void;
}

export const PrestationsList: React.FC<PrestationsListProps> = ({ onSelect }) => {
  const [prestations, setPrestations] = useState<TypePrestation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
        
        // Filtrer par recherche si nécessaire
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

  const formatDuree = (minutes: number | null) => {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}min`;
    if (h > 0) return `${h}h`;
    return `${m}min`;
  };

  const handleAjouterPrestation = (prestation: TypePrestation) => {
    onSelect(prestation, 1);
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Scissors size={18} />
        Prestations disponibles
      </h3>

      {/* Recherche */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une prestation..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Liste des prestations */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Chargement...</div>
        ) : prestations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Aucune prestation trouvée</div>
        ) : (
          prestations.map((prestation) => (
            <div
              key={prestation.id}
              className="border rounded-lg p-3 hover:bg-purple-50 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{prestation.nom}</h4>
                  
                  {prestation.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {prestation.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm font-bold text-purple-600">
                      {prestation.prix_base.toLocaleString()} F
                    </span>
                    
                    {prestation.duree_estimee_minutes && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} />
                        {formatDuree(prestation.duree_estimee_minutes)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleAjouterPrestation(prestation)}
                  className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-1 flex-shrink-0"
                >
                  <Plus size={16} />
                  <span className="text-xs">Ajouter</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};