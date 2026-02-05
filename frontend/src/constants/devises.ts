// src/constants/devises.ts

export type Devise = 
  | 'FCFA'
  | 'EUR'
  | 'USD'
  | 'GBP'
  | 'CNY'
  | 'AED'
  | 'MAD'
  | 'XOF';

export type MoyenPaiement = 
  | 'especes'
  | 'virement'
  | 'cheque'
  | 'mobile_money'
  | 'carte_bancaire'
  | 'western_union'
  | 'transferwise'
  | 'crypto'
  | 'credit';

export const DEVISES: Array<{ value: Devise; label: string; symbole: string }> = [
  { value: 'FCFA', label: 'Franc CFA', symbole: 'FCFA' },
  { value: 'CNY', label: 'Yuan Chinois', symbole: '¥' },
  { value: 'AED', label: 'Dirham Émirats', symbole: 'د.إ' },
  { value: 'EUR', label: 'Euro', symbole: '€' },
  { value: 'USD', label: 'Dollar US', symbole: '$' },
  { value: 'GBP', label: 'Livre Sterling', symbole: '£' },
  { value: 'MAD', label: 'Dirham Marocain', symbole: 'DH' },
];

export const MOYENS_PAIEMENT: Array<{ value: MoyenPaiement; label: string }> = [
  { value: 'especes', label: 'Espèces' },
  { value: 'virement', label: 'Virement bancaire' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'carte_bancaire', label: 'Carte bancaire' },
  { value: 'western_union', label: 'Western Union' },
  { value: 'transferwise', label: 'Wise/TransferWise' },
  { value: 'cheque', label: 'Chèque' },
  { value: 'crypto', label: 'Cryptomonnaie' },
  { value: 'credit', label: 'Crédit fournisseur' },
];