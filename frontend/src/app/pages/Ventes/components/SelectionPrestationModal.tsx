// src/app/pages/ventes/components/SelectionPrestationModal.tsx

import React, { useState, useEffect } from 'react';
import { X, Search, Clock, Loader2 } from 'lucide-react';
import { prestationApi } from '../../../../services/prestationApi';
import type { TypePrestation } from '../../../../types/prestation.types';

interface SelectionPrestationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (prestation: TypePrestation, quantite: number) => void;
}

export const SelectionPrestationModal: React.FC<SelectionPrestationModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [prestations, setPrestations] = useState<TypePrestation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrestation, setSelectedPrestation] = useState<TypePrestation | null>(null);
  const [quantite, setQuantite] = useState(1);

  // Charger les prestations actives
  useEffect(() => {
    if (isOpen) {
      loadPrestations();
    }
  }, [isOpen]);

  const loadPrestations = async () => {
    setIsLoading(true);
    try {
      const response = await prestationApi.getAllActive();
      if (response.success) {
        setPrestations(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement prestations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer par recherche
  const prestationsFiltrees = prestations.filter((p) =>
    p.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = () => {
    if (selectedPrestation) {
      onSelect(selectedPrestation, quantite);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedPrestation(null);
    setQuantite(1);
    setSearchTerm('');
    onClose();
  };

  const formatPrix = (prix: number) => {
    return new Intl.NumberFormat('fr-FR').format(prix) + ' FCFA';
  };

  const formatDuree = (minutes: number | null) => {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}min`;
    if (h > 0) return `${h}h`;
    return `${m}min`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Sélectionner une prestation</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Recherche */}
        <div className="px-6 py-4 border-b">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une prestation..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* Liste des prestations */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
              <p className="text-gray-600">Chargement...</p>
            </div>
          ) : prestationsFiltrees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Aucune prestation trouvée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prestationsFiltrees.map((prestation) => (
                <button
                  key={prestation.id}
                  onClick={() => setSelectedPrestation(prestation)}
                  className={`text-left p-5 rounded-xl border-2 transition-all hover:shadow-lg ${
                    selectedPrestation?.id === prestation.id
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{prestation.nom}</h3>
                  
                  {prestation.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {prestation.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-purple-600">
                      {formatPrix(prestation.prix_base)}
                    </span>
                    
                    {prestation.duree_estimee_minutes && (
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock size={14} />
                        {formatDuree(prestation.duree_estimee_minutes)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer avec quantité et validation */}
        {selectedPrestation && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center gap-4">
              {/* Quantité */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Quantité :</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantite(Math.max(1, quantite - 1))}
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:bg-gray-100 font-bold transition"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantite}
                    onChange={(e) => setQuantite(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-20 text-center px-3 py-2 border-2 border-gray-300 rounded-lg font-semibold"
                  />
                  <button
                    onClick={() => setQuantite(quantite + 1)}
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:bg-gray-100 font-bold transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSelect}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
                >
                  Ajouter au panier
                </button>
              </div>
            </div>

            {/* Résumé */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedPrestation.nom} × {quantite}
              </span>
              <span className="text-xl font-black text-purple-600">
                {formatPrix(selectedPrestation.prix_base * quantite)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};