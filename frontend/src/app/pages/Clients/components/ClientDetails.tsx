import React, { useState, useEffect } from 'react';
import {
  X, Edit, Phone, Mail, MapPin, Calendar,
  Trophy, DollarSign, Camera, Trash2, ImageOff, Play, Video,
} from 'lucide-react';
import { clientApi } from '../../../../services/clientApi';
import type { Client, ClientStats, PhotoClient } from '../../../../types/client.types';

interface ClientDetailsProps {
  clientId: number;
  onClose: () => void;
  onModifier: () => void;
}

export const ClientDetails: React.FC<ClientDetailsProps> = ({ clientId, onClose, onModifier }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Upload
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [typeMedia, setTypeMedia] = useState<'photo' | 'video'>('photo');
  const [photoType, setPhotoType] = useState<'avant' | 'apres'>('apres');
  const [nomCoiffure, setNomCoiffure] = useState('');
  const [montantCoiffure, setMontantCoiffure] = useState('');
  const [photoDescription, setPhotoDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isPublic, setIsPublic] = useState(true); // true par défaut

  // Galerie
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  useEffect(() => { loadClientDetails(); }, [clientId]);

  useEffect(() => {
    if (!mediaFile) { setMediaPreview(null); return; }
    if (typeMedia === 'video') {
      setMediaPreview(URL.createObjectURL(mediaFile));
    } else {
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result as string);
      reader.readAsDataURL(mediaFile);
    }
  }, [mediaFile, typeMedia]);

  const loadClientDetails = async () => {
    setIsLoading(true);
    try {
      const response = await clientApi.getClient(clientId);
      if (response.success) {
        setClient(response.data.client);
        setStats(response.data.statistiques);
      }
    } catch {
      alert('Erreur lors du chargement des détails');
    } finally {
      setIsLoading(false);
    }
  };

  const resetUploadForm = () => {
    setShowUploadForm(false);
    setMediaFile(null);
    setMediaPreview(null);
    setTypeMedia('photo');
    setPhotoType('apres');
    setNomCoiffure('');
    setMontantCoiffure('');
    setPhotoDescription('');
    setIsPublic(true); 
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setMediaFile(file);
  };

  const handleUploadMedia = async () => {
    console.log('mediaFile:', mediaFile);
    if (!mediaFile || !client) return;
    setIsUploading(true);
    try {
      const response = await clientApi.uploadPhoto(client.id, {
        media: mediaFile,
        type_photo: photoType,
        type_media: typeMedia,
        description: photoDescription || undefined,
        nom_coiffure: nomCoiffure || undefined,
        montant_coiffure: montantCoiffure ? parseFloat(montantCoiffure) : undefined,
        is_public: isPublic, 
      });
      if (response.success) {
        resetUploadForm();
        loadClientDetails();
      }
    } catch {
      alert("Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!client || !confirm('Supprimer ce média ?')) return;
    try {
      const response = await clientApi.deletePhoto(client.id, photoId);
      if (response.success) loadClientDetails();
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  const getMediaUrl = (url: string) => {
    const cleanUrl = url.replace(/^(storage\/)+/, '');
    return `${import.meta.env.VITE_API_URL}/storage/${cleanUrl}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatMontant = (montant: number) =>
    new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8"><p>Chargement...</p></div>
      </div>
    );
  }

  if (!client) return null;

  const acceptAttr = typeMedia === 'video' ? 'video/mp4,video/mov,video/avi,video/webm' : 'image/jpeg,image/png,image/jpg';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">

        {/* En-tête */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">{client.prenom} {client.nom}</h3>
          <div className="flex items-center gap-2">
            <button onClick={onModifier} className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded flex items-center gap-2">
              <Edit size={16} /> Modifier
            </button>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Infos + Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Informations de contact</h4>
                  <div className="space-y-2">
                    <a
                      href={`https://wa.me/${client.telephone.replace(/\s+/g, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 hover:underline cursor-pointer"
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
                  <p className="text-2xl font-bold text-yellow-600">{stats?.points_fidelite || 0}</p>
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
                  <span className="font-medium">{formatDate(stats?.date_premiere_visite)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dernière visite</span>
                  <span className="font-medium">{formatDate(stats?.date_derniere_visite)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Statut</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${client.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                    {client.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Médias */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Photos & Vidéos</h4>
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm flex items-center gap-2"
              >
                <Camera size={16} />
                Ajouter
              </button>
            </div>

            {/* Formulaire upload */}
            {showUploadForm && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                {/* Sélection format en premier pour adapter l'input fichier */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Format</label>
                    <select
                      value={typeMedia}
                      onChange={(e) => { setTypeMedia(e.target.value as 'photo' | 'video'); setMediaFile(null); setMediaPreview(null); }}
                      className="w-full px-3 py-2 border rounded text-sm"
                    >
                      <option value="photo">Photo</option>
                      <option value="video">Vidéo</option>
                    </select>
                  </div>
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
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {typeMedia === 'video' ? 'Vidéo' : 'Photo'}
                  </label>
                  <input
                    key={typeMedia} // reset l'input quand on change de format
                    type="file"
                    accept={acceptAttr}
                    onChange={handleFileChange}
                    className="w-full text-sm"
                  />
                </div>

                {/* Prévisualisation */}
                {mediaPreview && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Aperçu</label>
                    {typeMedia === 'video' ? (
                      <video src={mediaPreview} controls className="w-full max-w-xs h-48 rounded-lg border object-cover" />
                    ) : (
                      <img src={mediaPreview} alt="Aperçu" className="w-full max-w-xs h-48 object-cover rounded-lg border" />
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom de la coiffure</label>
                    <input
                      type="text" value={nomCoiffure}
                      onChange={e => setNomCoiffure(e.target.value)}
                      className="w-full px-3 py-2 border rounded text-sm"
                      placeholder="Ex: Tresses collées"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Montant (FCFA)</label>
                    <input
                      type="number" value={montantCoiffure}
                      onChange={e => setMontantCoiffure(e.target.value)}
                      className="w-full px-3 py-2 border rounded text-sm"
                      placeholder="Ex: 5000" min="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input
                      type="text" value={photoDescription}
                      onChange={e => setPhotoDescription(e.target.value)}
                      className="w-full px-3 py-2 border rounded text-sm"
                      placeholder="Optionnel"
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_public"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <label htmlFor="is_public" className="text-sm font-medium text-gray-700">
                      Publier dans la galerie publique
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleUploadMedia}
                    disabled={!mediaFile || isUploading}
                    className="px-4 py-2 bg-green-500 text-white rounded text-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {isUploading ? 'Envoi...' : 'Enregistrer'}
                  </button>
                  <button onClick={resetUploadForm} className="px-4 py-2 border rounded text-sm">
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Galerie */}
            {client.photos && client.photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {client.photos.map((media) => (
                  <div key={media.id} className="relative group">
                    {media.type_media === 'video' ? (
                      <div className="relative w-full h-40">
                        <video
                          src={getMediaUrl(media.media_url)}
                          className="w-full h-40 object-cover rounded-lg"
                          muted loop playsInline
                          onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
                          onMouseLeave={e => { const v = e.currentTarget as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-black/40 rounded-full p-1.5 group-hover:opacity-0 transition-opacity">
                            <Play size={18} className="text-white" fill="white" />
                          </div>
                        </div>
                      </div>
                    ) : imageErrors.has(media.id) ? (
                      <div className="w-full h-40 bg-gray-200 rounded-lg flex flex-col items-center justify-center">
                        <ImageOff size={32} className="text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">Image non disponible</p>
                      </div>
                    ) : (
                      <img
                        src={getMediaUrl(media.media_url)}
                        alt={media.description || `Photo ${media.type_photo}`}
                        className="w-full h-40 object-cover rounded-lg"
                        onError={() => setImageErrors(prev => new Set([...prev, media.id]))}
                      />
                    )}

                    {/* Badge avant/après */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded">
                        {media.type_photo === 'avant' ? 'Avant' : 'Après'}
                      </span>
                    </div>

                    {/* Badge vidéo */}
                    {media.type_media === 'video' && (
                      <div className="absolute top-2 right-8">
                        <span className="px-1.5 py-1 bg-indigo-600 bg-opacity-90 text-white text-xs rounded">
                          <Video size={10} className="inline" />
                        </span>
                      </div>
                    )}

                    {/* Bouton suppression */}
                    <button
                      onClick={() => handleDeletePhoto(media.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>

                    {/* Infos sous la vignette */}
                    {media.nom_coiffure && (
                      <p className="mt-1 text-xs font-medium text-gray-700 truncate">{media.nom_coiffure}</p>
                    )}
                    {media.montant_coiffure && (
                      <p className="text-xs text-indigo-600 font-medium">
                        {new Intl.NumberFormat('fr-FR').format(media.montant_coiffure)} FCFA
                      </p>
                    )}
                    {media.description && (
                      <p className="text-xs text-gray-500 truncate">{media.description}</p>
                    )}
                    <p className="text-xs text-gray-400">{formatDate(media.date_prise)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">Aucun média disponible</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};