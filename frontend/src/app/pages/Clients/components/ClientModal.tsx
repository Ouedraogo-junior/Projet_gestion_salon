// src/app/pages/Clients/components/ClientModal.tsx

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { clientApi } from '../../../../services/clientApi';
import type { Client, CreateClientDTO, UpdateClientDTO } from '../../../../types/client.types';

interface ClientModalProps {
  client: Client | null;
  isEditing: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  client,
  isEditing,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateClientDTO>({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    date_naissance: '',
    adresse: '',
    notes: '',
  });

  useEffect(() => {
    if (client && isEditing) {
      setFormData({
        nom: client.nom,
        prenom: client.prenom,
        telephone: client.telephone,
        email: client.email || '',
        date_naissance: client.date_naissance || '',
        adresse: client.adresse || '',
        notes: client.notes || '',
      });
    }
  }, [client, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.nom || !formData.prenom || !formData.telephone) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && client) {
        // Mise à jour
        const updateData: UpdateClientDTO = {};
        
        // Ne garder que les champs modifiés
        if (formData.nom !== client.nom) updateData.nom = formData.nom;
        if (formData.prenom !== client.prenom) updateData.prenom = formData.prenom;
        if (formData.telephone !== client.telephone) updateData.telephone = formData.telephone;
        if (formData.email !== (client.email || '')) updateData.email = formData.email || undefined;
        if (formData.date_naissance !== (client.date_naissance || '')) {
          updateData.date_naissance = formData.date_naissance || undefined;
        }
        if (formData.adresse !== (client.adresse || '')) updateData.adresse = formData.adresse || undefined;
        if (formData.notes !== (client.notes || '')) updateData.notes = formData.notes || undefined;

        const response = await clientApi.updateClient(client.id, updateData);
        
        if (response.success) {
          alert('Client modifié avec succès');
          onSuccess();
        }
      } else {
        // Création
        const response = await clientApi.createClient(formData);
        
        if (response.success) {
          alert('Client créé avec succès');
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      
      // Gérer les erreurs de validation
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        alert(errorMessages);
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Une erreur est survenue');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof CreateClientDTO, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">
            {isEditing ? 'Modifier le client' : 'Nouveau client'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => handleChange('nom', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => handleChange('prenom', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => handleChange('telephone', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="+226XXXXXXXX"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date de naissance */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Date de naissance
              </label>
              <input
                type="date"
                value={formData.date_naissance}
                onChange={(e) => handleChange('date_naissance', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <textarea
              value={formData.adresse}
              onChange={(e) => handleChange('adresse', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Notes / Préférences
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Préférences, allergies, remarques..."
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                'Enregistrement...'
              ) : (
                <>
                  <Save size={18} />
                  {isEditing ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};