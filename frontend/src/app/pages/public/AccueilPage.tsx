// src/app/pages/public/AccueilPage.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePublicData } from '@/hooks/usePublicData';
import { Scissors, Calendar, ArrowRight, Play, ZoomIn, X } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { ImageWithFallback } from './components/ImageWithFallback';
import type { RealisationPublique, MediaPublique } from '@/types/public.types';

const fmt = (v: number) => new Intl.NumberFormat('fr-FR').format(v);

const getMediaUrl = (url: string) => {
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_API_URL}/storage/${url.replace(/^(storage\/)+/, '')}`;
};

// ─── VideoCardSimple ──────────────────────────────────────────────────────────
const VideoCardSimple: React.FC<{ url: string; onExpand: () => void }> = ({ url, onExpand }) => {
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
    video.paused ? video.play() : video.pause();
    setPlaying(!video.paused);
  };

  return (
    <div
      className={`relative w-full ${isVertical ? 'aspect-[9/16]' : 'aspect-video'} bg-black cursor-pointer`}
      onClick={togglePlay}
    >
      <video
        ref={videoRef} src={url}
        className="w-full h-full object-contain"
        muted playsInline loop preload="metadata"
        onLoadedMetadata={handleMetadata}
        onEnded={() => setPlaying(false)}
      />
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <div className="bg-black/50 rounded-full p-3">
            <Play size={24} className="text-white" fill="white" />
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

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox: React.FC<{
  url: string;
  type: 'photo' | 'video';
  realisation: RealisationPublique;
  onClose: () => void;
}> = ({ url, type, realisation, onClose }) => {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

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
        {type === 'video' ? (
          <video src={url} className="max-w-full max-h-[80vh] rounded-xl" controls autoPlay playsInline />
        ) : (
          <img src={url} alt="Réalisation" className="max-w-full max-h-[80vh] object-contain rounded-xl" />
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

// ─── Page principale ──────────────────────────────────────────────────────────
export const AccueilPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const { salonInfo, prestations, produits, realisations, loading } = usePublicData(slug);
  const [lightbox, setLightbox] = React.useState<{
    url: string;
    type: 'photo' | 'video';
    realisation: RealisationPublique;
  } | null>(null);

  const baseUrl = slug ? `/public/${slug}` : '';

  // Extraire le premier média photo de chaque réalisation pour la grille photos
  const realisationsAvecPhoto = realisations
    .filter((r) => r.medias.some((m) => m.type_media !== 'video'))
    .slice(0, 8);

  // Extraire le premier média vidéo de chaque réalisation pour la grille vidéos
  const realisationsAvecVideo = realisations
    .filter((r) => r.medias.some((m) => m.type_media === 'video'))
    .slice(0, 3);

  const getPremierMedia = (r: RealisationPublique, type: 'photo' | 'video'): MediaPublique | undefined =>
    type === 'video'
      ? r.medias.find((m) => m.type_media === 'video')
      : r.medias.find((m) => m.type_media !== 'video');

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative px-8 py-20 text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Bienvenue chez {salonInfo?.nom}</h1>
          {salonInfo?.description && (
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">{salonInfo.description}</p>
          )}
          <Link
            to={`${baseUrl}/public-rendez-vous`}
            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <Calendar size={20} /> Prendre rendez-vous <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Services */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Nos Services</h2>
          <Link to={`${baseUrl}/services`} className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            Voir tout <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {prestations.slice(0, 3).map((p) => (
            <div key={p.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Scissors className="text-indigo-600" size={24} />
                </div>
                <span className="text-2xl font-bold text-indigo-600">{p.prix_base.toLocaleString()} FCFA</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{p.nom}</h3>
              {p.description && <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Nos Réalisations */}
      {realisations.length > 0 && (
        <section className="space-y-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Nos Réalisations</h2>
            <p className="text-gray-600">Découvrez quelques-unes de nos plus belles créations</p>
          </div>

          {/* Photos */}
          {realisationsAvecPhoto.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {realisationsAvecPhoto.map((realisation) => {
                  const media = getPremierMedia(realisation, 'photo');
                  if (!media) return null;
                  const url = getMediaUrl(media.media_url);
                  return (
                    <div key={realisation.id} className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-white flex flex-col">
                      <div
                        className="relative group aspect-square overflow-hidden cursor-zoom-in"
                        onClick={() => setLightbox({ url, type: 'photo', realisation })}
                      >
                        <ImageWithFallback
                          src={url}
                          alt={realisation.nom_coiffure || 'Réalisation'}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent
                          flex flex-col justify-end p-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity pointer-events-none">
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
                      {(realisation.nom_coiffure || realisation.montant_coiffure) && (
                        <div className="p-3 flex flex-col gap-0.5">
                          {realisation.nom_coiffure && (
                            <p className="text-sm font-bold text-gray-800 truncate">{realisation.nom_coiffure}</p>
                          )}
                          {realisation.montant_coiffure && (
                            <p className="text-sm font-semibold text-indigo-600">{fmt(realisation.montant_coiffure)} FCFA</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vidéos */}
          {realisationsAvecVideo.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Nos Vidéos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {realisationsAvecVideo.map((realisation) => {
                  const media = getPremierMedia(realisation, 'video');
                  if (!media) return null;
                  const url = getMediaUrl(media.media_url);
                  return (
                    <div key={realisation.id} className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-white flex flex-col">
                      <div className="relative group">
                        <VideoCardSimple
                          url={url}
                          onExpand={() => setLightbox({ url, type: 'video', realisation })}
                        />
                        {realisation.description && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent
                            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col justify-end p-3">
                            <p className="text-white text-xs font-medium leading-snug line-clamp-3">
                              {realisation.description}
                            </p>
                          </div>
                        )}
                      </div>
                      {(realisation.nom_coiffure || realisation.montant_coiffure) && (
                        <div className="p-3 flex flex-col gap-0.5">
                          {realisation.nom_coiffure && (
                            <p className="text-sm font-bold text-gray-800 truncate">{realisation.nom_coiffure}</p>
                          )}
                          {realisation.montant_coiffure && (
                            <p className="text-sm font-semibold text-indigo-600">{fmt(realisation.montant_coiffure)} FCFA</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-center">
            <Link to={`${baseUrl}/galerie`} className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium">
              Voir toute la galerie <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}

      {/* Produits */}
      {produits.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Nos Produits</h2>
            <Link to={`${baseUrl}/public-produits`} className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              Voir tout <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {produits.filter((p) => p.photo_url).slice(0, 4).map((produit) => (
              <div key={produit.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-40 bg-gray-100">
                  <ImageWithFallback src={produit.photo_url || ''} alt={produit.nom} className="w-full h-full object-cover" />
                  {produit.en_promo && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">PROMO</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{produit.nom}</h3>
                  <p className="text-lg font-bold text-indigo-600">{produit.prix_actuel.toLocaleString()} FCFA</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-indigo-50 rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Prêt à transformer votre style ?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Prenez rendez-vous dès maintenant et laissez nos experts sublimer votre beauté
        </p>
        <Link
          to={`${baseUrl}/public-rendez-vous`}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Calendar size={20} /> Réserver maintenant
        </Link>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          url={lightbox.url}
          type={lightbox.type}
          realisation={lightbox.realisation}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
};