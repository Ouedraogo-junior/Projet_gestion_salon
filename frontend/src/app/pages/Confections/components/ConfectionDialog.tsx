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
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier la confection' : 'Nouvelle confection'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Informations générales */}
            <div className="space-y-4">
              <h3 className="font-semibold">Informations générales</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nom_produit">Nom du produit *</Label>
                  <Input
                    id="nom_produit"
                    {...register('nom_produit', { required: 'Ce champ est requis' })}
                    placeholder="Ex: Crème capillaire maison"
                  />
                  {errors.nom_produit && (
                    <p className="text-sm text-red-500">{errors.nom_produit.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categorie_id">Catégorie *</Label>
                  <Select
                    value={selectedCategorie?.toString() || ''}
                    onValueChange={(value) => {
                      setSelectedCategorie(Number(value));
                      setValue('categorie_id', Number(value));
                    }}
                    disabled={isEdit}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantite_produite">Quantité produite *</Label>
                  <Input
                    id="quantite_produite"
                    type="number"
                    min="1"
                    step="1"
                    {...register('quantite_produite', { 
                      required: 'Ce champ est requis',
                      min: { value: 1, message: 'Minimum 1' }
                    })}
                  />
                  {errors.quantite_produite && (
                    <p className="text-sm text-red-500">{errors.quantite_produite.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_confection">Date de confection *</Label>
                  <Input
                    id="date_confection"
                    type="date"
                    {...register('date_confection', { required: 'Ce champ est requis' })}
                  />
                  {errors.date_confection && (
                    <p className="text-sm text-red-500">{errors.date_confection.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destination *</Label>
                  <Select
                    value={destination}
                    onValueChange={(value) => setValue('destination', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vente">Vente</SelectItem>
                      <SelectItem value="utilisation">Utilisation</SelectItem>
                      <SelectItem value="mixte">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cout_main_oeuvre">Coût main d'œuvre</Label>
                  <Input
                    id="cout_main_oeuvre"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('cout_main_oeuvre')}
                    placeholder="0"
                  />
                </div>

                {(destination === 'vente' || destination === 'mixte') && (
                  <div className="space-y-2">
                    <Label htmlFor="prix_vente_unitaire">Prix de vente unitaire *</Label>
                    <Input
                      id="prix_vente_unitaire"
                      type="number"
                      min="0"
                      step="0.01"
                      {...register('prix_vente_unitaire', {
                        required: destination === 'vente' || destination === 'mixte' ? 'Ce champ est requis' : false
                      })}
                      placeholder="0"
                    />
                    {errors.prix_vente_unitaire && (
                      <p className="text-sm text-red-500">{errors.prix_vente_unitaire.message}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Description du produit..."
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Liste des produits utilisés */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Produits utilisés *</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddDetail}
                  disabled={!selectedCategorie}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un produit
                </Button>
              </div>

              {details.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Aucun produit ajouté. Cliquez sur "Ajouter un produit" pour commencer.
                </p>
              )}

              <div className="space-y-3">
                {details.map((detail, index) => (
                  <div key={index} className="flex gap-3 items-end border rounded-lg p-3">
                    <div className="flex-1 space-y-2">
                      <Label>Produit</Label>
                      <Select
                        value={detail.produit_id.toString()}
                        onValueChange={(value) => handleUpdateDetail(index, 'produit_id', Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {produits.map((prod: any) => (
                            <SelectItem key={prod.id} value={prod.id.toString()}>
                              {prod.nom} ({prod.quantite_stock} en stock)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-28 space-y-2">
                      <Label>Quantité</Label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={detail.quantite_utilisee}
                        onChange={(e) => handleUpdateDetail(index, 'quantite_utilisee', Number(e.target.value))}
                      />
                    </div>

                    <div className="w-32 space-y-2">
                      <Label>Prix unitaire</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={detail.prix_unitaire}
                        onChange={(e) => handleUpdateDetail(index, 'prix_unitaire', Number(e.target.value))}
                      />
                    </div>

                    <div className="w-32 space-y-2">
                      <Label>Total</Label>
                      <Input
                        value={(detail.quantite_utilisee * detail.prix_unitaire).toFixed(2)}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveDetail(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {details.length > 0 && (
                <div className="flex justify-end">
                  <div className="text-right space-y-1">
                    <p className="text-sm text-muted-foreground">Coût matières premières</p>
                    <p className="text-2xl font-bold">{coutMatierePremiere.toFixed(2)} FCFA</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Attributs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Attributs (optionnel)</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAttribut}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un attribut
                </Button>
              </div>

              <div className="space-y-3">
                {confectionAttributs.map((attr, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Attribut</Label>
                      <Select
                        value={attr.attribut_id.toString()}
                        onValueChange={(value) => handleUpdateAttribut(index, 'attribut_id', Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {attributs.map((at: any) => (
                            <SelectItem key={at.id} value={at.id.toString()}>
                              {at.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 space-y-2">
                      <Label>Valeur</Label>
                      <Input
                        value={attr.valeur}
                        onChange={(e) => handleUpdateAttribut(index, 'valeur', e.target.value)}
                        placeholder="Valeur de l'attribut"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAttribut(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={create.isPending || update.isPending}
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