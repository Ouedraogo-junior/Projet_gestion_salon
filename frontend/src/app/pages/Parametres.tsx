// src/app/pages/Parametres.tsx
import { useState, useRef } from 'react';
import {
  Building,
  Users as UsersIcon,
  Upload,
  Trash2,
  Edit,
  Plus,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import { Switch } from '@/app/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { useSalon } from '@/hooks/useSalon';
import { useUsers } from '@/hooks/useUsers';
import type { UserCreateData, UserUpdateData, User } from '@/services/userApi';
import { toast } from 'sonner';

export function Parametres() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // États Salon
  const { salon, isLoading: loadingSalon, updateSalon, isUpdating, uploadLogo, deleteLogo } = useSalon();
  const [salonForm, setSalonForm] = useState({
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    horaires: '',
  });

  // États Utilisateurs
  const { users, isLoading: loadingUsers, createUser, updateUser, deleteUser, toggleActive, resetPassword } = useUsers();
  const [userDialog, setUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userForm, setUserForm] = useState<UserCreateData>({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    password: '',
    role: 'coiffeur',
    specialite: '',
    is_active: true,
  });
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    password_confirmation: '',
  });

  // Initialiser le formulaire salon quand les données sont chargées
  useState(() => {
    if (salon) {
      setSalonForm({
        nom: salon.nom || '',
        adresse: salon.adresse || '',
        telephone: salon.telephone || '',
        email: salon.email || '',
        horaires: salon.horaires || '',
      });
    }
  });

  // Handlers Salon
  const handleSalonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalonForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSalonSubmit = () => {
    if (!salonForm.nom || !salonForm.adresse || !salonForm.telephone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    updateSalon(salonForm);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Le fichier ne doit pas dépasser 2MB');
        return;
      }
      uploadLogo(file);
    }
  };

  const handleLogoDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer le logo ?')) {
      deleteLogo();
    }
  };

  // Handlers Utilisateurs
  const openCreateDialog = () => {
    setEditingUser(null);
    setUserForm({
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      password: '',
      role: 'coiffeur',
      specialite: '',
      is_active: true,
    });
    setUserDialog(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setUserForm({
      nom: user.nom,
      prenom: user.prenom,
      telephone: user.telephone,
      email: user.email || '',
      password: '', // Pas de mot de passe lors de l'édition
      role: user.role,
      specialite: user.specialite || '',
      is_active: user.is_active,
    });
    setUserDialog(true);
  };

  const handleUserChange = (field: string, value: any) => {
    setUserForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUserSubmit = () => {
    if (!userForm.nom || !userForm.prenom || !userForm.telephone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingUser) {
      // Mise à jour - on exclut le password
      const { password, ...updateData } = userForm;
      updateUser(
        { id: editingUser.id, userData: updateData as UserUpdateData },
        {
          onSuccess: () => setUserDialog(false),
        }
      );
    } else {
      // Création
      if (!userForm.password || userForm.password.length < 6) {
        toast.error('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }
      createUser(userForm, {
        onSuccess: () => setUserDialog(false),
      });
    }
  };

  const handleDeleteUser = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteUser(id);
    }
  };

  const handleToggleActive = (id: number) => {
    toggleActive(id);
  };

  const openPasswordDialog = (userId: number) => {
    setSelectedUserId(userId);
    setPasswordForm({ password: '', password_confirmation: '' });
    setPasswordDialog(true);
  };

  const handlePasswordReset = () => {
    if (!selectedUserId) return;

    if (passwordForm.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (passwordForm.password !== passwordForm.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    resetPassword(
      {
        id: selectedUserId,
        password: passwordForm.password,
        password_confirmation: passwordForm.password_confirmation,
      },
      {
        onSuccess: () => {
          setPasswordDialog(false);
          setSelectedUserId(null);
        },
      }
    );
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'gerant':
        return 'bg-purple-100 text-purple-700';
      case 'coiffeur':
        return 'bg-blue-100 text-blue-700';
      case 'gestionnaire':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'gerant':
        return 'Gérant';
      case 'coiffeur':
        return 'Coiffeur';
      case 'receptionniste':
        return 'Réceptionniste';
      default:
        return role;
    }
  };

  if (loadingSalon || loadingUsers) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Paramètres</h1>

      <Tabs defaultValue="salon">
        <TabsList>
          <TabsTrigger value="salon">
            <Building className="w-4 h-4 mr-2" />
            Salon
          </TabsTrigger>
          <TabsTrigger value="utilisateurs">
            <UsersIcon className="w-4 h-4 mr-2" />
            Utilisateurs
          </TabsTrigger>
        </TabsList>

        {/* TAB SALON */}
        <TabsContent value="salon" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations du salon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div className="space-y-2">
                <Label>Logo du salon</Label>
                <div className="flex items-center gap-4">
                  {salon?.logo_url ? (
                    <div className="relative">
                      <img
                        src={`http://127.0.0.1:8000/storage/${salon.logo_url}`}
                        alt="Logo"
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2"
                        onClick={handleLogoDelete}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {salon?.logo_url ? 'Changer' : 'Uploader'}
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG ou GIF (max 2MB)
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Formulaire */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom du salon *</Label>
                  <Input
                    id="nom"
                    value={salonForm.nom}
                    onChange={handleSalonChange}
                    placeholder="Nom du salon"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adresse">Adresse *</Label>
                  <Input
                    id="adresse"
                    value={salonForm.adresse}
                    onChange={handleSalonChange}
                    placeholder="Adresse complète"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone *</Label>
                  <Input
                    id="telephone"
                    value={salonForm.telephone}
                    onChange={handleSalonChange}
                    placeholder="+226 70 00 00 00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={salonForm.email}
                    onChange={handleSalonChange}
                    placeholder="contact@salon.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaires">Horaires d'ouverture</Label>
                  <Input
                    id="horaires"
                    value={salonForm.horaires}
                    onChange={handleSalonChange}
                    placeholder="Lundi - Samedi: 9h - 19h"
                  />
                </div>
              </div>

              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSalonSubmit}
                disabled={isUpdating}
              >
                {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB UTILISATEURS */}
        <TabsContent value="utilisateurs" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un utilisateur
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{user.nom_complet}</p>
                      <p className="text-sm text-gray-600">{user.telephone}</p>
                      {user.email && (
                        <p className="text-xs text-gray-500">{user.email}</p>
                      )}
                      {user.specialite && (
                        <p className="text-xs text-blue-600 mt-1">
                          {user.specialite}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                      <Switch
                        checked={user.is_active}
                        onCheckedChange={() => handleToggleActive(user.id)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPasswordDialog(user.id)}
                      >
                        <Lock className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Utilisateur */}
      <Dialog open={userDialog} onOpenChange={setUserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Modifier' : 'Ajouter'} un utilisateur
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom *</Label>
                <Input
                  value={userForm.prenom}
                  onChange={(e) => handleUserChange('prenom', e.target.value)}
                  placeholder="Prénom"
                />
              </div>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input
                  value={userForm.nom}
                  onChange={(e) => handleUserChange('nom', e.target.value)}
                  placeholder="Nom"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Téléphone *</Label>
              <Input
                value={userForm.telephone}
                onChange={(e) => handleUserChange('telephone', e.target.value)}
                placeholder="+226 70 00 00 00"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) => handleUserChange('email', e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label>Mot de passe *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={userForm.password}
                    onChange={(e) => handleUserChange('password', e.target.value)}
                    placeholder="Minimum 6 caractères"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Rôle *</Label>
              <Select
                value={userForm.role}
                onValueChange={(value) => handleUserChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gerant">Gérant</SelectItem>
                  <SelectItem value="coiffeur">Coiffeur</SelectItem>
                  <SelectItem value="gestionnaire">Gestionnaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Spécialité</Label>
              <Input
                value={userForm.specialite}
                onChange={(e) => handleUserChange('specialite', e.target.value)}
                placeholder="Ex: Tresses, Dreadlocks..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleUserSubmit}>
              {editingUser ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Réinitialisation Mot de passe */}
      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nouveau mot de passe *</Label>
              <Input
                type="password"
                value={passwordForm.password}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Minimum 6 caractères"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirmer le mot de passe *</Label>
              <Input
                type="password"
                value={passwordForm.password_confirmation}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    password_confirmation: e.target.value,
                  }))
                }
                placeholder="Confirmez le mot de passe"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handlePasswordReset}>Réinitialiser</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}