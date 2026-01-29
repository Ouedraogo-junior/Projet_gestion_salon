// src/app/pages/Confections/components/ConfectionTable.tsx
import { Eye, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
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
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des confections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center text-red-500">
          <XCircle className="mx-auto mb-2 h-8 w-8" />
          <p>Erreur lors du chargement des données</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Aucune confection trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
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

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette confection ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Terminer Dialog */}
      <AlertDialog open={!!terminerId} onOpenChange={() => setTerminerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terminer la confection</AlertDialogTitle>
            <AlertDialogDescription>
              Confirmer que la confection est terminée ? Un nouveau produit sera créé dans le stock.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleTerminer} className="bg-green-600 hover:bg-green-700">
              Terminer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Annuler Dialog */}
      <AlertDialog open={!!annulerId} onOpenChange={() => setAnnulerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler la confection</AlertDialogTitle>
            <AlertDialogDescription>
              Confirmer l'annulation de cette confection ? Les stocks utilisés ne seront pas restaurés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction onClick={handleAnnuler} className="bg-orange-600 hover:bg-orange-700">
              Annuler la confection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}