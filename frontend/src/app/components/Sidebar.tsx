import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  Package,
  ShoppingCart,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  Wifi,
  WifiOff,
} from 'lucide-react';

const menuItems = [
  { path: '/', label: 'Tableau de bord', icon: Home },
  { path: '/clients', label: 'Clients', icon: Users },
  { path: '/produits', label: 'Produits & Stock', icon: Package },
  { path: '/ventes', label: 'Ventes / Caisse', icon: ShoppingCart },
  { path: '/rendez-vous', label: 'Rendez-vous', icon: Calendar },
  { path: '/marketing', label: 'Marketing SMS', icon: MessageSquare },
  { path: '/rapports', label: 'Rapports', icon: BarChart3 },
  { path: '/parametres', label: 'Paramètres', icon: Settings },
];

export function Sidebar() {
  const isOnline = navigator.onLine;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl flex items-center gap-2">
          <span className="text-3xl">🌀</span>
          <span>Fasodreadlocks Manager</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">Salon Afro Style - Ouagadougou</p>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
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
  );
}
