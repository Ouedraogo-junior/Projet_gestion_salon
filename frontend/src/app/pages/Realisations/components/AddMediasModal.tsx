import React, { useState } from 'react';
import { X, Plus, Trash2, Video } from 'lucide-react';
import { toast } from 'sonner';
import { realisationApi } from '@/services/realisationApi';
import type { Realisation } from '@/types/realisation.types';

interface Props {
  realisation: Realisation;
  onClose: () => void;
  onSaved: () => void;
}

interface MediaEntry {
  file: File;
  preview: string;
  type_media: 'photo' | 'video';
  type_photo: 'avant' | 'apres';
}

export const AddMediasModal: React.FC<Props> = ({ realisation, onClose, onSaved }) => {
  const [medias, setMedias] = useState<MediaEntry[]>([]);
  const [saving, setSaving] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      setMedias((prev) => [...prev, {
        file,
        preview: URL.createObjectURL(file),
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
    if (medias.length === 0) { toast.error('Ajoutez au moins un média'); return; }
    setSaving(true);
    try {
      await realisationApi.addMedias(realisation.id, {
        medias:      medias.map((m) => m.file),
        types_photo: medias.map((m) => m.type_photo),
        types_media: medias.map((m) => m.type_media),
      });
      toast.success(`${medias.length} média(s) ajouté(s)`);
      onSaved();
      onClose();
    } catch {
      toast.error("Erreur lors de l'ajout des médias");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Ajouter des médias</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {realisation.nom_coiffure || 'Réalisation sans nom'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition">
            <Plus size={24} className="text-gray-400 mb-1" />
            <span className="text-sm text-gray-500">Ajouter photos / vidéos</span>
            <span className="text-xs text-gray-400 mt-0.5">Multiple autorisé</span>
            <input
              type="file" className="hidden"
              accept="image/jpeg,image/jpg,image/png,image/gif,video/mp4,video/mov,video/avi,video/webm"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>

          {medias.length > 0 && (
            <div className="space-y-2">
              {medias.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    {entry.type_media === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <Video size={20} className="text-white" />
                      </div>
                    ) : (
                      <img src={entry.preview} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
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

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || medias.length === 0}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {saving ? 'Envoi...' : `Ajouter ${medias.length > 0 ? `(${medias.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};