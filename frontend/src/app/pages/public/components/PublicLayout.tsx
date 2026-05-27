// src/app/pages/public/components/PublicLayout.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scissors, ShoppingBag, Calendar, Phone, MapPin, Camera } from 'lucide-react';
import { CartDrawer } from './CartDrawer';
import { useCart } from '@/hooks/useCart';
import type { SalonPublicInfo } from '@/types/public.types';

interface PublicLayoutProps {
  children: React.ReactNode;
  salonInfo: SalonPublicInfo | null;
  slug?: string;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children, salonInfo, slug }) => {
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const { items, total, totalItems, addItem, updateQuantite, removeItem } = useCart();

  const baseUrl = slug ? `/public/${slug}` : '';
  const isActive = (path: string) => location.pathname === path;

  const getLogoUrl = (logoPath: string | null) => {
    if (!logoPath) return null;
    const cleanPath = logoPath.replace(/^storage\//, '');
    return `${import.meta.env.VITE_API_URL}/storage/${cleanPath}`;
  };

  /** Message WhatsApp construit depuis le panier */
  const handleCommander = () => {
    if (!salonInfo || items.length === 0) return;
    const lignes = items
      .map((i) => `• ${i.produit_nom} (${i.variante_label}) x${i.quantite} = ${i.prix_unitaire * i.quantite} FCFA`)
      .join('\n');
    const message =
      `Bonjour ${salonInfo.nom}, je souhaite commander :\n\n${lignes}\n\nTotal : ${total} FCFA`;
    window.open(
      `https://wa.me/${salonInfo.telephone.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  // Cloner children en injectant addItem pour ProduitsPagePublic
  const childrenWithCart = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        onAddToCart: addItem,
        salonInfo, // ← ajouter cette ligne
      });
    }
    return child;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={`${baseUrl}/`} className="flex items-center gap-3 hover:opacity-80 transition">
              {salonInfo?.logo_url ? (
                <img
                  src={getLogoUrl(salonInfo.logo_url) || ''}
                  alt={`Logo ${salonInfo.nom}`}
                  className="w-14 h-14 object-cover rounded-full border-2 border-indigo-100"
                />
              ) : (
                <Scissors className="text-indigo-600" size={32} />
              )}
              <h1 className="text-xl font-bold text-gray-800">
                {salonInfo?.nom || 'Salon de Coiffure'}
              </h1>
            </Link>

            <div className="flex items-center gap-2">
              {/* Nav desktop */}
              <nav className="hidden md:flex items-center gap-2 mr-2">
                {[
                  { to: `${baseUrl}/services`, icon: <Scissors size={18} />, label: 'Services' },
                  { to: `${baseUrl}/public-produits`, icon: <ShoppingBag size={18} />, label: 'Produits' },
                  { to: `${baseUrl}/public-rendez-vous`, icon: <Calendar size={18} />, label: 'Prendre RDV' },
                  { to: `${baseUrl}/galerie`, icon: <Camera size={18} />, label: 'Galerie' },
                ].map(({ to, icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(to) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {icon}{label}
                  </Link>
                ))}
              </nav>

              {/* Bouton panier */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition"
                aria-label="Ouvrir le panier"
              >
                <ShoppingBag size={22} className="text-indigo-600" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Nav mobile */}
        <div className="md:hidden border-t">
          <div className="flex justify-around py-2">
            {[
              { to: `${baseUrl}/services`, icon: <Scissors size={20} />, label: 'Services' },
              { to: `${baseUrl}/public-produits`, icon: <ShoppingBag size={20} />, label: 'Produits' },
              { to: `${baseUrl}/public-rendez-vous`, icon: <Calendar size={20} />, label: 'RDV' },
              { to: `${baseUrl}/galerie`, icon: <Camera size={20} />, label: 'Galerie' },
            ].map(({ to, icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 px-3 py-2 text-xs ${
                  isActive(to) ? 'text-indigo-600' : 'text-gray-600'
                }`}
              >
                {icon}{label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {childrenWithCart}
      </main>

      {/* Footer — identique à l'original */}
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
            <p className="text-gray-400">© 2026 {salonInfo?.nom || 'Fasodreadlocks'} - Tous droits réservés</p>
            <p className="text-gray-500 text-sm mt-2">Fait par Junior OUEDRAOGO ✨</p>
          </div>
        </div>
      </footer>

      {/* Drawer panier */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={items}
        total={total}
        onUpdateQuantite={updateQuantite}
        onRemove={removeItem}
        onCommander={() => { handleCommander(); setCartOpen(false); }}
      />
    </div>
  );
};