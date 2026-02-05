// src/app/pages/Parametres/components/UtilisateursArchives.tsx

import { useState } from 'react';
import { RotateCcw, Trash2, UserX, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { useArchivedUsers } from '@/hooks/useArchivedUsers';
import type { User } from '@/services/userApi';

export function UtilisateursArchives() {
  const {
    inactiveUsers,
    deletedUsers,
    isLoading,
    restoreUser,
    permanentlyDeleteUser,
    activateUser,
  } = useArchivedUsers();

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'restore' | 'activate' | 'delete';
    user: User | null;
  }>({
    open: false,
    type: 'restore',
    user: null,
  });

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

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  const openConfirmDialog = (
    type: 'restore' | 'activate' | 'delete',
    user: User
  ) => {
    setConfirmDialog({ open: true, type, user });
  };

  const handleConfirm = () => {
    if (!confirmDialog.user) return;

    switch (confirmDialog.type) {
      case 'restore':
        restoreUser(confirmDialog.user.id, {
          onSuccess: () => setConfirmDialog({ open: false, type: 'restore', user: null }),
        });
        break;
      case 'activate':
        activateUser(confirmDialog.user.id, {
          onSuccess: () => setConfirmDialog({ open: false, type: 'activate', user: null }),
        });
        break;
      case 'delete':
        permanentlyDeleteUser(confirmDialog.user.id, {
          onSuccess: () => setConfirmDialog({ open: false, type: 'delete', user: null }),
        });
        break;
    }
  };

  const getConfirmDialogContent = () => {
    const user = confirmDialog.user;
    if (!user) return { title: '', description: '', action: '' };

    switch (confirmDialog.type) {
      case 'restore':
        return {
          title: 'Restaurer cet utilisateur ?',
          description: `Voulez-vous restaurer ${user.nom_complet} ? L'utilisateur sera réactivé et pourra à nouveau se connecter.`,
          action: 'Restaurer',
          variant: 'default' as const,
        };
      case 'activate':
        return {
          title: 'Activer cet utilisateur ?',
          description: `Voulez-vous activer ${user.nom_complet} ? L'utilisateur pourra se connecter à nouveau.`,
          action: 'Activer',
          variant: 'default' as const,
        };
      case 'delete':
        return {
          title: 'Supprimer définitivement ?',
          description: `Êtes-vous sûr de vouloir supprimer définitivement ${user.nom_complet} ? Cette action est irréversible et toutes les données associées seront perdues.`,
          action: 'Supprimer définitivement',
          variant: 'destructive' as const,
        };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-gray-500">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  const dialogContent = getConfirmDialogContent();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <UserX className="w-5 h-5" />
            Utilisateurs archivés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="inactive">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inactive" className="text-xs sm:text-sm">
                Désactivés ({inactiveUsers.length})
              </TabsTrigger>
              <TabsTrigger value="deleted" className="text-xs sm:text-sm">
                Supprimés ({deletedUsers.length})
              </TabsTrigger>
            </TabsList>

            {/* Utilisateurs désactivés */}
            <TabsContent value="inactive" className="mt-4">
              {inactiveUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">Aucun utilisateur désactivé</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inactiveUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3 bg-yellow-50 border-yellow-200"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {user.nom_complet}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">{user.telephone}</p>
                        {user.email && (
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        )}
                        {user.specialite && (
                          <p className="text-xs text-blue-600 mt-1">{user.specialite}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {getRoleLabel(user.role)}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                            Désactivé
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openConfirmDialog('activate', user)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                          title="Activer"
                        >
                          <RotateCcw className="w-3 h-3 sm:mr-2" />
                          <span className="hidden sm:inline">Activer</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Utilisateurs supprimés */}
            <TabsContent value="deleted" className="mt-4">
              {deletedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">Aucun utilisateur supprimé</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-orange-800">
                        <p className="font-medium">Attention</p>
                        <p className="text-xs mt-1">
                          Les utilisateurs supprimés peuvent être restaurés ou supprimés
                          définitivement. La suppression définitive est irréversible.
                        </p>
                      </div>
                    </div>
                  </div>

                  {deletedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3 bg-red-50 border-red-200"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {user.nom_complet}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">{user.telephone}</p>
                        {user.email && (
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        )}
                        {user.specialite && (
                          <p className="text-xs text-blue-600 mt-1">{user.specialite}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {getRoleLabel(user.role)}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                            Supprimé
                          </span>
                        </div>
                        {user.deleted_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            Supprimé le {formatDate(user.deleted_at)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openConfirmDialog('restore', user)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                          title="Restaurer"
                        >
                          <RotateCcw className="w-3 h-3 sm:mr-2" />
                          <span className="hidden sm:inline">Restaurer</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openConfirmDialog('delete', user)}
                          title="Supprimer définitivement"
                        >
                          <Trash2 className="w-3 h-3 sm:mr-2" />
                          <span className="hidden sm:inline">Supprimer</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog de confirmation */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ open, type: 'restore', user: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialogContent.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                dialogContent.variant === 'destructive'
                  ? 'bg-red-600 hover:bg-red-700'
                  : ''
              }
            >
              {dialogContent.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}