// src/hooks/useCurrency.ts
import { useState, useEffect } from 'react';
import { currencyService } from '@/services/currencyService';

const STORAGE_KEY = 'preferred_currency';

export function useCurrency() {
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    // Récupérer la devise sauvegardée ou utiliser XOF par défaut
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || 'XOF';
    }
    return 'XOF';
  });

  const [conversionRate, setConversionRate] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExchangeRate();
  }, [selectedCurrency]);

  const loadExchangeRate = async () => {
    if (selectedCurrency === 'XOF') {
      setConversionRate(1);
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
  };

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

  return {
    selectedCurrency,
    changeCurrency,
    convertAmount,
    formatCurrency,
    getCurrencyInfo,
    loading,
    error,
    conversionRate,
  };
}