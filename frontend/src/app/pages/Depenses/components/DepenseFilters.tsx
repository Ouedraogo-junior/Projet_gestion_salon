// src/app/pages/Depenses/components/DepenseFilters.tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';

interface DepenseFiltersProps {
  mois: number;
  annee: number;
  categorie: string;
  onMoisChange: (mois: number) => void;
  onAnneeChange: (annee: number) => void;
  onCategorieChange: (categorie: string) => void;
}

const MOIS = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' },
];

const CATEGORIES = [
  { value: 'tous', label: 'Toutes' }, // Changé de '' à 'tous'
  { value: 'detergent', label: 'Détergent' },
  { value: 'materiel', label: 'Matériel' },
  { value: 'fourniture', label: 'Fourniture' },
  { value: 'autre', label: 'Autre' },
];

export const DepenseFilters = ({
  mois,
  annee,
  categorie,
  onMoisChange,
  onAnneeChange,
  onCategorieChange,
}: DepenseFiltersProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label>Mois</Label>
        <Select value={mois.toString()} onValueChange={(v) => onMoisChange(Number(v))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MOIS.map((m) => (
              <SelectItem key={m.value} value={m.value.toString()}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Année</Label>
        <Select value={annee.toString()} onValueChange={(v) => onAnneeChange(Number(v))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Catégorie</Label>
        <Select value={categorie || 'tous'} onValueChange={onCategorieChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};