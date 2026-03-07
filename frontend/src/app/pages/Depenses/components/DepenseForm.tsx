// src/app/pages/Depenses/components/DepenseForm.tsx
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { Loader2, Plus, X, Check } from 'lucide-react';
import { DepenseFormData } from '@/types/depense';
import { categorieDepenseService } from '@/services/depenseService';
import { useCreateDepense, useUpdateDepense, useCategoriesDepenses, useCreateCategorieDepense } from '@/hooks/useDepenses';

interface DepenseFormProps {
  open: boolean;
  onClose: () => void;
  depense?: any;
}

export const DepenseForm = ({ open, onClose, depense }: DepenseFormProps) => {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading: loadingCategories } = useCategoriesDepenses();

  const [showNewCategorie, setShowNewCategorie] = useState(false);
  const [newCategorieNom, setNewCategorieNom] = useState('');

  const { control, handleSubmit, formState: { errors }, reset, setValue, trigger } = useForm<DepenseFormData>({
    defaultValues: {
      libelle: '',
      montant: 0,
      description: '',
      categorie_depense_id: 0,
      date_depense: new Date().toISOString().split('T')[0],
    },
  });

  const createMutation = useCreateDepense();
  const updateMutation = useUpdateDepense();
  const createCategorieMutation = useCreateCategorieDepense();

  useEffect(() => {
    if (open) {
      if (depense) {
        reset({
          libelle: depense.libelle,
          montant: depense.montant,
          description: depense.description || '',
          categorie_depense_id: depense.categorie_depense_id,
          date_depense: depense.date_depense,
        });
      } else {
        reset({
          libelle: '',
          montant: 0,
          description: '',
          categorie_depense_id: 0,
          date_depense: new Date().toISOString().split('T')[0],
        });
      }
      setShowNewCategorie(false);
      setNewCategorieNom('');
    }
  }, [open, depense, reset]);

  const handleCreateCategorie = async () => {
    const nom = newCategorieNom.trim();
    if (!nom) return;

    try {
      // 1. Créer directement via le service pour avoir la réponse immédiate
      const newCat = await categorieDepenseService.create({ nom });

      // 2. Mettre à jour le cache manuellement avec la nouvelle catégorie
      queryClient.setQueryData(
        ['categories-depenses'],
        (old: typeof categories) => [...(old ?? []), newCat]
      );

      // 3. Sélectionner et revalider
      setValue('categorie_depense_id', newCat.id, { shouldValidate: true });

      setShowNewCategorie(false);
      setNewCategorieNom('');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Erreur lors de la création';
      // toast est géré dans le hook mais ici on bypass — on le gère manuellement
      console.error(message);
    }
  };

  const handleCancelNewCategorie = () => {
    setShowNewCategorie(false);
    setNewCategorieNom('');
  };

  const onSubmit = (data: DepenseFormData) => {
    if (depense) {
      updateMutation.mutate({ id: depense.id, data }, { onSuccess: () => onClose() });
    } else {
      createMutation.mutate(data, { onSuccess: () => onClose() });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const selectedCategorie = categories.find(
    (cat) => cat.id === Number(control._formValues.categorie_depense_id)
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{depense ? 'Modifier la dépense' : 'Nouvelle dépense'}</DialogTitle>
          <DialogDescription>
            {depense
              ? 'Modifiez les informations de la dépense ci-dessous.'
              : 'Remplissez le formulaire pour ajouter une nouvelle dépense.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Libellé */}
          <div className="space-y-2">
            <Label htmlFor="libelle">Libellé *</Label>
            <Controller
              name="libelle"
              control={control}
              rules={{ required: 'Le libellé est requis' }}
              render={({ field }) => (
                <Input {...field} id="libelle" placeholder="Ex: Achat détergent" />
              )}
            />
            {errors.libelle && <p className="text-sm text-red-500">{errors.libelle.message}</p>}
          </div>

          {/* Montant */}
          <div className="space-y-2">
            <Label htmlFor="montant">Montant (FCFA) *</Label>
            <Controller
              name="montant"
              control={control}
              rules={{
                required: 'Le montant est requis',
                min: { value: 1, message: 'Le montant doit être positif' },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="montant"
                  type="number"
                  step="0.01"
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              )}
            />
            {errors.montant && <p className="text-sm text-red-500">{errors.montant.message}</p>}
          </div>

          {/* Catégorie */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Catégorie *</Label>
              {!showNewCategorie && (
                <button
                  type="button"
                  onClick={() => setShowNewCategorie(true)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  Nouvelle catégorie
                </button>
              )}
            </div>

            {/* Inline création */}
            {showNewCategorie && (
              <div className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary/5 px-3 py-2">
                <Input
                  autoFocus
                  value={newCategorieNom}
                  onChange={(e) => setNewCategorieNom(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleCreateCategorie(); }
                    if (e.key === 'Escape') handleCancelNewCategorie();
                  }}
                  placeholder="Nom de la catégorie"
                  className="h-8 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-green-600 hover:text-green-700"
                  disabled={!newCategorieNom.trim() || createCategorieMutation.isPending}
                  onClick={handleCreateCategorie}
                >
                  {createCategorieMutation.isPending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Check className="h-4 w-4" />
                  }
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-red-500"
                  onClick={handleCancelNewCategorie}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <Controller
              name="categorie_depense_id"
              control={control}
              rules={{
                required: 'La catégorie est requise',
                min: { value: 1, message: 'La catégorie est requise' },
              }}
              render={({ field }) => (
                <Select
                  value={field.value ? field.value.toString() : ''}
                  onValueChange={(val) => {
                    field.onChange(parseInt(val));
                    trigger('categorie_depense_id');
                  }}
                  disabled={loadingCategories || showNewCategorie}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCategories ? 'Chargement...' : 'Sélectionner une catégorie'} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categorie_depense_id && (
              <p className="text-sm text-red-500">{errors.categorie_depense_id.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date_depense">Date *</Label>
            <Controller
              name="date_depense"
              control={control}
              rules={{ required: 'La date est requise' }}
              render={({ field }) => (
                <Input {...field} id="date_depense" type="date" />
              )}
            />
            {errors.date_depense && <p className="text-sm text-red-500">{errors.date_depense.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea {...field} id="description" placeholder="Détails supplémentaires..." rows={3} />
              )}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {depense ? 'Modification...' : 'Ajout...'}
                </>
              ) : (
                depense ? 'Modifier' : 'Ajouter'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};