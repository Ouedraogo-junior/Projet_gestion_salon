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
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs sm:text-sm">En cours</Badge>;
      case 'terminee':
        return <Badge variant="outline" className="bg-green-50 text-green-700 text-xs sm:text-sm">Terminée</Badge>;
      case 'annulee':
        return <Badge variant="outline" className="bg-red-50 text-red-700 text-xs sm:text-sm">Annulée</Badge>;
      default:
        return <Badge variant="outline" className="text-xs sm:text-sm">{statut}</Badge>;
    }
  };

  const getDestinationBadge = (destination: string) => {
    const colors: any = {
      vente: 'bg-purple-50 text-purple-700',
      utilisation: 'bg-orange-50 text-orange-700',
      mixte: 'bg-indigo-50 text-indigo-700',
    };
    return <Badge variant="outline" className={`${colors[destination]} text-xs sm:text-sm`}>{destination}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] lg:w-[95vw] p-0 overflow-hidden">
        <DialogHeader className="px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-6 flex-shrink-0">
          <DialogTitle className="text-base sm:text-lg lg:text-xl">Détails de la confection</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-64 sm:h-96 items-center justify-center px-3 sm:px-4 lg:px-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : confection ? (
          <ScrollArea className="max-h-[calc(95vh-80px)] sm:max-h-[calc(95vh-100px)] px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              {/* En-tête */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{confection.nom_produit}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
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
              <div className="grid gap-4 sm:gap-5 lg:gap-6 lg:grid-cols-3">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium">Catégorie</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {confection.categorie?.nom || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium">Créé par</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {confection.user ? `${confection.user.prenom} ${confection.user.nom}` : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium">Date de confection</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {format(new Date(confection.date_confection), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-xs sm:text-sm font-medium">Quantité produite</p>
                    <p className="text-xl sm:text-2xl font-bold">{confection.quantite_produite}</p>
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm font-medium">Coût total</p>
                    <p className="text-xl sm:text-2xl font-bold text-primary">
                      {confection.cout_total.toLocaleString()} FCFA
                    </p>
                    <div className="mt-2 space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-muted-foreground">
                      <p>• Matières premières: {confection.cout_matiere_premiere.toLocaleString()} FCFA</p>
                      <p>• Main d'œuvre: {confection.cout_main_oeuvre.toLocaleString()} FCFA</p>
                    </div>
                  </div>

                  {confection.prix_vente_unitaire && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Prix de vente unitaire</p>
                      <p className="text-lg sm:text-xl font-bold text-green-600">
                        {confection.prix_vente_unitaire.toLocaleString()} FCFA
                      </p>
                      {confection.marge_unitaire !== undefined && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
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
                    <p className="text-xs sm:text-sm font-medium mb-2">Description</p>
                    <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">
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
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Produits utilisés</h3>
                    
                    {/* Version mobile (cards) */}
                    <div className="block sm:hidden space-y-2">
                      {confection.details.map((detail) => (
                        <div key={detail.id} className="rounded-lg border p-3 space-y-2 bg-white">
                          <div className="font-medium text-sm">{detail.produit?.nom || '-'}</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Quantité:</span>
                              <div className="font-medium">{detail.quantite_utilisee}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Prix unit.:</span>
                              <div className="font-medium">{detail.prix_unitaire.toLocaleString()} FCFA</div>
                            </div>
                          </div>
                          <div className="pt-2 border-t">
                            <span className="text-xs text-muted-foreground">Total:</span>
                            <div className="font-bold text-sm">{detail.prix_total.toLocaleString()} FCFA</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Version desktop (table) */}
                    <div className="hidden sm:block rounded-lg border overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs sm:text-sm">Produit</TableHead>
                              <TableHead className="text-right text-xs sm:text-sm">Quantité</TableHead>
                              <TableHead className="text-right text-xs sm:text-sm">Prix unitaire</TableHead>
                              <TableHead className="text-right text-xs sm:text-sm">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {confection.details.map((detail) => (
                              <TableRow key={detail.id}>
                                <TableCell className="font-medium text-xs sm:text-sm">
                                  {detail.produit?.nom || '-'}
                                </TableCell>
                                <TableCell className="text-right text-xs sm:text-sm">
                                  {detail.quantite_utilisee}
                                </TableCell>
                                <TableCell className="text-right text-xs sm:text-sm">
                                  {detail.prix_unitaire.toLocaleString()} FCFA
                                </TableCell>
                                <TableCell className="text-right font-medium text-xs sm:text-sm">
                                  {detail.prix_total.toLocaleString()} FCFA
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Attributs */}
              {confection.attributs && confection.attributs.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Attributs</h3>
                    <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {confection.attributs.map((attr) => (
                        <div key={attr.id} className="rounded-lg border p-2.5 sm:p-3 bg-white">
                          <p className="text-xs sm:text-sm font-medium truncate">{attr.attribut?.nom || '-'}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">{attr.valeur}</p>
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
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Mouvements de stock</h3>
                    
                    {/* Version mobile (cards) */}
                    <div className="block sm:hidden space-y-2">
                      {confection.mouvements.map((mouvement) => (
                        <div key={mouvement.id} className="rounded-lg border p-3 space-y-2 bg-white">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(mouvement.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {mouvement.type_mouvement}
                            </Badge>
                          </div>
                          <div className="text-sm font-medium">{mouvement.produit?.nom || '-'}</div>
                          <div className="text-xs text-muted-foreground">
                            Quantité: <span className="font-medium text-foreground">
                              {mouvement.type_mouvement === 'sortie' && '-'}{mouvement.quantite}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Version desktop (table) */}
                    <div className="hidden sm:block rounded-lg border overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs sm:text-sm">Date</TableHead>
                              <TableHead className="text-xs sm:text-sm">Type</TableHead>
                              <TableHead className="text-xs sm:text-sm">Produit</TableHead>
                              <TableHead className="text-right text-xs sm:text-sm">Quantité</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {confection.mouvements.map((mouvement) => (
                              <TableRow key={mouvement.id}>
                                <TableCell className="text-xs sm:text-sm">
                                  {format(new Date(mouvement.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">
                                    {mouvement.type_mouvement}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs sm:text-sm">{mouvement.produit?.nom || '-'}</TableCell>
                                <TableCell className="text-right text-xs sm:text-sm">
                                  {mouvement.type_mouvement === 'sortie' && '-'}
                                  {mouvement.quantite}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Dates de création/modification */}
              <Separator />
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                <p>Créé le {format(new Date(confection.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
                <p>Modifié le {format(new Date(confection.updated_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-64 sm:h-96 items-center justify-center px-3 sm:px-4 lg:px-6">
            <p className="text-xs sm:text-sm text-muted-foreground">Confection introuvable</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}