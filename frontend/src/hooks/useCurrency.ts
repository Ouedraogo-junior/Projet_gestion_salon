// src/hooks/useCurrency.ts
// La logique vit désormais dans CurrencyContext (état partagé entre le sélecteur
// du header et toutes les pages publiques). On ré-exporte le hook ici pour
// conserver un point d'import stable.
export { useCurrency } from '@/contexts/CurrencyContext';
