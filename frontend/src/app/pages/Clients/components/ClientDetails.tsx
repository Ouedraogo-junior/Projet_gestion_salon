// src/app/pages/Clients/components/ClientDetails.tsx

import React, { useState, useEffect } from 'react';
import {
  X,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Trophy,
  DollarSign,
  Camera,
  Trash2,
  ImageOff,
} from 'lucide-react';
import { clientApi } from '../../../../services/clientApi';
import type { Client, ClientStats, PhotoClient } from '../../../../types/client.types';

interface ClientDetailsProps {
  clientId: number;
  onClose: () => void;
  onModifier: () => void;
}

export const ClientDetails: React.FC<ClientDetailsProps> = ({
  clientId,
  onClose,
  onModifier,
}) => {
  const [client, setClient] = useState<Client | null>(null);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadPhoto, setShowUploadPhoto] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<'avant' | 'apres'>('apres');
  const [photoDescription, setPhotoDescription] = useState('');
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadClientDetails();
  }, [clientId]);

  // Prévisualisation de la photo sélectionnée
  useEffect(() => {
    if (photoFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(photoFile);
    } else {
      setPhotoPreview(null);
    }
  }, [photoFile]);

  const loadClientDetails = async () => {
    setIsLoading(true);
    try {
      const response = await clientApi.getClient(clientId);
      if (response.success) {
        setClient(response.data.client);
        setStats(response.data.statistiques);
      }
    } catch (error) {
      console.error('Erreur chargement détails client:', error);
      alert('Erreur lors du chargement des détails');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadPhoto = async () => {
    if (!photoFile || !client) return;

    try {
      const response = await clientApi.uploadPhoto(client.id, {
        photo: photoFile,
        type_photo: photoType,
        description: photoDescription,
        is_public: false,
      });

      if (response.success) {
        alert('Photo ajoutée avec succès');
        setShowUploadPhoto(false);
        setPhotoFile(null);
        setPhotoPreview(null);
        setPhotoDescription('');
        loadClientDetails();
      }
    } catch (error: any) {
      console.error('Erreur upload photo:', error);
      alert('Erreur lors de l\'upload de la photo');
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!client || !confirm('Supprimer cette photo ?')) return;

    try {
      const response = await clientApi.deletePhoto(client.id, photoId);
      if (response.success) {
        alert('Photo supprimée');
        loadClientDetails();
      }
    } catch (error) {
      console.error('Erreur suppression photo:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleImageError = (photoId: number) => {
    setImageErrors(prev => new Set([...prev, photoId]));
  };

  const getImageUrl = (photoUrl: string) => {
    let cleanUrl = photoUrl.replace(/^(storage\/)+/, '');
    return `${import.meta.env.VITE_API_URL}/storage/${cleanUrl}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">
            {client.prenom} {client.nom}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onModifier}
              className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded flex items-center gap-2"
            >
              <Edit size={16} />
              Modifier
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Informations de contact</h4>
                <div className="space-y-2">
                  <a
                    href={`https://wa.me/${client.telephone.replace(/\s+/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 hover:underline cursor-pointer"
                    title="Envoyer un message WhatsApp"
                  >
                    <Phone size={16} className="text-gray-400" />
                    <span>{client.telephone}</span>
                  </a>
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-gray-400" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.adresse && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin size={16} className="text-gray-400 mt-0.5" />
                      <span>{client.adresse}</span>
                    </div>
                  )}
                </div>
              </div>

              {client.date_naissance && (
                <div>
                  <h4 className="font-semibold mb-2">Date de naissance</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-gray-400" />
                    <span>{formatDate(client.date_naissance)}</span>
                  </div>
                </div>
              )}

              {client.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded">{client.notes}</p>
                </div>
              )}
            </div>

            {/* Colonne droite - Stats */}
            <div className="space-y-4">
              <h4 className="font-semibold mb-3">Statistiques</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy size={18} className="text-yellow-600" />
                    <span className="text-sm text-gray-600">Points</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats?.points_fidelite || 0}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={18} className="text-green-600" />
                    <span className="text-sm text-gray-600">Dépensé</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {formatMontant(stats?.montant_total_depense || 0)}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Première visite</span>
                  <span className="font-medium">
                    {formatDate(stats?.date_premiere_visite)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dernière visite</span>
                  <span className="font-medium">
                    {formatDate(stats?.date_derniere_visite)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Statut</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      client.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {client.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Photos</h4>
              <button
                onClick={() => setShowUploadPhoto(!showUploadPhoto)}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm flex items-center gap-2"
              >
                <Camera size={16} />
                Ajouter une photo
              </button>
            </div>

            {/* Formulaire upload photo */}
            {showUploadPhoto && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    className="w-full text-sm"
                  />
                </div>

                {/* Prévisualisation */}
                {photoPreview && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-2">Aperçu</label>
                    <img
                      src={photoPreview}
                      alt="Aperçu"
                      className="w-full max-w-xs h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      value={photoType}
                      onChange={(e) => setPhotoType(e.target.value as 'avant' | 'apres')}
                      className="w-full px-3 py-2 border rounded text-sm"
                    >
                      <option value="avant">Avant</option>
                      <option value="apres">Après</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input
                      type="text"
                      value={photoDescription}
                      onChange={(e) => setPhotoDescription(e.target.value)}
                      className="w-full px-3 py-2 border rounded text-sm"
                      placeholder="Optionnel"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUploadPhoto}
                    disabled={!photoFile}
                    className="px-4 py-2 bg-green-500 text-white rounded text-sm disabled:opacity-50"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setShowUploadPhoto(false);
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="px-4 py-2 border rounded text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Galerie photos */}
            {client.photos && client.photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {client.photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    {imageErrors.has(photo.id) ? (
                      // Placeholder si l'image ne charge pas
                      <div className="w-full h-40 bg-gray-200 rounded-lg flex flex-col items-center justify-center">
                        <ImageOff size={32} className="text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">Image non disponible</p>
                        <p className="text-xs text-gray-400 mt-1 px-2 text-center break-all">
                          {photo.photo_url}
                        </p>
                      </div>
                    ) : (
                      <img
                        src={getImageUrl(photo.photo_url)}
                        alt={photo.description || `Photo ${photo.type_photo}`}
                        className="w-full h-40 object-cover rounded-lg"
                        onError={() => handleImageError(photo.id)}
                      />
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded">
                        {photo.type_photo === 'avant' ? 'Avant' : 'Après'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Supprimer la photo"
                    >
                      <Trash2 size={14} />
                    </button>
                    {photo.description && (
                      <p className="mt-1 text-xs text-gray-600">{photo.description}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {formatDate(photo.date_prise)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                Aucune photo disponible
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};