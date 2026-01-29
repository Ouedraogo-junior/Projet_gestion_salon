// src/app/pages/Depenses/components/DepenseForm.tsx
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { DepenseFormData } from '@/types/depense';
import { useCreateDepense, useUpdateDepense } from '@/hooks/useDepenses';
import { Loader2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'detergent', label: 'Détergent' },
  { value: 'materiel', label: 'Matériel' },
  { value: 'fourniture', label: 'Fourniture' },
  { value: 'autre', label: 'Autre' },
];

interface DepenseFormProps {
  open: boolean;
  onClose: () => void;
  depense?: any;
}

export const DepenseForm = ({ open, onClose, depense }: DepenseFormProps) => {
  const { control, handleSubmit, formState: { errors }, reset } = useForm<DepenseFormData>({
    defaultValues: {
      libelle: '',
      montant: 0,
      description: '',
      categorie: '',
      date_depense: new Date().toISOString().split('T')[0],
    },
  });

  const createMutation = useCreateDepense();
  const updateMutation = useUpdateDepense();

  useEffect(() => {
    if (open) {
      if (depense) {
        reset({
          libelle: depense.libelle,
          montant: depense.montant,
          description: depense.description || '',
          categorie: depense.categorie,
          date_depense: depense.date_depense,
        });
      } else {
        reset({
          libelle: '',
          montant: 0,
          description: '',
          categorie: '',
          date_depense: new Date().toISOString().split('T')[0],
        });
      }
    }
  }, [open, depense, reset]);

  const onSubmit = (data: DepenseFormData) => {
    if (depense) {
      updateMutation.mutate({ id: depense.id, data }, {
        onSuccess: () => onClose(),
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{depense ? 'Modifier la dépense' : 'Nouvelle dépense'}</DialogTitle>
          <DialogDescription>
            {depense ? 'Modifiez les informations de la dépense ci-dessous.' : 'Remplissez le formulaire pour ajouter une nouvelle dépense.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="libelle">Libellé *</Label>
            <Controller
              name="libelle"
              control={control}
              rules={{ required: 'Le libellé est requis' }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="libelle"
                  placeholder="Ex: Achat détergent"
                />
              )}
            />
            {errors.libelle && <p className="text-sm text-red-500">{errors.libelle.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="montant">Montant (FCFA) *</Label>
            <Controller
              name="montant"
              control={control}
              rules={{ 
                required: 'Le montant est requis',
                min: { value: 0, message: 'Le montant doit être positif' }
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

          <div className="space-y-2">
            <Label htmlFor="categorie">Catégorie *</Label>
            <Controller
              name="categorie"
              control={control}
              rules={{ required: 'La catégorie est requise' }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categorie && <p className="text-sm text-red-500">{errors.categorie.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_depense">Date *</Label>
            <Controller
              name="date_depense"
              control={control}
              rules={{ required: 'La date est requise' }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="date_depense"
                  type="date"
                />
              )}
            />
            {errors.date_depense && <p className="text-sm text-red-500">{errors.date_depense.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="description"
                  placeholder="Détails supplémentaires..."
                  rows={3}
                />
              )}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? (
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