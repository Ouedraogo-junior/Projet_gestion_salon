import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { useCreateProduit, useUpdateProduit } from '@/hooks/useProduits';
import type { Produit, Categorie, CreateProduitRequest, UpdateProduitRequest } from '@/types/produit.types';

interface ProduitModalProps {
  produit: Produit | null;
  isOpen: boolean;
  onClose: () => void;
  categories: Categorie[];
}

type FormData = CreateProduitRequest;

export function ProduitModal({
  produit,
  isOpen,
  onClose,
  categories
}: ProduitModalProps) {
  const { mutate: createProduit, isPending: isCreating } = useCreateProduit();
  const { mutate: updateProduit, isPending: isUpdating } = useUpdateProduit();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      nom: '',
      reference: '',
      description: '',
      categorie_id: 0,
      marque: '',
      fournisseur: '',
      prix_achat: 0,
      prix_vente: 0,
      type_stock_principal: 'vente',
      stock_vente: 0,
      stock_utilisation: 0,
      seuil_alerte: 10,
      seuil_critique: 5,
      seuil_alerte_utilisation: 10,
      seuil_critique_utilisation: 5,
      is_active: true
    }
  });

  const prixAchat = watch('prix_achat');
  const prixVente = watch('prix_vente');
  const typeStock = watch('type_stock_principal');

  useEffect(() => {
    if (produit) {
      reset({
        nom: produit.nom,
        reference: produit.reference,
        description: produit.description || '',
        categorie_id: produit.categorie_id,
        marque: produit.marque || '',
        fournisseur: produit.fournisseur || '',
        prix_achat: produit.prix_achat,
        prix_vente: produit.prix_vente,
        prix_promo: produit.prix_promo,
        date_debut_promo: produit.date_debut_promo,
        date_fin_promo: produit.date_fin_promo,
        type_stock_principal: produit.type_stock_principal,
        stock_vente: produit.stock_vente,
        stock_utilisation: produit.stock_utilisation,
        seuil_alerte: produit.seuil_alerte,
        seuil_critique: produit.seuil_critique,
        seuil_alerte_utilisation: produit.seuil_alerte_utilisation,
        seuil_critique_utilisation: produit.seuil_critique_utilisation,
        quantite_min_commande: produit.quantite_min_commande,
        delai_livraison_jours: produit.delai_livraison_jours,
        is_active: produit.is_active
      });
    } else {
      reset({
        nom: '',
        reference: '',
        description: '',
        categorie_id: 0,
        marque: '',
        fournisseur: '',
        prix_achat: 0,
        prix_vente: 0,
        type_stock_principal: 'vente',
        stock_vente: 0,
        stock_utilisation: 0,
        seuil_alerte: 10,
        seuil_critique: 5,
        seuil_alerte_utilisation: 10,
        seuil_critique_utilisation: 5,
        is_active: true
      });
    }
  }, [produit, reset]);

  const calculerMarge = () => {
    if (prixVente > 0 && prixAchat > 0) {
      const marge = ((prixVente - prixAchat) / prixVente) * 100;
      return marge.toFixed(1);
    }
    return '0.0';
  };

  const onSubmit = (data: FormData) => {
    if (produit) {
      updateProduit({ 
        id: produit.id, 
        data: data as UpdateProduitRequest 
      }, {
        onSuccess: () => {
          onClose();
          reset();
        }
      });
    } else {
      createProduit(data, {
        onSuccess: () => {
          onClose();
          reset();
        }
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {produit ? 'Modifier le produit' : 'Nouveau produit'}
          </DialogTitle>
          <DialogDescription>
            {produit ? `Modification de ${produit.nom}` : 'Créer un nouveau produit'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="prix">Prix</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du produit *</Label>
              <Input
                id="nom"
                {...register('nom', { required: 'Le nom est requis' })}
                placeholder="Ex: Shampoing Kerastase"
              />
              {errors.nom && (
                <p className="text-sm text-red-600">{errors.nom.message}</p>
              )}
            </div>

            {/* Référence */}
            <div className="space-y-2">
              <Label htmlFor="reference">Référence</Label>
              <Input
                id="reference"
                {...register('reference')}
                placeholder="Ex: SHAM-KER-001"
              />
            </div>

            {/* Catégorie */}
            <div className="space-y-2">
              <Label htmlFor="categorie">Catégorie *</Label>
              <Select
                value={watch('categorie_id')?.toString() || ''}
                onValueChange={(value) => setValue('categorie_id', parseInt(value))}
              >
                <SelectTrigger id="categorie">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categorie_id && (
                <p className="text-sm text-red-600">La catégorie est requise</p>
              )}
            </div>

            {/* Marque */}
            <div className="space-y-2">
              <Label htmlFor="marque">Marque</Label>
              <Input
                id="marque"
                {...register('marque')}
                placeholder="Ex: Kerastase, L'Oréal..."
              />
            </div>

            {/* Fournisseur */}
            <div className="space-y-2">
              <Label htmlFor="fournisseur">Fournisseur</Label>
              <Input
                id="fournisseur"
                {...register('fournisseur')}
                placeholder="Ex: Coiffure Diffusion"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Description du produit..."
                rows={3}
              />
            </div>

            {/* Actif */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="is_active" className="cursor-pointer">
                Produit actif
              </Label>
              <Switch
                id="is_active"
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
            </div>
          </TabsContent>

          <TabsContent value="prix" className="space-y-4 mt-4">
            {/* Prix d'achat */}
            <div className="space-y-2">
              <Label htmlFor="prix_achat">Prix d'achat (FCFA) *</Label>
              <Input
                id="prix_achat"
                type="number"
                min="0"
                step="0.01"
                {...register('prix_achat', { 
                  required: 'Le prix d\'achat est requis',
                  valueAsNumber: true
                })}
                placeholder="Ex: 5000"
              />
              {errors.prix_achat && (
                <p className="text-sm text-red-600">{errors.prix_achat.message}</p>
              )}
            </div>

            {/* Prix de vente */}
            <div className="space-y-2">
              <Label htmlFor="prix_vente">Prix de vente (FCFA) *</Label>
              <Input
                id="prix_vente"
                type="number"
                min="0"
                step="0.01"
                {...register('prix_vente', { 
                  required: 'Le prix de vente est requis',
                  valueAsNumber: true
                })}
                placeholder="Ex: 8000"
              />
              {errors.prix_vente && (
                <p className="text-sm text-red-600">{errors.prix_vente.message}</p>
              )}
            </div>

            {/* Marge */}
            {prixAchat > 0 && prixVente > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Marge</span>
                  <span className="text-lg font-bold text-blue-600">
                    {calculerMarge()}%
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Bénéfice: {(prixVente - prixAchat).toLocaleString()} FCFA
                </div>
              </div>
            )}

            {/* Prix promo */}
            <div className="space-y-2">
              <Label htmlFor="prix_promo">Prix promotionnel (FCFA)</Label>
              <Input
                id="prix_promo"
                type="number"
                min="0"
                step="0.01"
                {...register('prix_promo', { valueAsNumber: true })}
                placeholder="Ex: 6500"
              />
            </div>

            {/* Dates promo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_debut_promo">Début promo</Label>
                <Input
                  id="date_debut_promo"
                  type="date"
                  {...register('date_debut_promo')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_fin_promo">Fin promo</Label>
                <Input
                  id="date_fin_promo"
                  type="date"
                  {...register('date_fin_promo')}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stock" className="space-y-4 mt-4">
            {/* Type de stock */}
            <div className="space-y-2">
              <Label htmlFor="type_stock">Type de stock principal *</Label>
              <Select
                value={watch('type_stock_principal') || 'vente'}
                onValueChange={(value) => setValue('type_stock_principal', value as any)}
              >
                <SelectTrigger id="type_stock">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vente">Vente uniquement</SelectItem>
                  <SelectItem value="utilisation">Utilisation uniquement</SelectItem>
                  <SelectItem value="mixte">Mixte (vente + utilisation)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stock vente */}
            {(typeStock === 'vente' || typeStock === 'mixte') && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">Stock de vente</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock_vente">Stock initial</Label>
                    <Input
                      id="stock_vente"
                      type="number"
                      min="0"
                      {...register('stock_vente', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seuil_alerte">Seuil alerte</Label>
                    <Input
                      id="seuil_alerte"
                      type="number"
                      min="0"
                      {...register('seuil_alerte', { valueAsNumber: true })}
                      placeholder="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seuil_critique">Seuil critique</Label>
                    <Input
                      id="seuil_critique"
                      type="number"
                      min="0"
                      {...register('seuil_critique', { valueAsNumber: true })}
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stock utilisation */}
            {(typeStock === 'utilisation' || typeStock === 'mixte') && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900">Stock d'utilisation</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock_utilisation">Stock initial</Label>
                    <Input
                      id="stock_utilisation"
                      type="number"
                      min="0"
                      {...register('stock_utilisation', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seuil_alerte_utilisation">Seuil alerte</Label>
                    <Input
                      id="seuil_alerte_utilisation"
                      type="number"
                      min="0"
                      {...register('seuil_alerte_utilisation', { valueAsNumber: true })}
                      placeholder="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seuil_critique_utilisation">Seuil critique</Label>
                    <Input
                      id="seuil_critique_utilisation"
                      type="number"
                      min="0"
                      {...register('seuil_critique_utilisation', { valueAsNumber: true })}
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Commande */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantite_min_commande">Qté min commande</Label>
                <Input
                  id="quantite_min_commande"
                  type="number"
                  min="0"
                  {...register('quantite_min_commande', { valueAsNumber: true })}
                  placeholder="Ex: 6"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delai_livraison_jours">Délai livraison (jours)</Label>
                <Input
                  id="delai_livraison_jours"
                  type="number"
                  min="0"
                  {...register('delai_livraison_jours', { valueAsNumber: true })}
                  placeholder="Ex: 7"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleFormSubmit} disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : produit ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}