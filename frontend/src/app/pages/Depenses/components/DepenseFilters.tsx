// src/app/pages/Depenses/components/DepenseFilters.tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { CategorieDepense } from '@/types/depense';

interface DepenseFiltersProps {
  mois: number;
  annee: number;
  categorieId?: number;
  categories: CategorieDepense[];
  onMoisChange: (mois: number) => void;
  onAnneeChange: (annee: number) => void;
  onCategorieChange: (id: number | undefined) => void;
}

const MOIS = [
  { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' }, { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' }, { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' },
];

export const DepenseFilters = ({
  mois, annee, categorieId, categories,
  onMoisChange, onAnneeChange, onCategorieChange,
}: DepenseFiltersProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label>Mois</Label>
        <Select value={mois.toString()} onValueChange={(v) => onMoisChange(Number(v))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {MOIS.map((m) => (
              <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Année</Label>
        <Select value={annee.toString()} onValueChange={(v) => onAnneeChange(Number(v))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Catégorie</Label>
        <Select
          value={categorieId?.toString() ?? 'tous'}
          onValueChange={(v) => onCategorieChange(v === 'tous' ? undefined : Number(v))}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Toutes</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.icone && <span className="mr-1">{c.icone}</span>}
                {c.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};