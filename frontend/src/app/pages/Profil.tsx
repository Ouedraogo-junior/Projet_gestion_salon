import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { userApi } from '@/services/userApi';
import { Camera, Save, Lock, X, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';

function Profil() {
  const { user, setUser } = useAuth(); // Assure-toi que setUser existe dans ton contexte
  
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    telephone: user?.telephone || '',
    email: user?.email || '',
    specialite: user?.specialite || '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPhotoUrl = (url: string | null) => {
    if (!url) return null;
    const cleanUrl = url.replace(/^(storage\/)+/, '');
    return `${import.meta.env.VITE_API_URL}/storage/${cleanUrl}`;
  };

  const getInitials = () => {
    return `${formData.prenom.charAt(0)}${formData.nom.charAt(0)}`.toUpperCase();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une image valide' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'L\'image ne doit pas dépasser 5 MB' });
      return;
    }

    try {
      setIsUploadingPhoto(true);
      setMessage(null);
      
      const response = await userApi.uploadPhoto(file);
      
      if (response.success && response.data) {
        setUser?.(response.data); // Mettre à jour le contexte
        setMessage({ type: 'success', text: 'Photo mise à jour avec succès' });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erreur lors de l\'upload' 
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!confirm('Supprimer votre photo de profil ?')) return;

    try {
      setIsUploadingPhoto(true);
      const response = await userApi.deletePhoto();
      
      if (response.success && response.data) {
        setUser?.(response.data);
        setMessage({ type: 'success', text: 'Photo supprimée avec succès' });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erreur lors de la suppression' 
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await userApi.updateProfil(formData);
      
      if (response.success && response.data) {
        setUser?.(response.data);
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erreur lors de la mise à jour' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.password !== passwordData.password_confirmation) {
      setPasswordMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage(null);

    try {
      const response = await userApi.changeMyPassword(passwordData);
      
      if (response.success) {
        setPasswordMessage({ type: 'success', text: 'Mot de passe modifié avec succès' });
        setPasswordData({
          current_password: '',
          password: '',
          password_confirmation: '',
        });
      }
    } catch (error: any) {
      setPasswordMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erreur lors du changement de mot de passe' 
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getRoleLabel = () => {
    const roles: Record<string, string> = {
      'gerant': 'Gérant',
      'coiffeur': 'Coiffeur',
      'gestionnaire': 'Gestionnaire',
    };
    return roles[user?.role || ''] || user?.role;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon Profil</h1>

      {/* Photo de profil */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Photo de profil</h2>
        
        <div className="flex items-center gap-6">
          <Avatar className="w-24 h-24">
            {user?.photo_url ? (
              <AvatarImage src={getPhotoUrl(user.photo_url)} alt="Photo de profil" />
            ) : (
              <AvatarFallback className="bg-blue-600 text-white text-2xl font-semibold">
                {getInitials()}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
              >
                <Upload className="w-4 h-4 mr-2" />
                {user?.photo_url ? 'Changer' : 'Ajouter une photo'}
              </Button>

              {user?.photo_url && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeletePhoto}
                  disabled={isUploadingPhoto}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG, WEBP (max 5 MB)
            </p>
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h2>

        {message && (
          <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {message.text}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone <span className="text-red-500">*</span>
            </label>
            <Input
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {user?.role === 'coiffeur' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spécialité
              </label>
              <Input
                value={formData.specialite}
                onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                placeholder="Ex: Dreadlocks, Tresses, Coupe homme..."
              />
            </div>
          )}

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Rôle:</strong> {getRoleLabel()}
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </div>

      {/* Changer le mot de passe */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Changer le mot de passe</h2>

        {passwordMessage && (
          <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
            passwordMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {passwordMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {passwordMessage.text}
            </p>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe actuel <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={passwordData.password}
              onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le nouveau mot de passe <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={passwordData.password_confirmation}
              onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isChangingPassword}>
              <Lock className="w-4 h-4 mr-2" />
              {isChangingPassword ? 'Modification...' : 'Changer le mot de passe'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profil;