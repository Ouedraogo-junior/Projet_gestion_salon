// src/app/pages/Confections/components/ConfectionDetailDialog.tsx
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, Package, User, Calendar, DollarSign } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { useConfection } from '@/hooks/useConfections';

interface ConfectionDetailDialogProps {
  open: boolean;
  onClose: () => void;
  confectionId: number | null;
}

export default function ConfectionDetailDialog({
  open,
  onClose,
  confectionId,
}: ConfectionDetailDialogProps) {
  const { data: confection, isLoading } = useConfection(confectionId || 0);

  if (!confectionId) return null;

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'en_cours':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">En cours</Badge>;
      case 'terminee':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Terminée</Badge>;
      case 'annulee':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Annulée</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  const getDestinationBadge = (destination: string) => {
    const colors: any = {
      vente: 'bg-purple-50 text-purple-700',
      utilisation: 'bg-orange-50 text-orange-700',
      mixte: 'bg-indigo-50 text-indigo-700',
    };
    return <Badge variant="outline" className={colors[destination]}>{destination}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] w-[95vw]">
        <DialogHeader>
          <DialogTitle>Détails de la confection</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : confection ? (
          <ScrollArea className="max-h-[calc(95vh-100px)] pr-4">
            <div className="space-y-6">
              {/* En-tête */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{confection.nom_produit}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {confection.numero_confection}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getStatutBadge(confection.statut)}
                  {getDestinationBadge(confection.destination)}
                </div>
              </div>

              <Separator />

              {/* Informations générales */}
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Catégorie</p>
                      <p className="text-sm text-muted-foreground">
                        {confection.categorie?.nom || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Créé par</p>
                      <p className="text-sm text-muted-foreground">
                        {confection.user ? `${confection.user.prenom} ${confection.user.nom}` : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Date de confection</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(confection.date_confection), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Quantité produite</p>
                    <p className="text-2xl font-bold">{confection.quantite_produite}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Coût total</p>
                    <p className="text-2xl font-bold text-primary">
                      {confection.cout_total.toLocaleString()} FCFA
                    </p>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>• Matières premières: {confection.cout_matiere_premiere.toLocaleString()} FCFA</p>
                      <p>• Main d'œuvre: {confection.cout_main_oeuvre.toLocaleString()} FCFA</p>
                    </div>
                  </div>

                  {confection.prix_vente_unitaire && (
                    <div>
                      <p className="text-sm font-medium">Prix de vente unitaire</p>
                      <p className="text-xl font-bold text-green-600">
                        {confection.prix_vente_unitaire.toLocaleString()} FCFA
                      </p>
                      {confection.marge_unitaire !== undefined && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Marge: {confection.marge_unitaire.toLocaleString()} FCFA 
                          ({confection.taux_marge?.toFixed(1)}%)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {confection.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Description</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {confection.description}
                    </p>
                  </div>
                </>
              )}

              {/* Produits utilisés */}
              {confection.details && confection.details.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Produits utilisés</h3>
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produit</TableHead>
                            <TableHead className="text-right">Quantité</TableHead>
                            <TableHead className="text-right">Prix unitaire</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {confection.details.map((detail) => (
                            <TableRow key={detail.id}>
                              <TableCell className="font-medium">
                                {detail.produit?.nom || '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                {detail.quantite_utilisee}
                              </TableCell>
                              <TableCell className="text-right">
                                {detail.prix_unitaire.toLocaleString()} FCFA
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {detail.prix_total.toLocaleString()} FCFA
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}

              {/* Attributs */}
              {confection.attributs && confection.attributs.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Attributs</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {confection.attributs.map((attr) => (
                        <div key={attr.id} className="rounded-lg border p-3">
                          <p className="text-sm font-medium">{attr.attribut?.nom || '-'}</p>
                          <p className="text-sm text-muted-foreground mt-1">{attr.valeur}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Mouvements de stock */}
              {confection.mouvements && confection.mouvements.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Mouvements de stock</h3>
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Produit</TableHead>
                            <TableHead className="text-right">Quantité</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {confection.mouvements.map((mouvement) => (
                            <TableRow key={mouvement.id}>
                              <TableCell>
                                {format(new Date(mouvement.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {mouvement.type_mouvement}
                                </Badge>
                              </TableCell>
                              <TableCell>{mouvement.produit?.nom || '-'}</TableCell>
                              <TableCell className="text-right">
                                {mouvement.type_mouvement === 'sortie' && '-'}
                                {mouvement.quantite}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}

              {/* Dates de création/modification */}
              <Separator />
              <div className="flex justify-between text-sm text-muted-foreground">
                <p>Créé le {format(new Date(confection.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
                <p>Modifié le {format(new Date(confection.updated_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-96 items-center justify-center">
            <p className="text-muted-foreground">Confection introuvable</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}