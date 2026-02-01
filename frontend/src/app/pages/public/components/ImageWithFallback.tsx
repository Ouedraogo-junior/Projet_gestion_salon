// src/app/pages/public/components/ImageWithFallback.tsx
import React, { useState } from 'react';
import { Camera } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  alt, 
  className = '' 
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Construire l'URL complète si nécessaire
  const getImageUrl = (url: string) => {
    if (!url) {
      console.log('❌ URL vide pour:', alt);
      return '';
    }
    
    // Si l'URL est déjà complète, la retourner telle quelle
    if (url.startsWith('http://') || url.startsWith('https://')) {
      //console.log('✅ URL complète:', url);
      return url;
    }
    
    // Sinon, construire l'URL complète
    const cleanUrl = url.replace(/^(storage\/)+/, '');
    const finalUrl = `${import.meta.env.VITE_API_URL}/storage/${cleanUrl}`;
    // console.log('🔧 URL construite:', {
    //   original: url,
    //   cleaned: cleanUrl,
    //   final: finalUrl,
    //   VITE_API_URL: import.meta.env.VITE_API_URL
    // });
    return finalUrl;
  };

  const imageUrl = getImageUrl(src);

  if (error || !imageUrl) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <Camera className="text-gray-400" size={48} />
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
          <Camera className="text-gray-300 animate-pulse" size={48} />
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`${className} ${loading ? 'hidden' : ''}`}
        onLoad={() => {
          //console.log('✅ Image chargée:', imageUrl);
          setLoading(false);
        }}
        onError={(e) => {
          //console.error('❌ Erreur chargement image:', imageUrl, e);
          setError(true);
          setLoading(false);
        }}
      />
    </>
  );
};