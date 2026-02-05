// src/services/currencyService.ts

const API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest/XOF'; // XOF = FCFA

export interface ExchangeRates {
  base: string;
  date: string;
  rates: {
    [key: string]: number;
  };
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA', flag: '🇧🇫' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'USD', name: 'Dollar américain', symbol: '$', flag: '🇺🇸' },
  { code: 'GBP', name: 'Livre sterling', symbol: '£', flag: '🇬🇧' },
  { code: 'CAD', name: 'Dollar canadien', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF', name: 'Franc suisse', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'JPY', name: 'Yen japonais', symbol: '¥', flag: '🇯🇵' },
  { code: 'CNY', name: 'Yuan chinois', symbol: '¥', flag: '🇨🇳' },
  { code: 'MAD', name: 'Dirham marocain', symbol: 'MAD', flag: '🇲🇦' },
  { code: 'NGN', name: 'Naira nigérian', symbol: '₦', flag: '🇳🇬' },
  { code: 'GHS', name: 'Cedi ghanéen', symbol: 'GH₵', flag: '🇬🇭' },
];

class CurrencyService {
  private rates: ExchangeRates | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 3600000; // 1 heure en millisecondes

  async getExchangeRates(): Promise<ExchangeRates> {
    const now = Date.now();
    
    // Utiliser le cache si disponible et récent
    if (this.rates && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.rates;
    }

    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des taux de change');
      }
      
      this.rates = await response.json();
      this.lastFetch = now;
      return this.rates;
    } catch (error) {
      console.error('Erreur API taux de change:', error);
      
      // Retourner des taux par défaut en cas d'erreur
      if (this.rates) {
        return this.rates;
      }
      
      throw error;
    }
  }

  async convertFromXOF(amountXOF: number, targetCurrency: string): Promise<number> {
    if (targetCurrency === 'XOF') {
      return amountXOF;
    }

    const rates = await this.getExchangeRates();
    const rate = rates.rates[targetCurrency];
    
    if (!rate) {
      throw new Error(`Devise ${targetCurrency} non supportée`);
    }

    return amountXOF * rate;
  }

  getCurrencyByCode(code: string): Currency | undefined {
    return SUPPORTED_CURRENCIES.find(c => c.code === code);
  }

  formatAmount(amount: number, currencyCode: string): string {
    const currency = this.getCurrencyByCode(currencyCode);
    
    if (!currency) {
      return amount.toFixed(2);
    }

    // Formater selon la devise
    const formatted = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: currencyCode === 'JPY' ? 0 : 2,
      maximumFractionDigits: currencyCode === 'JPY' ? 0 : 2,
    }).format(amount);

    return formatted;
  }
}

export const currencyService = new CurrencyService();