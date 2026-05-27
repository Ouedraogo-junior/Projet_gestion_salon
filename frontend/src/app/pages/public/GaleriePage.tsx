// src/app/pages/public/GaleriePage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { publicApiService } from '@/services/publicApi';
import { Loader2, Play, ChevronDown, ChevronUp, X, ZoomIn } from 'lucide-react';
import { ImageWithFallback } from './components/ImageWithFallback';
import type { MediaPublique, RealisationPublique, SalonPublicInfo } from '@/types/public.types';

interface GaleriePageProps {
  salonInfo?: SalonPublicInfo | null;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(v);

const getMediaUrl = (url: string) => {
  if (url.startsWith('http')) return url;
  const cleanUrl = url.replace(/^(storage\/)+/, '');
  return `${import.meta.env.VITE_API_URL}/storage/${cleanUrl}`;
};

// ─── Lightbox ────────────────────────────────────────────────────────────────
const Lightbox: React.FC<{
  media: MediaPublique;
  realisation: RealisationPublique;
  onClose: () => void;
}> = ({ media, realisation, onClose }) => {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const url = getMediaUrl(media.media_url);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition"
      >
        <X size={24} />
      </button>

      <div
        className="max-w-4xl w-full max-h-[80vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {media.type_media === 'video' ? (
          <video src={url} className="max-w-full max-h-[80vh] rounded-xl" controls autoPlay playsInline />
        ) : (
          <img src={url} alt={realisation.nom_coiffure || 'Réalisation'} className="max-w-full max-h-[80vh] object-contain rounded-xl" />
        )}
      </div>

      {(realisation.nom_coiffure || realisation.montant_coiffure || realisation.description) && (
        <div
          className="mt-4 max-w-4xl w-full bg-white/10 rounded-xl p-4 text-white space-y-1"
          onClick={(e) => e.stopPropagation()}
        >
          {realisation.nom_coiffure && <p className="font-bold text-base">{realisation.nom_coiffure}</p>}
          {realisation.montant_coiffure && (
            <p className="text-indigo-300 font-semibold text-sm">{fmt(realisation.montant_coiffure)} FCFA</p>
          )}
          {realisation.description && (
            <p className="text-gray-300 text-sm leading-snug">{realisation.description}</p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── RealisationInfo (sous chaque card) ──────────────────────────────────────
const RealisationInfo: React.FC<{
  realisation: RealisationPublique;
  onRdv: () => void;
}> = ({ realisation, onRdv }) => {
  const [expanded, setExpanded] = React.useState(false);
  const hasDesc = !!realisation.description;
  const longDesc = hasDesc && realisation.description!.length > 60;

  return (
    <div className="p-3 bg-white flex flex-col gap-1">
      {realisation.nom_coiffure && (
        <p className="text-sm font-bold text-gray-800 leading-tight truncate">
          {realisation.nom_coiffure}
        </p>
      )}
      {realisation.montant_coiffure && (
        <p className="text-sm font-semibold text-indigo-600">
          {fmt(realisation.montant_coiffure)} FCFA
        </p>
      )}
      {hasDesc && (
        <div>
          <p className={`text-xs text-gray-500 leading-snug ${!expanded && longDesc ? 'line-clamp-2' : ''}`}>
            {realisation.description}
          </p>
          {longDesc && (
            <button
              onClick={() => setExpanded((p) => !p)}
              className="text-xs text-indigo-500 font-medium flex items-center gap-0.5 mt-0.5 hover:text-indigo-700"
            >
              {expanded ? <><ChevronUp size={12} /> Voir moins</> : <><ChevronDown size={12} /> Voir plus</>}
            </button>
          )}
        </div>
      )}
      <button
        onClick={onRdv}
        className="mt-2 w-full py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
        </svg>
        Prendre RDV
      </button>
    </div>
  );
};

// ─── VideoCard ────────────────────────────────────────────────────────────────
const VideoCard: React.FC<{ url: string; onExpand: () => void }> = ({ url, onExpand }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const [isVertical, setIsVertical] = React.useState(false);

  const handleMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setIsVertical(video.videoHeight > video.videoWidth);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (playing) { video.pause(); setPlaying(false); }
    else { video.play(); setPlaying(true); }
  };

  return (
    <div
      className={`relative w-full ${isVertical ? 'aspect-[9/16]' : 'aspect-video'} bg-black cursor-pointer`}
      onClick={togglePlay}
    >
      <video
        ref={videoRef} src={url}
        className="w-full h-full object-contain"
        muted playsInline loop
        onLoadedMetadata={handleMetadata}
        onEnded={() => setPlaying(false)}
      />
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="bg-black/50 rounded-full p-3">
            <Play size={28} className="text-white" fill="white" />
          </div>
        </div>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onExpand(); }}
        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition"
      >
        <ZoomIn size={16} />
      </button>
    </div>
  );
};

// ─── Card réalisation avec plusieurs médias ───────────────────────────────────
const RealisationCard: React.FC<{
  realisation: RealisationPublique;
  isVideo: boolean;
  onOpenLightbox: (media: MediaPublique) => void;
  onRdv: () => void;
}> = ({ realisation, isVideo, onOpenLightbox, onRdv }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const medias = realisation.medias;
  const current = medias[currentIndex];

  if (!current) return null;

  const url = getMediaUrl(current.media_url);

  return (
    <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-white flex flex-col">
      <div className="relative group">
        {isVideo ? (
          <VideoCard url={url} onExpand={() => onOpenLightbox(current)} />
        ) : (
          <div
            className="relative aspect-square overflow-hidden cursor-zoom-in"
            onClick={() => onOpenLightbox(current)}
          >
            <ImageWithFallback
              src={url}
              alt={realisation.nom_coiffure || 'Réalisation'}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent
              opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col justify-end p-3">
              {realisation.description && (
                <p className="text-white text-xs font-medium leading-snug line-clamp-3">
                  {realisation.description}
                </p>
              )}
            </div>
            <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <ZoomIn size={14} className="text-white" />
            </div>
          </div>
        )}

        {/* Overlay description sur vidéo */}
        {isVideo && realisation.description && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col justify-end p-3">
            <p className="text-white text-xs font-medium leading-snug line-clamp-3">
              {realisation.description}
            </p>
          </div>
        )}

        {/* Navigateur si plusieurs médias */}
        {medias.length > 1 && (
          <>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
              {medias.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentIndex ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex((p) => (p === 0 ? medias.length - 1 : p - 1)); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition opacity-0 group-hover:opacity-100"
            >
              ‹
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex((p) => (p + 1) % medias.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition opacity-0 group-hover:opacity-100"
            >
              ›
            </button>
          </>
        )}
      </div>

      <RealisationInfo realisation={realisation} onRdv={onRdv} />
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────
export const GaleriePage: React.FC<GaleriePageProps> = ({ salonInfo }) => {
  const { slug } = useParams<{ slug?: string }>();
  const [realisations, setRealisations] = React.useState<RealisationPublique[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [lightbox, setLightbox] = React.useState<{ media: MediaPublique; realisation: RealisationPublique } | null>(null);

  React.useEffect(() => {
    publicApiService.getRealisations(slug)
      .then((res) => { if (res.success) setRealisations(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  // Séparer : réalisations avec au moins une photo / au moins une vidéo
  const avecPhotos  = realisations.filter((r) => r.medias.some((m) => m.type_media !== 'video'));
  const avecVideos  = realisations.filter((r) => r.medias.some((m) => m.type_media === 'video'));

  const handleRdv = (realisation: RealisationPublique) => {
    if (!salonInfo?.telephone) return;
    const nom  = realisation.nom_coiffure ? ` pour "${realisation.nom_coiffure}"` : '';
    const prix = realisation.montant_coiffure ? ` (${fmt(realisation.montant_coiffure)} FCFA)` : '';
    const message = `Bonjour ${salonInfo.nom}, je souhaite prendre un rendez-vous${nom}${prix}.`;
    window.open(
      `https://wa.me/${salonInfo.telephone.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Galerie</h2>
        <p className="text-gray-600">Découvrez le travail de nos experts en coiffure</p>
      </div>

      {realisations.length === 0 && (
        <p className="text-gray-500 text-center py-12">Aucune réalisation disponible pour le moment.</p>
      )}

      {/* ── Nos Réalisations (photos) ── */}
      {avecPhotos.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Nos Réalisations</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {avecPhotos.map((realisation) => (
              <RealisationCard
                key={realisation.id}
                realisation={realisation}
                isVideo={false}
                onOpenLightbox={(media) => setLightbox({ media, realisation })}
                onRdv={() => handleRdv(realisation)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Nos Vidéos ── */}
      {avecVideos.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Nos Vidéos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {avecVideos.map((realisation) => (
              <RealisationCard
                key={realisation.id}
                realisation={realisation}
                isVideo={true}
                onOpenLightbox={(media) => setLightbox({ media, realisation })}
                onRdv={() => handleRdv(realisation)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          media={lightbox.media}
          realisation={lightbox.realisation}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
};