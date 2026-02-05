// src/app/pages/Confections/components/ConfectionTable.tsx
import { Eye, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
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
import { Confection } from '@/types/confection';
import { useConfectionActions } from '@/hooks/useConfections';
import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ConfectionTableProps {
  data: Confection[];
  isLoading: boolean;
  error: any;
  onViewDetail: (id: number) => void;
  onEdit: (id: number) => void;
}

export default function ConfectionTable({
  data,
  isLoading,
  error,
  onViewDetail,
  onEdit,
}: ConfectionTableProps) {
  const { delete: deleteAction, terminer, annuler } = useConfectionActions();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [terminerId, setTerminerId] = useState<number | null>(null);
  const [annulerId, setAnnulerId] = useState<number | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      deleteAction.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleTerminer = () => {
    if (terminerId) {
      terminer.mutate(terminerId);
      setTerminerId(null);
    }
  };

  const handleAnnuler = () => {
    if (annulerId) {
      annuler.mutate({ id: annulerId });
      setAnnulerId(null);
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'en_cours':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 w-fit"><Clock className="h-3 w-3" />En cours</Badge>;
      case 'terminee':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3" />Terminée</Badge>;
      case 'annulee':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1 w-fit"><XCircle className="h-3 w-3" />Annulée</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  const getDestinationBadge = (destination: string) => {
    const config: any = {
      vente: { color: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Vente' },
      utilisation: { color: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Utilisation' },
      mixte: { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Mixte' },
    };
    const cfg = config[destination] || { color: '', label: destination };
    return <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex h-64 sm:h-96 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-muted-foreground">Chargement des confections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 sm:h-96 items-center justify-center">
        <div className="text-center text-red-500">
          <XCircle className="mx-auto mb-2 h-8 w-8" />
          <p className="text-sm sm:text-base">Erreur lors du chargement des données</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 sm:h-96 items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-sm sm:text-base">Aucune confection trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Vue Mobile - Cards */}
      <div className="lg:hidden max-h-[calc(100vh-28rem)] sm:max-h-[calc(100vh-26rem)] overflow-auto p-3 sm:p-4 space-y-3">
        {data.map((confection) => (
          <Card key={confection.id} className="overflow-hidden">
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{confection.nom_produit}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{confection.numero_confection}</p>
                  </div>
                  {getStatutBadge(confection.statut)}
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Catégorie</p>
                    <p className="font-medium truncate">{confection.categorie?.nom || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Quantité</p>
                    <p className="font-semibold">{confection.quantite_produite}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Destination</p>
                    <div className="mt-1">{getDestinationBadge(confection.destination)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Coût total</p>
                    <p className="font-semibold text-xs">{confection.cout_total.toLocaleString()} FCFA</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{format(new Date(confection.date_confection), 'dd/MM/yy', { locale: fr })}</span>
                    {confection.user && (
                      <span className="truncate ml-2">{confection.user.prenom} {confection.user.nom}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() => onViewDetail(confection.id)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Voir
                    </Button>
                    
                    {confection.statut === 'en_cours' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onEdit(confection.id)}
                          title="Modifier"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700 h-8 w-8 p-0"
                          onClick={() => setTerminerId(confection.id)}
                          title="Terminer"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 hover:text-orange-700 h-8 w-8 p-0"
                          onClick={() => setAnnulerId(confection.id)}
                          title="Annuler"
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                      onClick={() => setDeleteId(confection.id)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vue Desktop - Tableau */}
      <div className="hidden lg:block max-h-[calc(100vh-24rem)] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
            <TableRow>
              <TableHead className="w-32">Numéro</TableHead>
              <TableHead className="min-w-[200px]">Produit</TableHead>
              <TableHead className="w-36">Catégorie</TableHead>
              <TableHead className="w-24 text-center">Qté</TableHead>
              <TableHead className="w-32">Destination</TableHead>
              <TableHead className="w-36 text-right">Coût total</TableHead>
              <TableHead className="w-32">Date</TableHead>
              <TableHead className="w-32">Statut</TableHead>
              <TableHead className="w-40 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((confection) => (
              <TableRow key={confection.id} className="hover:bg-muted/50">
                <TableCell className="font-mono text-xs">{confection.numero_confection}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm">{confection.nom_produit}</span>
                    {confection.user && (
                      <span className="text-xs text-muted-foreground">
                        {confection.user.prenom} {confection.user.nom}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{confection.categorie?.nom || '-'}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-semibold">{confection.quantite_produite}</span>
                </TableCell>
                <TableCell>{getDestinationBadge(confection.destination)}</TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold text-sm">{confection.cout_total.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground ml-1">FCFA</span>
                </TableCell>
                <TableCell className="text-sm">
                  {format(new Date(confection.date_confection), 'dd MMM yyyy', { locale: fr })}
                </TableCell>
                <TableCell>{getStatutBadge(confection.statut)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onViewDetail(confection.id)}
                      title="Voir détails"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {confection.statut === 'en_cours' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(confection.id)}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => setTerminerId(confection.id)}
                          title="Terminer"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          onClick={() => setAnnulerId(confection.id)}
                          title="Annuler"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteId(confection.id)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="max-w-md w-[90vw]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Êtes-vous sûr de vouloir supprimer cette confection ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="m-0 w-full sm:w-auto">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 m-0 w-full sm:w-auto">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Terminer Dialog */}
      <AlertDialog open={!!terminerId} onOpenChange={() => setTerminerId(null)}>
        <AlertDialogContent className="max-w-md w-[90vw]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Terminer la confection</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Confirmer que la confection est terminée ? Un nouveau produit sera créé dans le stock.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="m-0 w-full sm:w-auto">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleTerminer} className="bg-green-600 hover:bg-green-700 m-0 w-full sm:w-auto">
              Terminer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Annuler Dialog */}
      <AlertDialog open={!!annulerId} onOpenChange={() => setAnnulerId(null)}>
        <AlertDialogContent className="max-w-md w-[90vw]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Annuler la confection</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Confirmer l'annulation de cette confection ? Les stocks utilisés ne seront pas restaurés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="m-0 w-full sm:w-auto">Retour</AlertDialogCancel>
            <AlertDialogAction onClick={handleAnnuler} className="bg-orange-600 hover:bg-orange-700 m-0 w-full sm:w-auto">
              Annuler la confection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}