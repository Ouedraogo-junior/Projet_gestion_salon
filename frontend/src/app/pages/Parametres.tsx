// src/app/pages/Parametres.tsx
import { useState, useRef, useEffect } from 'react';
import { UtilisateursArchives } from '../components/UtilisateursArchives';

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
  DollarSign,
  UserX,
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
import { useUsers, useSalaires } from '@/hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';
import type { UserCreateData, UserUpdateData, User } from '@/services/userApi';
import { toast } from 'sonner';

export function Parametres() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user: currentUser } = useAuth();

  // Vérifier si l'utilisateur est gérant
  const isGerant = currentUser?.role === 'gestionnaire';

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
  const { salaires, isLoading: loadingSalaires, updateSalaire } = useSalaires();
  
  const [userDialog, setUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [salaireDialog, setSalaireDialog] = useState(false);
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
  const [salaireForm, setSalaireForm] = useState({
    salaire_mensuel: 0,
  });

  // Initialiser le formulaire salon quand les données sont chargées
  useEffect(() => {
    if (salon) {
      setSalonForm({
        nom: salon.nom || '',
        adresse: salon.adresse || '',
        telephone: salon.telephone || '',
        email: salon.email || '',
        horaires: salon.horaires || '',
      });
    }
  }, [salon]);

  // Si l'utilisateur n'est pas gérant, rediriger ou afficher message
  if (!isGerant) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Accès réservé aux gérants uniquement.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const openSalaireDialog = (user: User) => {
    setSelectedUserId(user.id);
    setSalaireForm({ salaire_mensuel: user.salaire_mensuel || 0 });
    setSalaireDialog(true);
  };

  const handleSalaireSubmit = () => {
    if (!selectedUserId) return;

    if (salaireForm.salaire_mensuel < 0) {
      toast.error('Le salaire ne peut pas être négatif');
      return;
    }

    updateSalaire(
      { id: selectedUserId, salaire_mensuel: salaireForm.salaire_mensuel },
      {
        onSuccess: () => {
          setSalaireDialog(false);
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
      case 'gestionnaire':
        return 'Gestionnaire';
      default:
        return role;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loadingSalon || loadingUsers) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Paramètres</h1>

      <Tabs defaultValue="salon">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="salon" className="text-xs sm:text-sm">
            <Building className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Salon</span>
          </TabsTrigger>
          <TabsTrigger value="utilisateurs" className="text-xs sm:text-sm">
            <UsersIcon className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Utilisateurs</span>
          </TabsTrigger>
          <TabsTrigger value="salaires" className="text-xs sm:text-sm">
            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Salaires</span>
          </TabsTrigger>
          <TabsTrigger value="archives" className="text-xs sm:text-sm">
            <UserX className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Archives</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB SALON */}
        <TabsContent value="salon" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Informations du salon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Logo */}
              <div className="space-y-2">
                <Label className="text-sm">Logo du salon</Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {salon?.logo_url ? (
                    <div className="relative">
                      <img
                        src={`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/storage/${salon.logo_url}`}
                        alt="Logo"
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border"
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
                    <div className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed rounded-lg flex items-center justify-center">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
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
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
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
                  <Label htmlFor="nom" className="text-sm">Nom du salon *</Label>
                  <Input
                    id="nom"
                    value={salonForm.nom}
                    onChange={handleSalonChange}
                    placeholder="Nom du salon"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adresse" className="text-sm">Adresse *</Label>
                  <Input
                    id="adresse"
                    value={salonForm.adresse}
                    onChange={handleSalonChange}
                    placeholder="Adresse complète"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone" className="text-sm">Téléphone *</Label>
                  <Input
                    id="telephone"
                    value={salonForm.telephone}
                    onChange={handleSalonChange}
                    placeholder="+226 70 00 00 00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={salonForm.email}
                    onChange={handleSalonChange}
                    placeholder="contact@salon.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaires" className="text-sm">Horaires d'ouverture</Label>
                  <Input
                    id="horaires"
                    value={salonForm.horaires}
                    onChange={handleSalonChange}
                    placeholder="Lundi - Samedi: 9h - 19h"
                  />
                </div>
              </div>

              <Button
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                onClick={handleSalonSubmit}
                disabled={isUpdating}
              >
                {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB UTILISATEURS */}
        <TabsContent value="utilisateurs" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-lg sm:text-xl">Gestion des utilisateurs</CardTitle>
              <Button onClick={openCreateDialog} size="sm">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Ajouter
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{user.nom_complet}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{user.telephone}</p>
                      {user.email && (
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      )}
                      {user.specialite && (
                        <p className="text-xs text-blue-600 mt-1">
                          {user.specialite}
                        </p>
                      )}
                      {user.salaire_mensuel && (
                        <p className="text-xs text-green-600 mt-1">
                          Salaire: {formatCurrency(user.salaire_mensuel)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-wrap">
                      <span
                        className={`text-xs px-2 sm:px-3 py-1 rounded-full ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.is_active}
                          onCheckedChange={() => handleToggleActive(user.id)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSalaireDialog(user)}
                          title="Gérer le salaire"
                        >
                          <DollarSign className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPasswordDialog(user.id)}
                          title="Réinitialiser le mot de passe"
                        >
                          <Lock className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                          title="Modifier"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB SALAIRES */}
        <TabsContent value="salaires" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Récapitulatif des salaires</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSalaires ? (
                <p>Chargement...</p>
              ) : salaires ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Statistiques */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600">Total mensuel</p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">
                        {formatCurrency(salaires.total_mensuel)}
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600">Total annuel</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">
                        {formatCurrency(salaires.total_annuel)}
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600">Nombre d'employés</p>
                      <p className="text-xl sm:text-2xl font-bold text-purple-600">
                        {salaires.nombre_employes}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Liste des employés */}
                  <div className="space-y-2 sm:space-y-3">
                    {salaires.employes.map((employe) => (
                      <div
                        key={employe.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3"
                      >
                        <div className="flex items-center justify-between sm:block">
                          <div>
                            <p className="font-medium text-sm sm:text-base">{employe.nom_complet}</p>
                            <span
                              className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${getRoleBadgeColor(
                                employe.role
                              )}`}
                            >
                              {getRoleLabel(employe.role)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <p className="text-base sm:text-lg font-semibold text-gray-700">
                            {formatCurrency(employe.salaire_mensuel || 0)}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openSalaireDialog(employe)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500">Aucune donnée disponible</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

          {/* TAB ARCHIVES */}
          <TabsContent value="archives" className="mt-4 sm:mt-6">
            <UtilisateursArchives />
          </TabsContent>
      </Tabs>

      {/* Dialog Utilisateur */}
      <Dialog open={userDialog} onOpenChange={setUserDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {editingUser ? 'Modifier' : 'Ajouter'} un utilisateur
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Prénom *</Label>
                <Input
                  value={userForm.prenom}
                  onChange={(e) => handleUserChange('prenom', e.target.value)}
                  placeholder="Prénom"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Nom *</Label>
                <Input
                  value={userForm.nom}
                  onChange={(e) => handleUserChange('nom', e.target.value)}
                  placeholder="Nom"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Téléphone *</Label>
              <Input
                value={userForm.telephone}
                onChange={(e) => handleUserChange('telephone', e.target.value)}
                placeholder="+226 70 00 00 00"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Email</Label>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) => handleUserChange('email', e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label className="text-sm">Mot de passe *</Label>
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
              <Label className="text-sm">Rôle *</Label>
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
              <Label className="text-sm">Spécialité</Label>
              <Input
                value={userForm.specialite}
                onChange={(e) => handleUserChange('specialite', e.target.value)}
                placeholder="Ex: Tresses, Dreadlocks..."
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setUserDialog(false)} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button onClick={handleUserSubmit} className="w-full sm:w-auto">
              {editingUser ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Réinitialisation Mot de passe */}
      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Réinitialiser le mot de passe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Nouveau mot de passe *</Label>
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
              <Label className="text-sm">Confirmer le mot de passe *</Label>
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
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setPasswordDialog(false)} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button onClick={handlePasswordReset} className="w-full sm:w-auto">Réinitialiser</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Salaire */}
      <Dialog open={salaireDialog} onOpenChange={setSalaireDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Modifier le salaire</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Salaire mensuel (FCFA) *</Label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={salaireForm.salaire_mensuel}
                onChange={(e) =>
                  setSalaireForm({ salaire_mensuel: Number(e.target.value) })
                }
                placeholder="Ex: 150000"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setSalaireDialog(false)} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button onClick={handleSalaireSubmit} className="w-full sm:w-auto">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}