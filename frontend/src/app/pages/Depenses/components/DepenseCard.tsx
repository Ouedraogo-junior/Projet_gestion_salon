// src/app/pages/Depenses/components/DepenseCard.tsx
import { Card, CardContent, CardFooter } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { Badge } from '@/app/components/ui/badge';
import { MoreVertical, Edit, Trash2, Calendar, User } from 'lucide-react';
import { Depense } from '@/types/depense';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog';
import { useState } from 'react';

interface DepenseCardProps {
  depense: Depense;
  onEdit: (depense: Depense) => void;
  onDelete: (id: number) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  detergent: 'bg-blue-100 text-blue-800',
  materiel: 'bg-green-100 text-green-800',
  fourniture: 'bg-purple-100 text-purple-800',
  autre: 'bg-gray-100 text-gray-800',
};

export const DepenseCard = ({ depense, onEdit, onDelete }: DepenseCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{depense.libelle}</h3>
              <p className="text-2xl font-bold text-primary mt-1">
                {depense.montant.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(depense)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Badge className={CATEGORY_COLORS[depense.categorie] || CATEGORY_COLORS.autre}>
            {depense.categorie}
          </Badge>

          {depense.description && (
            <p className="text-sm text-muted-foreground mt-3">{depense.description}</p>
          )}
        </CardContent>

        <CardFooter className="text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-4 w-full">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(depense.date_depense), 'dd MMM yyyy', { locale: fr })}
            </div>
            {depense.user && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {depense.user.name}
              </div>
            )}
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment supprimer cette dépense ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(depense.id)} className="bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};