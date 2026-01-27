import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Minus, RotateCcw } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Badge } from '@/app/components/ui/badge';
import { useAjusterStock } from '@/hooks/useProduits';
import type { Produit } from '@/types/produit.types';

interface QuickStockModalProps {
  produit: Produit | null;
  typeStock: 'vente' | 'utilisation';
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  type_ajustement: 'ajouter' | 'retirer' | 'definir';
  quantite: number;
  motif: string;
}

export function QuickStockModal({
  produit,
  typeStock,
  isOpen,
  onClose
}: QuickStockModalProps) {
  const { mutate: ajusterStock, isPending } = useAjusterStock();
  const [previewStock, setPreviewStock] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      type_ajustement: 'ajouter',
      quantite: 0,
      motif: ''
    }
  });

  const typeAjustement = watch('type_ajustement');
  const quantite = watch('quantite');

  useEffect(() => {
    if (!produit) return;

    const stockActuel = typeStock === 'vente' 
      ? produit.stock_vente 
      : produit.stock_utilisation;

    let nouveauStock = stockActuel;

    if (typeAjustement === 'ajouter') {
      nouveauStock = stockActuel + (quantite || 0);
    } else if (typeAjustement === 'retirer') {
      nouveauStock = Math.max(0, stockActuel - (quantite || 0));
    } else if (typeAjustement === 'definir') {
      nouveauStock = quantite || 0;
    }

    setPreviewStock(nouveauStock);
  }, [produit, typeStock, typeAjustement, quantite]);

  const onSubmit = (data: FormData) => {
    if (!produit) return;

    let nouveauStock = 0;
    const stockActuel = typeStock === 'vente' 
      ? produit.stock_vente 
      : produit.stock_utilisation;

    if (data.type_ajustement === 'ajouter') {
      nouveauStock = stockActuel + data.quantite;
    } else if (data.type_ajustement === 'retirer') {
      nouveauStock = Math.max(0, stockActuel - data.quantite);
    } else {
      nouveauStock = data.quantite;
    }

    ajusterStock({
      produit_id: produit.id,
      type_stock: typeStock,
      nouveau_stock: nouveauStock,
      motif: data.motif || `Ajustement ${data.type_ajustement === 'ajouter' ? '+' : data.type_ajustement === 'retirer' ? '-' : '='} ${data.quantite}`
    }, {
      onSuccess: () => {
        reset();
        onClose();
      }
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  if (!produit) return null;

  const stockActuel = typeStock === 'vente' 
    ? produit.stock_vente 
    : produit.stock_utilisation;

  const seuilAlerte = typeStock === 'vente'
    ? produit.seuil_alerte
    : produit.seuil_alerte_utilisation;

  const seuilCritique = typeStock === 'vente'
    ? produit.seuil_critique
    : produit.seuil_critique_utilisation;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajuster le stock</DialogTitle>
          <DialogDescription>
            {produit.nom} - Stock {typeStock}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stock actuel */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Stock actuel</span>
              <span className="text-2xl font-bold text-blue-600">
                {stockActuel} unités
              </span>
            </div>
            {stockActuel <= seuilCritique && (
              <Badge variant="destructive" className="mt-2">
                Stock critique
              </Badge>
            )}
            {stockActuel <= seuilAlerte && stockActuel > seuilCritique && (
              <Badge variant="secondary" className="mt-2 bg-orange-100 text-orange-700">
                Stock en alerte
              </Badge>
            )}
          </div>

          {/* Type d'ajustement */}
          <div className="space-y-3">
            <Label>Type d'ajustement</Label>
            <RadioGroup
              value={typeAjustement}
              onValueChange={(value) => setValue('type_ajustement', value as any)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ajouter" id="ajouter" />
                <Label htmlFor="ajouter" className="flex items-center gap-2 cursor-pointer">
                  <Plus className="w-4 h-4 text-green-600" />
                  Ajouter du stock
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="retirer" id="retirer" />
                <Label htmlFor="retirer" className="flex items-center gap-2 cursor-pointer">
                  <Minus className="w-4 h-4 text-red-600" />
                  Retirer du stock
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="definir" id="definir" />
                <Label htmlFor="definir" className="flex items-center gap-2 cursor-pointer">
                  <RotateCcw className="w-4 h-4 text-blue-600" />
                  Définir le stock exact
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Quantité */}
          <div className="space-y-2">
            <Label htmlFor="quantite">
              {typeAjustement === 'definir' ? 'Nouveau stock' : 'Quantité'}
            </Label>
            <Input
              id="quantite"
              type="number"
              min="0"
              {...register('quantite', { 
                required: 'Ce champ est requis',
                min: { value: 0, message: 'La quantité doit être positive' },
                valueAsNumber: true
              })}
              placeholder={typeAjustement === 'definir' ? 'Ex: 50' : 'Ex: 10'}
            />
            {errors.quantite && (
              <p className="text-sm text-red-600">{errors.quantite.message}</p>
            )}
          </div>

          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Nouveau stock</span>
              <span className={`text-2xl font-bold ${
                previewStock <= seuilCritique ? 'text-red-600' :
                previewStock <= seuilAlerte ? 'text-orange-600' :
                'text-green-600'
              }`}>
                {previewStock} unités
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Variation: {previewStock > stockActuel ? '+' : ''}{previewStock - stockActuel}
            </div>
          </div>

          {/* Motif */}
          <div className="space-y-2">
            <Label htmlFor="motif">Motif (optionnel)</Label>
            <Textarea
              id="motif"
              {...register('motif')}
              placeholder="Ex: Réception fournisseur, inventaire, correction..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleFormSubmit} disabled={isPending}>
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}