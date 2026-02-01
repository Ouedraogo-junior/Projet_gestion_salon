// src/app/pages/public/AccueilPage.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePublicData } from '@/hooks/usePublicData';
import { Scissors, ShoppingBag, Calendar, ArrowRight, Star } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { ImageWithFallback } from './components/ImageWithFallback';

export const AccueilPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const { salonInfo, prestations, produits, photos, loading } = usePublicData(slug);

  const baseUrl = slug ? `/public/${slug}` : '';

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-8 py-20 text-center text-white">
          <h1 className="text-5xl font-bold mb-4">
            Bienvenue chez {salonInfo?.nom}
          </h1>
          {salonInfo?.description && (
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              {salonInfo.description}
            </p>
          )}
          <Link
            to={`${baseUrl}/public-rendez-vous`}
            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <Calendar size={20} />
            Prendre rendez-vous
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Nos Services */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Nos Services</h2>
          <Link
            to={`${baseUrl}/services`}
            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            Voir tout
            <ArrowRight size={18} />
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {prestations.slice(0, 3).map((prestation) => (
            <div key={prestation.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Scissors className="text-indigo-600" size={24} />
                </div>
                <span className="text-2xl font-bold text-indigo-600">
                  {prestation.prix_base.toLocaleString()} FCFA
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{prestation.nom}</h3>
              {prestation.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {prestation.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Galerie Photos - Nos Réalisations */}
      {photos.length > 0 && (
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Nos Réalisations
            </h2>
            <p className="text-gray-600">Découvrez quelques-unes de nos plus belles créations</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.slice(0, 8).map((photo) => (
                <div 
                key={photo.id} 
                className="relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
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

          <div className="text-center mt-8">
            <Link
              to={`${baseUrl}/galerie`}
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Voir toute la galerie
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}

{/* Nos Produits */}
{produits.length > 0 && (
  <section>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-3xl font-bold text-gray-800">Nos Produits</h2>
      <Link
        to={`${baseUrl}/public-produits`}
        className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
      >
        Voir tout
        <ArrowRight size={18} />
      </Link>
    </div>
    
    {/* DEBUG */}
    {/* <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
      <p className="font-mono text-sm">
        Total produits: {produits.length}<br/>
        Avec photos: {produits.filter(p => p.photo_url).length}<br/>
        Premier produit avec photo: {JSON.stringify(produits.find(p => p.photo_url))}
      </p>
    </div> */}
    
    <div className="grid md:grid-cols-4 gap-6">
      {produits.filter(p => p.photo_url).slice(0, 4).map((produit) => (
        <div key={produit.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative h-40 bg-gray-100">
            <ImageWithFallback
              src={produit.photo_url || ''}
              alt={produit.nom}
              className="w-full h-full object-cover"
            />
            {produit.en_promo && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                PROMO
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold mb-1">{produit.nom}</h3>
            <p className="text-lg font-bold text-indigo-600">
              {produit.prix_actuel.toLocaleString()} FCFA
            </p>
          </div>
        </div>
      ))}
    </div>
  </section>
)}

      {/* Call to Action */}
      <section className="bg-indigo-50 rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Prêt à transformer votre style ?
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Prenez rendez-vous dès maintenant et laissez nos experts sublimer votre beauté
        </p>
        <Link
          to={`${baseUrl}/public-rendez-vous`}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Calendar size={20} />
          Réserver maintenant
        </Link>
      </section>
    </div>
  );
};