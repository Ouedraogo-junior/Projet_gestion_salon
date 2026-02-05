// src/app/pages/Rapports/components/PeriodeSelector.tsx

import React, { useState } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Calendar, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { Calendar as CalendarComponent } from '@/app/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { rapportApi } from '@/services/rapportApi';
import type { PeriodeFilters, PeriodeType } from '@/types/rapport.types';

interface PeriodeSelectorProps {
  currentFilters: PeriodeFilters;
  onPeriodeChange: (filters: PeriodeFilters) => void;
}

export function PeriodeSelector({ currentFilters, onPeriodeChange }: PeriodeSelectorProps) {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [dateDebut, setDateDebut] = useState<Date | undefined>(new Date(currentFilters.date_debut));
  const [dateFin, setDateFin] = useState<Date | undefined>(new Date(currentFilters.date_fin));

  // Handler changement preset
  const handlePresetChange = (value: string) => {
    const newFilters = rapportApi.getPeriodePreset(value as PeriodeType);
    onPeriodeChange(newFilters);
  };

  // Handler changement mois
  const handleMoisChange = (value: string) => {
    const mois = parseInt(value);
    const annee = new Date().getFullYear();
    const newFilters = rapportApi.getMoisFilters(mois, annee);
    onPeriodeChange(newFilters);
  };

  // Handler changement année
  const handleAnneeChange = (value: string) => {
    const annee = parseInt(value);
    const newFilters = rapportApi.getAnneeFilters(annee);
    onPeriodeChange(newFilters);
  };

  // Handler période personnalisée
  const handleCustomPeriode = () => {
    if (dateDebut && dateFin) {
      const newFilters = rapportApi.getCustomFilters(
        format(dateDebut, 'yyyy-MM-dd'),
        format(dateFin, 'yyyy-MM-dd')
      );
      onPeriodeChange(newFilters);
    }
  };

  return (
    <Card>
      <CardContent className="pt-4 sm:pt-6">
        <div className="space-y-4">
          {/* Mode sélection */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'preset' ? 'default' : 'outline'}
              onClick={() => setMode('preset')}
              size="sm"
              className="text-xs sm:text-sm flex-1 sm:flex-none"
            >
              Périodes prédéfinies
            </Button>
            <Button
              variant={mode === 'custom' ? 'default' : 'outline'}
              onClick={() => setMode('custom')}
              size="sm"
              className="text-xs sm:text-sm flex-1 sm:flex-none"
            >
              Période personnalisée
            </Button>
          </div>

          {/* Périodes prédéfinies */}
          {mode === 'preset' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Raccourcis rapides */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Raccourcis</Label>
                <Select onValueChange={handlePresetChange} defaultValue="mois">
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jour">Aujourd'hui</SelectItem>
                    <SelectItem value="semaine">Cette semaine</SelectItem>
                    <SelectItem value="mois">Ce mois</SelectItem>
                    <SelectItem value="annee">Cette année</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sélection mois */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Par mois</Label>
                <Select onValueChange={handleMoisChange}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="Choisir un mois" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Janvier</SelectItem>
                    <SelectItem value="2">Février</SelectItem>
                    <SelectItem value="3">Mars</SelectItem>
                    <SelectItem value="4">Avril</SelectItem>
                    <SelectItem value="5">Mai</SelectItem>
                    <SelectItem value="6">Juin</SelectItem>
                    <SelectItem value="7">Juillet</SelectItem>
                    <SelectItem value="8">Août</SelectItem>
                    <SelectItem value="9">Septembre</SelectItem>
                    <SelectItem value="10">Octobre</SelectItem>
                    <SelectItem value="11">Novembre</SelectItem>
                    <SelectItem value="12">Décembre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sélection année */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Par année</Label>
                <Select onValueChange={handleAnneeChange}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="Choisir une année" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Période actuelle */}
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label className="text-xs sm:text-sm">Période actuelle</Label>
                <div className="flex h-10 items-center rounded-md border px-3 text-xs sm:text-sm">
                  <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate">
                    {currentFilters.date_debut} au {currentFilters.date_fin}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Période personnalisée */}
          {mode === 'custom' && (
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
              {/* Date début */}
              <div className="space-y-2 flex-1">
                <Label className="text-xs sm:text-sm">Date début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-[200px] justify-start text-left text-xs sm:text-sm"
                    >
                      <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      {dateDebut ? format(dateDebut, 'PPP', { locale: fr }) : 'Sélectionner'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={dateDebut}
                      onSelect={setDateDebut}
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date fin */}
              <div className="space-y-2 flex-1">
                <Label className="text-xs sm:text-sm">Date fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-[200px] justify-start text-left text-xs sm:text-sm"
                    >
                      <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      {dateFin ? format(dateFin, 'PPP', { locale: fr }) : 'Sélectionner'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={dateFin}
                      onSelect={setDateFin}
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Bouton valider */}
              <Button 
                onClick={handleCustomPeriode} 
                disabled={!dateDebut || !dateFin}
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                Appliquer
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}