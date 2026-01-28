// src/app/pages/prestations/components/PrestationFormModal.tsx

import React, { useState, useEffect } from 'react';
import { X, Save, Clock, DollarSign } from 'lucide-react';
import type { TypePrestation, CreateTypePrestationDTO } from '../../../../types/prestation.types';

interface PrestationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTypePrestationDTO) => Promise<void>;
  prestation?: TypePrestation | null;
}

export const PrestationFormModal: React.FC<PrestationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  prestation,
}) => {
  const [formData, setFormData] = useState<CreateTypePrestationDTO>({
    nom: '',
    description: '',
    duree_estimee_minutes: undefined,
    prix_base: 0,
    actif: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Remplir le formulaire si modification
  useEffect(() => {
    if (prestation) {
      setFormData({
        nom: prestation.nom,
        description: prestation.description || '',
        duree_estimee_minutes: prestation.duree_estimee_minutes || undefined,
        prix_base: prestation.prix_base,
        actif: prestation.actif,
      });
    } else {
      setFormData({
        nom: '',
        description: '',
        duree_estimee_minutes: undefined,
        prix_base: 0,
        actif: true,
      });
    }
    setErrors({});
  }, [prestation, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Retirer l'erreur si présente
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }

    if (formData.prix_base <= 0) {
      newErrors.prix_base = 'Le prix doit être supérieur à 0';
    }

    if (
      formData.duree_estimee_minutes !== undefined &&
      formData.duree_estimee_minutes < 1
    ) {
      newErrors.duree_estimee_minutes = 'La durée doit être supérieure à 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {prestation ? 'Modifier la prestation' : 'Nouvelle prestation'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom de la prestation *
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                errors.nom ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Coupe Homme"
            />
            {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              placeholder="Décrivez cette prestation..."
            />
          </div>

          {/* Prix et Durée */}
          <div className="grid grid-cols-2 gap-4">
            {/* Prix */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prix de base (FCFA) *
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="number"
                  name="prix_base"
                  value={formData.prix_base}
                  onChange={handleChange}
                  min="0"
                  step="100"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                    errors.prix_base ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="2000"
                />
              </div>
              {errors.prix_base && (
                <p className="mt-1 text-sm text-red-600">{errors.prix_base}</p>
              )}
            </div>

            {/* Durée */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Durée estimée (minutes)
              </label>
              <div className="relative">
                <Clock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="number"
                  name="duree_estimee_minutes"
                  value={formData.duree_estimee_minutes || ''}
                  onChange={handleChange}
                  min="1"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                    errors.duree_estimee_minutes ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="30"
                />
              </div>
              {errors.duree_estimee_minutes && (
                <p className="mt-1 text-sm text-red-600">{errors.duree_estimee_minutes}</p>
              )}
            </div>
          </div>

          {/* Actif */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="actif"
              checked={formData.actif}
              onChange={handleChange}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <label className="ml-3 text-sm font-medium text-gray-700">
              Prestation active
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={20} />
                  {prestation ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};