// src/contexts/CurrencyContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { currencyService, Currency } from '@/services/currencyService';

const STORAGE_KEY = 'preferred_currency';

interface CurrencyContextType {
  /** Code ISO de la devise choisie par le visiteur (ex: 'XOF', 'EUR'...) */
  selectedCurrency: string;
  /** Change la devise active et la mémorise (localStorage) */
  changeCurrency: (currencyCode: string) => void;
  /** Convertit un montant exprimé en FCFA (XOF) vers la devise sélectionnée */
  convertAmount: (amountXOF: number) => number;
  /** Formate un nombre déjà converti selon les règles de la devise */
  formatCurrency: (amount: number, currencyCode?: string) => string;
  /** Formate directement un montant FCFA en le convertissant + ajoutant le symbole */
  formatPrice: (amountXOF: number) => string;
  getCurrencyInfo: () => Currency | undefined;
  loading: boolean;
  error: string | null;
  conversionRate: number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || 'XOF';
    }
    return 'XOF';
  });

  const [conversionRate, setConversionRate] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadExchangeRate = useCallback(async () => {
    if (selectedCurrency === 'XOF') {
      setConversionRate(1);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rates = await currencyService.getExchangeRates();
      const rate = rates.rates[selectedCurrency];

      if (rate) {
        setConversionRate(rate);
      } else {
        setError('Devise non disponible');
      }
    } catch (err) {
      setError('Erreur de connexion aux taux de change');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedCurrency]);

  useEffect(() => {
    loadExchangeRate();
  }, [loadExchangeRate]);

  const changeCurrency = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, currencyCode);
    }
  };

  const convertAmount = (amountXOF: number): number => {
    return amountXOF * conversionRate;
  };

  const formatCurrency = (amount: number, currencyCode?: string): string => {
    const code = currencyCode || selectedCurrency;
    return currencyService.formatAmount(amount, code);
  };

  const getCurrencyInfo = () => {
    return currencyService.getCurrencyByCode(selectedCurrency);
  };

  const formatPrice = (amountXOF: number): string => {
    const converted = convertAmount(amountXOF);
    const info = getCurrencyInfo();
    return `${formatCurrency(converted)} ${info?.symbol || selectedCurrency}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        changeCurrency,
        convertAmount,
        formatCurrency,
        formatPrice,
        getCurrencyInfo,
        loading,
        error,
        conversionRate,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error('useCurrency doit être utilisé à l\'intérieur d\'un <CurrencyProvider>');
  }
  return ctx;
}
