import React, { useState } from 'react';
import { X, Plus, Trash2, ImageIcon, Video } from 'lucide-react';
import { toast } from 'sonner';
import { realisationApi } from '@/services/realisationApi';
import type { Realisation, CreateRealisationDTO, UpdateRealisationDTO } from '@/types/realisation.types';

interface Props {
  realisation?: Realisation | null;
  onClose: () => void;
  onSaved: () => void;
}

interface MediaEntry {
  file: File;
  preview: string;
  type_media: 'photo' | 'video';
  type_photo: 'avant' | 'apres';
}

export const RealisationFormModal: React.FC<Props> = ({ realisation, onClose, onSaved }) => {
  const isEdit = !!realisation;

  const [nomCoiffure, setNomCoiffure]       = useState(realisation?.nom_coiffure ?? '');
  const [montant, setMontant]               = useState(realisation?.montant_coiffure?.toString() ?? '');
  const [description, setDescription]       = useState(realisation?.description ?? '');
  const [datePrise, setDatePrise]           = useState(realisation?.date_prise?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [isPublic, setIsPublic]             = useState(realisation?.is_public ?? true);
  const [medias, setMedias]                 = useState<MediaEntry[]>([]);
  const [saving, setSaving]                 = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      const preview = URL.createObjectURL(file);
      setMedias((prev) => [...prev, {
        file,
        preview,
        type_media: isVideo ? 'video' : 'photo',
        type_photo: 'apres',
      }]);
    });
  };

  const removeMedia = (index: number) => {
    setMedias((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateEntry = (index: number, key: keyof MediaEntry, value: string) => {
    setMedias((prev) => prev.map((m, i) => i === index ? { ...m, [key]: value } : m));
  };

  const handleSubmit = async () => {
    if (!isEdit && medias.length === 0) {
      toast.error('Ajoutez au moins un média');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        const dto: UpdateRealisationDTO = {
          nom_coiffure:     nomCoiffure || undefined,
          montant_coiffure: montant ? parseFloat(montant) : undefined,
          description:      description || undefined,
          date_prise:       datePrise,
          is_public:        isPublic,
        };
        await realisationApi.updateRealisation(realisation!.id, dto);
        toast.success('Réalisation mise à jour');
      } else {
        const dto: CreateRealisationDTO = {
          nom_coiffure:     nomCoiffure || undefined,
          montant_coiffure: montant ? parseFloat(montant) : undefined,
          description:      description || undefined,
          date_prise:       datePrise,
          is_public:        isPublic,
          medias:           medias.map((m) => m.file),
          types_photo:      medias.map((m) => m.type_photo),
          types_media:      medias.map((m) => m.type_media),
        };
        await realisationApi.createRealisation(dto);
        toast.success('Réalisation créée avec succès');
      }
      onSaved();
      onClose();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            {isEdit ? 'Modifier la réalisation' : 'Nouvelle réalisation'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Infos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la coiffure</label>
              <input
                type="text" value={nomCoiffure}
                onChange={(e) => setNomCoiffure(e.target.value)}
                placeholder="Ex: Tresses collées"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA)</label>
              <input
                type="number" value={montant} min={0}
                onChange={(e) => setMontant(e.target.value)}
                placeholder="Ex: 5000"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date" value={datePrise}
                onChange={(e) => setDatePrise(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2} placeholder="Optionnel"
                className="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox" id="is_public" checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 accent-indigo-600"
              />
              <label htmlFor="is_public" className="text-sm font-medium text-gray-700">
                Publier dans la galerie publique
              </label>
            </div>
          </div>

          {/* Médias — seulement à la création */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Médias <span className="text-red-500">*</span>
              </label>

              {/* Zone drop */}
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition">
                <Plus size={24} className="text-gray-400 mb-1" />
                <span className="text-sm text-gray-500">Cliquer pour ajouter photos / vidéos</span>
                <span className="text-xs text-gray-400 mt-0.5">JPG, PNG, MP4, MOV — multiple autorisé</span>
                <input
                  type="file" className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/gif,video/mp4,video/mov,video/avi,video/webm"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>

              {/* Liste médias ajoutés */}
              {medias.length > 0 && (
                <div className="mt-3 space-y-2">
                  {medias.map((entry, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                      {/* Miniature */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        {entry.type_media === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <Video size={20} className="text-white" />
                          </div>
                        ) : (
                          <img src={entry.preview} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>

                      {/* Sélecteurs */}
                      <div className="flex gap-2 flex-1">
                        <select
                          value={entry.type_media}
                          onChange={(e) => updateEntry(i, 'type_media', e.target.value)}
                          className="flex-1 text-xs border rounded px-2 py-1"
                        >
                          <option value="photo">Photo</option>
                          <option value="video">Vidéo</option>
                        </select>
                        <select
                          value={entry.type_photo}
                          onChange={(e) => updateEntry(i, 'type_photo', e.target.value)}
                          className="flex-1 text-xs border rounded px-2 py-1"
                        >
                          <option value="apres">Après</option>
                          <option value="avant">Avant</option>
                        </select>
                      </div>

                      {/* Supprimer */}
                      <button
                        onClick={() => removeMedia(i)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
};