import React from 'react';
import { Edit, Trash2, Plus, Eye, EyeOff, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Realisation, MediaRealisation } from '@/types/realisation.types';

interface Props {
  realisation: Realisation;
  onEdit: () => void;
  onDelete: () => void;
  onAddMedias: () => void;
  onDeleteMedia: (mediaId: number) => void;
  onTogglePublic: () => void;
}

const fmt = (v: number) => new Intl.NumberFormat('fr-FR').format(v);

const getMediaUrl = (url: string) => {
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_API_URL}/storage/${url.replace(/^(storage\/)+/, '')}`;
};

export const RealisationCard: React.FC<Props> = ({
  realisation, onEdit, onDelete, onAddMedias, onDeleteMedia, onTogglePublic,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [confirmDeleteMedia, setConfirmDeleteMedia] = React.useState<number | null>(null);

  const medias = realisation.medias ?? [];
  const current: MediaRealisation | undefined = medias[currentIndex];

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((p) => (p === 0 ? medias.length - 1 : p - 1));
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((p) => (p + 1) % medias.length);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
      {/* ── Zone média ── */}
      <div className="relative group bg-gray-100">
        {current ? (
          current.type_media === 'video' ? (
            <div className="relative aspect-video bg-black">
              <video
                src={getMediaUrl(current.media_url)}
                className="w-full h-full object-contain"
                muted playsInline preload="metadata"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 rounded-full p-2">
                  <Play size={20} className="text-white" fill="white" />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative aspect-square">
              <img
                src={getMediaUrl(current.media_url)}
                alt={realisation.nom_coiffure || 'Réalisation'}
                className="w-full h-full object-cover"
              />
            </div>
          )
        ) : (
          <div className="aspect-square flex items-center justify-center text-gray-400 text-sm">
            Aucun média
          </div>
        )}

        {/* Badge avant/après */}
        {current && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded">
            {current.type_photo === 'avant' ? 'Avant' : 'Après'}
          </span>
        )}

        {/* Badge public/privé */}
        <button
          onClick={onTogglePublic}
          className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 transition ${
            realisation.is_public
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          {realisation.is_public ? <Eye size={10} /> : <EyeOff size={10} />}
          {realisation.is_public ? 'Public' : 'Privé'}
        </button>

        {/* Navigation médias */}
        {medias.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
              <ChevronLeft size={16} />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {medias.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentIndex ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}

        {/* Bouton supprimer média courant */}
        {current && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition">
            {confirmDeleteMedia === current.id ? (
              <div className="flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteMedia(current.id); setConfirmDeleteMedia(null); }}
                  className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                >
                  Confirmer
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDeleteMedia(null); }}
                  className="px-2 py-1 bg-gray-500 text-white text-xs rounded"
                >
                  Non
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDeleteMedia(current.id); }}
                className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition"
                title="Supprimer ce média"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Infos ── */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          {realisation.nom_coiffure && (
            <p className="font-bold text-gray-800 text-sm leading-tight">{realisation.nom_coiffure}</p>
          )}
          {realisation.montant_coiffure && (
            <p className="text-indigo-600 font-semibold text-sm">{fmt(realisation.montant_coiffure)} FCFA</p>
          )}
          {realisation.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{realisation.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {new Date(realisation.date_prise).toLocaleDateString('fr-FR')}
            {realisation.client && ` · ${realisation.client.prenom} ${realisation.client.nom}`}
          </p>
          <p className="text-xs text-gray-400">{medias.length} média(s)</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t mt-auto">
          <button
            onClick={onAddMedias}
            className="flex-1 py-1.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center justify-center gap-1 transition"
          >
            <Plus size={13} /> Médias
          </button>
          <button
            onClick={onEdit}
            className="flex-1 py-1.5 text-xs text-orange-600 hover:bg-orange-50 rounded-lg flex items-center justify-center gap-1 transition"
          >
            <Edit size={13} /> Modifier
          </button>
          {confirmDelete ? (
            <div className="flex gap-1">
              <button
                onClick={onDelete}
                className="px-2 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Confirmer
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1.5 text-xs border rounded-lg hover:bg-gray-50"
              >
                Non
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="py-1.5 px-2 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center gap-1 transition"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};