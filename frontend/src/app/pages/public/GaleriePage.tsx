// src/app/pages/public/GaleriePage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { usePublicData } from '@/hooks/usePublicData';
import { Loader2 } from 'lucide-react';
import { ImageWithFallback } from './components/ImageWithFallback';

export const GaleriePage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const { photos, loading } = usePublicData(slug);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  console.log('Photos reçues:', photos);
    console.log('URLs générées:', photos.map(p => p.photo_url));
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Galerie de nos Réalisations
        </h2>
        <p className="text-gray-600">
          Découvrez le travail de nos experts en coiffure
        </p>
      </div>

      {photos.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          Aucune photo disponible pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
                <div 
                key={photo.id} 
                className="relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow group cursor-pointer"
                >
                <ImageWithFallback
                    src={photo.photo_url}
                    alt={photo.description || 'Réalisation'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {photo.description && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-sm">{photo.description}</p>
                    </div>
                )}
                </div>
            ))}
            </div>
      )}
    </div>
  );
};