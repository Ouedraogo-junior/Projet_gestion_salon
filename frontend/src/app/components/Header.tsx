// src/app/components/Header.tsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, RefreshCw, LogOut, User, Settings, ChevronDown, Search, X, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { NotificationPanel } from './NotificationPanel';

interface HeaderProps {
  onMenuClick?: () => void;
}

function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout }    = useAuth();
  const { count }           = useNotifications();
  const { query, setQuery, results, loading, goTo, clear, ICONS } = useGlobalSearch();

  const [isSyncing, setIsSyncing]               = useState(false);
  const [showUserMenu, setShowUserMenu]         = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isFocused, setIsFocused]               = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const showDropdown = isFocused && (results.length > 0 || (query.length >= 2 && loading));

  // Fermer le dropdown si clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Raccourci clavier Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') { clear(); setIsFocused(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [clear]);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const handleLogout = async () => {
    try { await logout(); navigate('/login', { replace: true }); }
    catch (e) { console.error(e); }
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${(user.prenom || '').charAt(0)}${(user.nom || '').charAt(0)}`.toUpperCase();
  };
  const getFullName  = () => (user ? `${user.prenom} ${user.nom}` : 'Utilisateur');
  const getRoleLabel = () => {
    const roles: Record<string, string> = { gerant: 'Gérant', coiffeur: 'Coiffeur', gestionnaire: 'Gestionnaire' };
    return user?.role ? (roles[user.role] || user.role) : 'Utilisateur';
  };

  const typeLabel: Record<string, string> = { client: 'Client', produit: 'Produit', vente: 'Vente' };

  return (
    <>
      <header className="h-[70px] bg-white border-b border-gray-200 flex items-center px-3 sm:px-6 gap-2 sm:gap-4">

        {/* Hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Barre de recherche globale */}
        <div ref={wrapperRef} className="flex-1 max-w-xl relative hidden sm:block">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
            isFocused ? 'border-blue-400 bg-white shadow-sm' : 'border-gray-200 bg-gray-50'
          }`}>
            {loading
              ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0" />
              : <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            }
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Rechercher un client, produit, vente…"
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
            />
            {query ? (
              <button onClick={clear} className="flex-shrink-0 p-0.5 hover:bg-gray-100 rounded">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            ) : (
              <span className="flex-shrink-0 text-[10px] text-gray-300 border border-gray-200 rounded px-1 py-0.5 font-mono hidden lg:block">
                ⌘K
              </span>
            )}
          </div>

          {/* Dropdown résultats */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 overflow-hidden">
              {loading && results.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-400 text-center">Recherche en cours…</div>
              )}

              {!loading && results.length === 0 && query.length >= 2 && (
                <div className="px-4 py-3 text-sm text-gray-400 text-center">Aucun résultat pour « {query} »</div>
              )}

              {results.length > 0 && (
                <div>
                  {/* Grouper par type */}
                  {(['client', 'produit', 'vente'] as const).map(type => {
                    const group = results.filter(r => r.type === type);
                    if (!group.length) return null;
                    return (
                      <div key={type}>
                        <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                          {ICONS[type]} {typeLabel[type]}s
                        </div>
                        {group.map(result => (
                          <button
                            key={`${result.type}-${result.id}`}
                            onMouseDown={() => goTo(result)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{result.label}</p>
                              {result.sublabel && (
                                <p className="text-xs text-gray-400 truncate">{result.sublabel}</p>
                              )}
                            </div>
                            <span className="flex-shrink-0 text-xs text-gray-300">→</span>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recherche mobile : icône seule */}
        <button
          onClick={() => inputRef.current?.focus()}
          className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Search className="w-5 h-5 text-gray-500" />
        </button>

        {/* Actions droite */}
        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-500 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          >
            <Bell className="w-5 h-5 text-gray-500" />
            {count > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                {count > 99 ? '99+' : count}
              </Badge>
            )}
          </button>

          <div className="relative border-l pl-2 sm:pl-3">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:bg-gray-50 p-1 sm:p-1.5 rounded-lg transition-colors"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900 leading-tight">{getFullName()}</p>
                <p className="text-[11px] text-gray-400 leading-tight">{getRoleLabel()}</p>
              </div>
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                <AvatarFallback className="bg-blue-600 text-white font-semibold text-xs sm:text-sm">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="hidden sm:block w-4 h-4 text-gray-400" />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{getFullName()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user?.email || "Pas d'email"}</p>
                    <p className="text-xs text-gray-400">{user?.telephone}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { setShowUserMenu(false); navigate('/profil'); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" /> Mon profil
                    </button>
                    <button
                      onClick={() => { setShowUserMenu(false); navigate('/parametres'); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" /> Paramètres
                    </button>
                  </div>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Se déconnecter
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
}

export default Header;