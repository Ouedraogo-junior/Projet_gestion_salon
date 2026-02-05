// src/app/components/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  Package,
  ShoppingCart,
  Calendar,
  BarChart3,
  Settings,
  Wifi,
  WifiOff,
  Scissors,
  Clock,
  Wallet,
  X,
} from 'lucide-react';
import { useSalon } from '@/hooks/useSalon';

const menuItems = [
  { path: '/dashboard', label: 'Tableau de bord', icon: Home },
  { path: '/clients', label: 'Clients', icon: Users },
  { path: '/produits', label: 'Produits & Stock', icon: Package },
  { path: '/confections', label: 'Confections', icon: Package },
  { path: '/prestations', label: 'Prestations', icon: Scissors },
  { path: '/ventes', label: 'Ventes / Caisse', icon: ShoppingCart },
  { path: '/depenses', label: 'Dépenses', icon: Wallet },
  { path: '/rendez-vous', label: 'Rendez-vous', icon: Calendar },
  { path: '/pointages', label: 'Pointages', icon: Clock },
  { path: '/rapports', label: 'Rapports', icon: BarChart3 },
  { path: '/parametres', label: 'Paramètres', icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const isOnline = navigator.onLine;
  const { salon, isLoading } = useSalon();

  // ✅ CORRECTION : Utiliser la variable d'environnement
  const getLogoUrl = (logoPath: string | null) => {
    if (!logoPath) return null;
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    return `${API_URL}/storage/${logoPath}`;
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Bouton fermer (mobile uniquement) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 lg:hidden text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            {salon?.logo_url ? (
              <img
                src={getLogoUrl(salon.logo_url) || ''}
                alt="Logo"
                className="w-12 h-12 object-cover rounded-lg border-2 border-gray-600"
              />
            ) : (
              <span className="text-3xl">🌀</span>
            )}
            <h1 className="text-xl font-bold leading-tight">
              {isLoading ? 'Chargement...' : salon?.nom || 'Fasodreadlocks'}
            </h1>
          </div>
          <p className="text-sm text-gray-400">
            {isLoading ? '' : salon?.adresse || 'Salon Afro Style - Ouagadougou'}
          </p>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white border-l-4 border-orange-500'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Indicateur de connexion */}
        <div className="p-4 border-t border-gray-700">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isOnline ? 'bg-green-900/30 text-green-400' : 'bg-orange-900/30 text-orange-400'
            }`}
          >
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="text-sm">{isOnline ? 'En ligne' : 'Hors ligne'}</span>
          </div>
        </div>
      </aside>
    </>
  );
}