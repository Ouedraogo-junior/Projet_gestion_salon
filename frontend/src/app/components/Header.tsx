// src/app/components/Header.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, RefreshCw, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationPanel } from './NotificationPanel';



interface HeaderProps {
  onMenuClick?: () => void;
}

function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { count } = useNotifications();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  
  // Fonction de synchronisation
  const handleSync = async () => {
    setIsSyncing(true);
    // Simuler une synchronisation
    setTimeout(() => {
      setIsSyncing(false);
    }, 2000);
  };

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Obtenir les initiales de l'utilisateur
  const getInitials = () => {
    if (!user) return 'U';
    const nom = user.nom || '';
    const prenom = user.prenom || '';
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  // Formater le nom complet
  const getFullName = () => {
    if (!user) return 'Utilisateur';
    return `${user.prenom} ${user.nom}`;
  };

  // Formater le rôle en français
  const getRoleLabel = () => {
    if (!user?.role) return 'Utilisateur';
    //console.log('User role:', user?.role);
    const roles: Record<string, string> = {
      'gerant': 'Gerant',
      'coiffeur': 'Coiffeur',
      'gestionnaire': 'Gestionnaire',
    };
    return roles[user.role] || user.role;
  };

  return (
    <>
      <header className="h-[70px] bg-white border-b border-gray-200 flex items-center px-6 gap-6">
        {/* Menu hamburger (mobile) */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Barre de recherche */}
        <div className="flex-1 max-w-2xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Rechercher un client, produit, rendez-vous..."
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Actions droite */}
        <div className="flex items-center gap-4">
          {/* Synchronisation */}
          <button
            onClick={handleSync}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Synchronisation"
            disabled={isSyncing}
          >
            <RefreshCw
              className={`w-5 h-5 text-gray-600 ${isSyncing ? 'animate-spin' : ''}`}
            />
          </button>

          {/* Notifications */}
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {count > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                {count > 99 ? '99+' : count}
              </Badge>
            )}
          </button>

          {/* Menu utilisateur */}
          <div className="relative border-l pl-4">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <div className="text-right">
                <p className="text-sm font-medium">{getFullName()}</p>
                <p className="text-xs text-gray-500">{getRoleLabel()}</p>
              </div>
              <Avatar>
                <AvatarFallback className="bg-blue-600 text-white font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Menu déroulant */}
            {showUserMenu && (
              <>
                {/* Overlay pour fermer le menu */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  {/* Infos utilisateur */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{getFullName()}</p>
                    <p className="text-xs text-gray-500 mt-1">{user?.email || 'Pas d\'email'}</p>
                    <p className="text-xs text-gray-500">{user?.telephone}</p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/profil');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Mon profil
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/parametres');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Paramètres
                    </button>
                  </div>

                  {/* Déconnexion */}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Panel de notifications */}
      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
}

export default Header;