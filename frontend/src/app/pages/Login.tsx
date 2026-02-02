import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSalonPublic } from '../../hooks/useSalonPublic';
import { Lock, Phone, AlertCircle, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { salon, isLoading: isLoadingSalon } = useSalonPublic();
  
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('📤 Envoi des credentials:', { telephone, password: '***' });
      
      await login({ telephone, password });
      
      console.log('✅ Login réussi, redirection vers /dashboard');
      navigate('/dashboard', { replace: true });
      
    } catch (err: any) {
      console.error('❌ Erreur lors du login:', err);
      setError(err.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour obtenir l'URL complète du logo
  const getLogoUrl = (logoPath: string | null) => {
    if (!logoPath) return null;
    
    // Si c'est déjà une URL complète
    if (logoPath.startsWith('http')) {
      return logoPath;
    }
    
    // Sinon, construire l'URL complète
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseUrl}/storage/${logoPath}`;
  };

  const logoUrl = salon?.logo_url ? getLogoUrl(salon.logo_url) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            {/* Logo du salon - Cliquable - Centré */}
            <div className="flex justify-center mb-4">
              <Link 
                to="/" 
                className="block w-24 h-24 group"
                title="Retour à l'accueil"
              >
                {isLoadingSalon ? (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                  </div>
                ) : logoUrl ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={logoUrl} 
                      alt={salon?.nom || 'Logo du salon'}
                      className="w-full h-full object-cover rounded-2xl shadow-lg ring-4 ring-white group-hover:shadow-xl group-hover:ring-blue-500 transition-all duration-300 transform group-hover:scale-105"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <span className="text-4xl font-bold text-white">
                        {salon?.nom ? salon.nom.substring(0, 2).toUpperCase() : 'FD'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300 transform group-hover:scale-105">
                    <span className="text-4xl font-bold text-white">
                      {salon?.nom ? salon.nom.substring(0, 2).toUpperCase() : 'FD'}
                    </span>
                  </div>
                )}
              </Link>
            </div>

            {/* Nom du salon - Également cliquable */}
            <Link 
              to="/" 
              className="inline-block hover:opacity-80 transition-opacity"
              title="Retour à l'accueil"
            >
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                {salon?.nom || 'Fasodreadlocks'}
              </h1>
            </Link>
            <p className="text-slate-500 text-sm">
              Connectez-vous à votre espace
            </p>
            {/* {salon?.slogan && (
              <p className="text-slate-400 text-xs mt-1 italic">
                {salon.slogan}
              </p>
            )} */}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800 font-medium">Erreur de connexion</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Téléphone */}
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-slate-700 mb-2">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="telephone"
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  required
                  placeholder="+226 XX XX XX XX"
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Code PIN */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Code PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  maxLength={6}
                  placeholder="Entrez votre code PIN"
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800 text-center">
              <span className="font-semibold">Compte test:</span> +22670123456 / 123456
            </p>
          </div> */}
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          © 2026 {salon?.nom || 'Salon Dreadlocks'} - Tous droits réservés
        </p>
      </div>
    </div>
  );
};

export default Login;