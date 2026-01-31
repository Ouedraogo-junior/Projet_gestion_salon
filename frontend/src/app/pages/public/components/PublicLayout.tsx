// src/app/pages/public/components/PublicLayout.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scissors, ShoppingBag, Calendar, Phone, MapPin } from 'lucide-react';
import type { SalonPublicInfo } from '@/types/public.types';

interface PublicLayoutProps {
  children: React.ReactNode;
  salonInfo: SalonPublicInfo | null;
  slug?: string;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children, salonInfo, slug }) => {
  const location = useLocation();
  
  // Déterminer le préfixe de route (avec ou sans slug)
  const baseUrl = slug ? `/public/${slug}` : '';

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Scissors className="text-indigo-600" size={28} />
              <h1 className="text-xl font-bold text-gray-800">
                {salonInfo?.nom || 'Salon de Coiffure'}
              </h1>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                to={`${baseUrl}/services`}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(`${baseUrl}/services`)
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Scissors size={18} />
                Services
              </Link>
              
              <Link
                to={`${baseUrl}/produits`}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(`${baseUrl}/produits`)
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ShoppingBag size={18} />
                Produits
              </Link>
              
              <Link
                to={`${baseUrl}/rendez-vous`}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(`${baseUrl}/rendez-vous`)
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar size={18} />
                Prendre RDV
              </Link>
            </nav>
          </div>
        </div>

        {/* Navigation mobile */}
        <div className="md:hidden border-t">
          <div className="flex justify-around py-2">
            <Link
              to={`${baseUrl}/services`}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs ${
                isActive(`${baseUrl}/services`)
                  ? 'text-indigo-600'
                  : 'text-gray-600'
              }`}
            >
              <Scissors size={20} />
              Services
            </Link>
            
            <Link
              to={`${baseUrl}/produits`}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs ${
                isActive(`${baseUrl}/produits`)
                  ? 'text-indigo-600'
                  : 'text-gray-600'
              }`}
            >
              <ShoppingBag size={20} />
              Produits
            </Link>
            
            <Link
              to={`${baseUrl}/rendez-vous`}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs ${
                isActive(`${baseUrl}/rendez-vous`)
                  ? 'text-indigo-600'
                  : 'text-gray-600'
              }`}
            >
              <Calendar size={20} />
              RDV
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {salonInfo && (
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Contact</h3>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Phone size={16} className="mt-1 flex-shrink-0" />
                  <span>{salonInfo.telephone}</span>
                </div>
              </div>
              
              {salonInfo.adresse && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Adresse</h3>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="mt-1 flex-shrink-0" />
                    <span>{salonInfo.adresse}</span>
                  </div>
                </div>
              )}
              
              {salonInfo.horaires && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Horaires</h3>
                  <p className="text-sm text-gray-600">{salonInfo.horaires}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="text-center text-sm text-gray-500 mt-6 pt-6 border-t">
            © 2025 {salonInfo?.nom}. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};