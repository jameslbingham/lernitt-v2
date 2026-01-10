// @ts-nocheck
/**
 * CurrencyEngine: Handles multi-currency support for Lernitt-v2.
 * Base Platform Currency: USD
 */

interface ExchangeRates {
  [key: string]: number;
}

let cachedRates: ExchangeRates | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 Hour cache to prevent API spam

export const CurrencyEngine = {
  /**
   * Fetches the latest exchange rates relative to USD.
   */
  async getExchangeRates(): Promise<ExchangeRates> {
    const now = Date.now();

    // Return cached rates if they are fresh
    if (cachedRates && (now - lastFetchTime) < CACHE_DURATION) {
      return cachedRates;
    }

    try {
      // Fetching rates with USD as the base
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      
      cachedRates = data.rates;
      lastFetchTime = now;
      
      return cachedRates;
    } catch (error) {
      console.error('Currency Fetch Error:', error);
      // Hardcoded fallbacks if the external API fails
      return { EUR: 0.91, GBP: 0.79, JPY: 145.0, USD: 1 };
    }
  },

  /**
   * Converts a base USD amount to a student's chosen currency.
   */
  async convert(amountInUSD: number, targetCurrency: string): Promise<number> {
    const currencyUpper = targetCurrency.toUpperCase();
    if (currencyUpper === 'USD') return amountInUSD;

    const rates = await this.getExchangeRates();
    const rate = rates[currencyUpper];

    if (!rate) {
      console.warn(`No rate found for ${targetCurrency}. Defaulting to USD.`);
      return amountInUSD;
    }

    const converted = amountInUSD * rate;
    // Round to 2 decimal places for financial precision
    return parseFloat(converted.toFixed(2));
  },

  /**
   * Formats numbers into currency strings (e.g., "$10.00", "€9.10").
   */
  format(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }
};
