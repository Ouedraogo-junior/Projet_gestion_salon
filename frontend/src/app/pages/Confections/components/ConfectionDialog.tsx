// src/app/pages/Confections/components/ConfectionDialog.tsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { useConfection, useConfectionActions } from '@/hooks/useConfections';
import { useCategories, useProduits, useAttributs } from '@/hooks/useProduitsModule';
import { tokenStorage } from '@/utils/tokenStorage';
import { CreateConfectionData, CreateConfectionDetailData, CreateConfectionAttributData } from '@/types/confection';
import { Separator } from '@/app/components/ui/separator';
import { ScrollArea } from '@/app/components/ui/scroll-area';

interface ConfectionDialogProps {
  open: boolean;
  onClose: () => void;
  confectionId?: number | null;
}

export default function ConfectionDialog({ open, onClose, confectionId }: ConfectionDialogProps) {
  const isEdit = !!confectionId;
  const { data: confection } = useConfection(confectionId || 0);
  const { create, update } = useConfectionActions();
  
  const { data: categories } = useCategories();
  const { data: produits, reload: reloadProduits } = useProduits();
  const { data: attributs } = useAttributs();

  const [selectedCategorie, setSelectedCategorie] = useState<number | null>(null);
  const [details, setDetails] = useState<CreateConfectionDetailData[]>([]);
  const [confectionAttributs, setConfectionAttributs] = useState<CreateConfectionAttributData[]>([]);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CreateConfectionData>({
    defaultValues: {
      date_confection: new Date().toISOString().split('T')[0],
      destination: 'vente',
      quantite_produite: 1,
    },
  });

  const destination = watch('destination');
  const user = tokenStorage.getUser();

  // Charger les données en mode édition
  useEffect(() => {
    if (isEdit && confection) {
      setValue('nom_produit', confection.nom_produit);
      setValue('quantite_produite', confection.quantite_produite);
      setValue('destination', confection.destination);
      setValue('description', confection.description || '');
      setValue('date_confection', confection.date_confection);
      setValue('cout_main_oeuvre', confection.cout_main_oeuvre);
      setValue('prix_vente_unitaire', confection.prix_vente_unitaire || undefined);
      setValue('categorie_id', confection.categorie_id);
      setSelectedCategorie(confection.categorie_id);
      
      // Charger les détails et attributs
      if (confection.details) {
        setDetails(confection.details.map(d => ({
          produit_id: d.produit_id,
          quantite_utilisee: d.quantite_utilisee,
          prix_unitaire: d.prix_unitaire
        })));
      }
      
      if (confection.attributs) {
        setConfectionAttributs(confection.attributs.map(a => ({
          attribut_id: a.attribut_id,
          valeur: a.valeur
        })));
      }
    }
  }, [confection, isEdit, setValue]);

  // Filtrer les produits par catégorie
  useEffect(() => {
    if (selectedCategorie) {
      reloadProduits({ categorie_id: selectedCategorie, type: 'matiere_premiere' });
    }
  }, [selectedCategorie]);

  // Réinitialiser lors de la fermeture
  const handleClose = () => {
    reset();
    setDetails([]);
    setConfectionAttributs([]);
    setSelectedCategorie(null);
    onClose();
  };

  // Ajouter un produit
  const handleAddDetail = () => {
    setDetails([...details, { produit_id: 0, quantite_utilisee: 1, prix_unitaire: 0 }]);
  };

  // Supprimer un produit
  const handleRemoveDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  // Mettre à jour un produit
  const handleUpdateDetail = (index: number, field: keyof CreateConfectionDetailData, value: any) => {
    const newDetails = [...details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    
    // Auto-remplir le prix si un produit est sélectionné
    if (field === 'produit_id') {
      const produit = produits.find((p: any) => p.id === Number(value));
      if (produit) {
        newDetails[index].prix_unitaire = produit.prix_achat || 0;
      }
    }
    
    setDetails(newDetails);
  };

  // Ajouter un attribut
  const handleAddAttribut = () => {
    setConfectionAttributs([...confectionAttributs, { attribut_id: 0, valeur: '' }]);
  };

  // Supprimer un attribut
  const handleRemoveAttribut = (index: number) => {
    setConfectionAttributs(confectionAttributs.filter((_, i) => i !== index));
  };

  // Mettre à jour un attribut
  const handleUpdateAttribut = (index: number, field: keyof CreateConfectionAttributData, value: any) => {
    const newAttributs = [...confectionAttributs];
    newAttributs[index] = { ...newAttributs[index], [field]: value };
    setConfectionAttributs(newAttributs);
  };

  // Calculer le coût total des matières premières
  const coutMatierePremiere = details.reduce(
    (total, detail) => total + (detail.quantite_utilisee * detail.prix_unitaire),
    0
  );

  // Soumettre le formulaire
  const onSubmit = (data: CreateConfectionData) => {
    // Validation
    if (!selectedCategorie) {
      alert('Veuillez sélectionner une catégorie');
      return;
    }

    if (details.length === 0) {
      alert('Veuillez ajouter au moins un produit');
      return;
    }

    const invalidDetails = details.filter(d => !d.produit_id || d.quantite_utilisee <= 0);
    if (invalidDetails.length > 0) {
      alert('Veuillez remplir correctement tous les produits');
      return;
    }

    if ((destination === 'vente' || destination === 'mixte') && !data.prix_vente_unitaire) {
      alert('Le prix de vente est obligatoire pour cette destination');
      return;
    }

    const payload: CreateConfectionData = {
      ...data,
      user_id: user?.id || 0,
      categorie_id: selectedCategorie,
      details: details,
      attributs: confectionAttributs.filter(a => a.attribut_id && a.valeur),
    };

    if (isEdit && confectionId) {
      const { details: _, attributs: __, user_id: ___, categorie_id: ____, ...updateData } = payload;
      update.mutate(
        { id: confectionId, data: updateData },
        {
          onSuccess: () => handleClose(),
        }
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => handleClose(),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] lg:w-full p-0 overflow-hidden">
        <DialogHeader className="px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-6 flex-shrink-0">
          <DialogTitle className="text-base sm:text-lg lg:text-xl">
            {isEdit ? 'Modifier la confection' : 'Nouvelle confection'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)] px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Informations générales */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-sm sm:text-base">Informations générales</h3>
              
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="nom_produit" className="text-xs sm:text-sm">Nom du produit *</Label>
                  <Input
                    id="nom_produit"
                    {...register('nom_produit', { required: 'Ce champ est requis' })}
                    placeholder="Ex: Crème capillaire maison"
                    className="text-xs sm:text-sm h-9 sm:h-10"
                  />
                  {errors.nom_produit && (
                    <p className="text-xs text-red-500">{errors.nom_produit.message}</p>
                  )}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="categorie_id" className="text-xs sm:text-sm">Catégorie *</Label>
                  <Select
                    value={selectedCategorie?.toString() || ''}
                    onValueChange={(value) => {
                      setSelectedCategorie(Number(value));
                      setValue('categorie_id', Number(value));
                    }}
                    disabled={isEdit}
                  >
                    <SelectTrigger className="text-xs sm:text-sm h-9 sm:h-10">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id.toString()} className="text-xs sm:text-sm">
                          {cat.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="quantite_produite" className="text-xs sm:text-sm">Quantité produite *</Label>
                  <Input
                    id="quantite_produite"
                    type="number"
                    min="1"
                    step="1"
                    {...register('quantite_produite', { 
                      required: 'Ce champ est requis',
                      min: { value: 1, message: 'Minimum 1' }
                    })}
                    className="text-xs sm:text-sm h-9 sm:h-10"
                  />
                  {errors.quantite_produite && (
                    <p className="text-xs text-red-500">{errors.quantite_produite.message}</p>
                  )}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="date_confection" className="text-xs sm:text-sm">Date de confection *</Label>
                  <Input
                    id="date_confection"
                    type="date"
                    {...register('date_confection', { required: 'Ce champ est requis' })}
                    className="text-xs sm:text-sm h-9 sm:h-10"
                  />
                  {errors.date_confection && (
                    <p className="text-xs text-red-500">{errors.date_confection.message}</p>
                  )}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="destination" className="text-xs sm:text-sm">Destination *</Label>
                  <Select
                    value={destination}
                    onValueChange={(value) => setValue('destination', value as any)}
                  >
                    <SelectTrigger className="text-xs sm:text-sm h-9 sm:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vente" className="text-xs sm:text-sm">Vente</SelectItem>
                      <SelectItem value="utilisation" className="text-xs sm:text-sm">Utilisation</SelectItem>
                      <SelectItem value="mixte" className="text-xs sm:text-sm">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="cout_main_oeuvre" className="text-xs sm:text-sm">Coût main d'œuvre</Label>
                  <Input
                    id="cout_main_oeuvre"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('cout_main_oeuvre')}
                    placeholder="0"
                    className="text-xs sm:text-sm h-9 sm:h-10"
                  />
                </div>

                {(destination === 'vente' || destination === 'mixte') && (
                  <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                    <Label htmlFor="prix_vente_unitaire" className="text-xs sm:text-sm">Prix de vente unitaire *</Label>
                    <Input
                      id="prix_vente_unitaire"
                      type="number"
                      min="0"
                      step="0.01"
                      {...register('prix_vente_unitaire', {
                        required: destination === 'vente' || destination === 'mixte' ? 'Ce champ est requis' : false
                      })}
                      placeholder="0"
                      className="text-xs sm:text-sm h-9 sm:h-10"
                    />
                    {errors.prix_vente_unitaire && (
                      <p className="text-xs text-red-500">{errors.prix_vente_unitaire.message}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="description" className="text-xs sm:text-sm">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Description du produit..."
                  rows={3}
                  className="text-xs sm:text-sm resize-none"
                />
              </div>
            </div>

            <Separator />

            {/* Liste des produits utilisés */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <h3 className="font-semibold text-sm sm:text-base">Produits utilisés *</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddDetail}
                  disabled={!selectedCategorie}
                  className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Plus className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Ajouter un produit
                </Button>
              </div>

              {details.length === 0 && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Aucun produit ajouté. Cliquez sur "Ajouter un produit" pour commencer.
                </p>
              )}

              <div className="space-y-3">
                {details.map((detail, index) => (
                  <div key={index} className="border rounded-lg p-2.5 sm:p-3 space-y-2.5 sm:space-y-3 bg-white">
                    {/* Sélection du produit - Toujours en pleine largeur */}
                    <div className="space-y-1.5">
                      <Label className="text-xs sm:text-sm font-medium">Produit</Label>
                      <Select
                        value={detail.produit_id.toString()}
                        onValueChange={(value) => handleUpdateDetail(index, 'produit_id', Number(value))}
                      >
                        <SelectTrigger className="text-xs sm:text-sm h-9 w-full">
                          <SelectValue placeholder="Sélectionner un produit" />
                        </SelectTrigger>
                        <SelectContent>
                          {produits.map((prod: any) => (
                            <SelectItem key={prod.id} value={prod.id.toString()} className="text-xs sm:text-sm">
                              {prod.nom} ({prod.quantite_stock} en stock)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quantité, Prix, Total en ligne sur desktop, colonne sur mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs sm:text-sm">Quantité</Label>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={detail.quantite_utilisee}
                          onChange={(e) => handleUpdateDetail(index, 'quantite_utilisee', Number(e.target.value))}
                          className="text-xs sm:text-sm h-9 w-full"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs sm:text-sm">Prix unit.</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={detail.prix_unitaire}
                          onChange={(e) => handleUpdateDetail(index, 'prix_unitaire', Number(e.target.value))}
                          className="text-xs sm:text-sm h-9 w-full"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs sm:text-sm">Total</Label>
                        <Input
                          value={(detail.quantite_utilisee * detail.prix_unitaire).toFixed(2)}
                          disabled
                          className="bg-muted text-xs sm:text-sm h-9 w-full"
                        />
                      </div>

                      <div className="space-y-1.5 sm:space-y-0 sm:flex sm:items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDetail(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto h-9 text-xs sm:text-sm"
                        >
                          <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-0" />
                          <span className="sm:hidden">Supprimer</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {details.length > 0 && (
                <div className="flex justify-end pt-2">
                  <div className="text-right space-y-0.5 sm:space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Coût matières premières</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">{coutMatierePremiere.toFixed(2)} FCFA</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Attributs */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <h3 className="font-semibold text-sm sm:text-base">Attributs (optionnel)</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAttribut}
                  className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Plus className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Ajouter un attribut
                </Button>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {confectionAttributs.map((attr, index) => (
                  <div key={index} className="border rounded-lg p-2.5 sm:p-3 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-[1fr_1fr_auto] sm:gap-2 sm:items-end bg-white">
                    <div className="space-y-1.5">
                      <Label className="text-xs sm:text-sm">Attribut</Label>
                      <Select
                        value={attr.attribut_id.toString()}
                        onValueChange={(value) => handleUpdateAttribut(index, 'attribut_id', Number(value))}
                      >
                        <SelectTrigger className="text-xs sm:text-sm h-9 w-full">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {attributs.map((at: any) => (
                            <SelectItem key={at.id} value={at.id.toString()} className="text-xs sm:text-sm">
                              {at.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs sm:text-sm">Valeur</Label>
                      <Input
                        value={attr.valeur}
                        onChange={(e) => handleUpdateAttribut(index, 'valeur', e.target.value)}
                        placeholder="Valeur de l'attribut"
                        className="text-xs sm:text-sm h-9 w-full"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttribut(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto h-9 text-xs sm:text-sm"
                    >
                      <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-0" />
                      <span className="sm:hidden">Supprimer</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose} 
                className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={create.isPending || update.isPending}
                className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
              >
                {create.isPending || update.isPending ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Créer la confection')}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}