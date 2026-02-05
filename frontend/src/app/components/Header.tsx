// src/app/components/Header.tsx
import { useState } from 'react';
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
  const [showSearch, setShowSearch] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const getInitials = () => {
    if (!user) return 'U';
    const nom = user.nom || '';
    const prenom = user.prenom || '';
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const getFullName = () => {
    if (!user) return 'Utilisateur';
    return `${user.prenom} ${user.nom}`;
  };

  const getRoleLabel = () => {
    if (!user?.role) return 'Utilisateur';
    const roles: Record<string, string> = {
      'gerant': 'Gerant',
      'coiffeur': 'Coiffeur',
      'gestionnaire': 'Gestionnaire',
    };
    return roles[user.role] || user.role;
  };

  return (
    <>
      <header className="h-[70px] bg-white border-b border-gray-200 flex items-center px-3 sm:px-6 gap-2 sm:gap-6">
        {/* Menu hamburger */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Barre de recherche - Desktop */}
        <div className="hidden md:flex flex-1 max-w-2xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Actions droite */}
        <div className="flex items-center gap-1 sm:gap-4 ml-auto">
          {/* Recherche mobile */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {/* Synchronisation */}
          <button
            onClick={handleSync}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSyncing}
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${isSyncing ? 'animate-spin' : ''}`} />
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
          <div className="relative border-l pl-2 sm:pl-4">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 p-1 sm:p-2 rounded-lg transition-colors"
            >
              {/* Nom - caché sur mobile */}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{getFullName()}</p>
                <p className="text-xs text-gray-500">{getRoleLabel()}</p>
              </div>
              
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarFallback className="bg-blue-600 text-white font-semibold text-xs sm:text-sm">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              <ChevronDown className="hidden sm:block w-4 h-4 text-gray-400 transition-transform" />
            </button>

            {/* Menu déroulant */}
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{getFullName()}</p>
                    <p className="text-xs text-gray-500 mt-1">{user?.email || 'Pas d\'email'}</p>
                    <p className="text-xs text-gray-500">{user?.telephone}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { setShowUserMenu(false); navigate('/profil'); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Mon profil
                    </button>

                    <button
                      onClick={() => { setShowUserMenu(false); navigate('/parametres'); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Paramètres
                    </button>
                  </div>

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

      {/* Barre de recherche mobile */}
      {showSearch && (
        <div className="md:hidden bg-white border-b border-gray-200 px-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-10 bg-gray-50 border-gray-200"
              autoFocus
            />
          </div>
        </div>
      )}

      <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
}

export default Header;