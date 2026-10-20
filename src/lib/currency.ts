/**
 * Centralized Currency Formatting Utility for DineCraft
 *
 * Ensures consistent currency representation across the entire SaaS:
 * Dashboard, Storefront, Cart, Checkout, Order Tracking, and Customer CRM.
 */

export interface CurrencyConfig {
  symbol: string;
  code: string;
  name: string;
  prefix: boolean;
  space?: boolean;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { symbol: '$', code: 'USD', name: 'US Dollar', prefix: true },
  { symbol: 'Rs.', code: 'PKR', name: 'Pakistani Rupee', prefix: true, space: true },
  { symbol: '₹', code: 'INR', name: 'Indian Rupee', prefix: true },
  { symbol: '€', code: 'EUR', name: 'Euro', prefix: true },
  { symbol: '£', code: 'GBP', name: 'British Pound', prefix: true },
  { symbol: 'AED', code: 'AED', name: 'UAE Dirham', prefix: true, space: true },
  { symbol: 'SAR', code: 'SAR', name: 'Saudi Riyal', prefix: true, space: true },
  { symbol: 'CAD', code: 'CAD', name: 'Canadian Dollar', prefix: true, space: true },
  { symbol: 'AUD', code: 'AUD', name: 'Australian Dollar', prefix: true, space: true },
];

/**
 * Finds matching currency metadata by symbol or code.
 */
export function findCurrencyConfig(currency?: string | null): CurrencyConfig | undefined {
  if (!currency || typeof currency !== 'string' || !currency.trim()) {
    return undefined;
  }
  const clean = currency.trim();
  const upper = clean.toUpperCase();

  return SUPPORTED_CURRENCIES.find(
    (c) =>
      c.code.toUpperCase() === upper ||
      c.symbol.toLowerCase() === clean.toLowerCase() ||
      (c.code === 'PKR' && (clean === 'Rs' || clean === 'Rs.' || upper === 'PKR'))
  );
}

/**
 * Returns a standardized currency symbol/code for a given restaurant configuration.
 */
export function getCurrencySymbol(currency?: string | null): string {
  if (!currency || typeof currency !== 'string' || !currency.trim()) {
    return '$';
  }
  const found = findCurrencyConfig(currency);
  if (found) {
    return found.symbol;
  }
  return currency.trim();
}

export interface FormatCurrencyOptions {
  decimals?: number;
  showZeroAsFree?: boolean;
}

/**
 * Formats a monetary amount using the restaurant's configured currency.
 *
 * Examples:
 * formatCurrency(12.5, 'USD') -> "$12.50"
 * formatCurrency(12.5, '$')   -> "$12.50"
 * formatCurrency(12.5, 'PKR') -> "Rs. 12.50"
 * formatCurrency(1250, 'AED') -> "AED 1,250.00"
 * formatCurrency(0, '$', { showZeroAsFree: true }) -> "Free"
 * formatCurrency(-5, '$') -> "-$5.00"
 */
export function formatCurrency(
  amount: number | string | undefined | null,
  currency?: string | null,
  options?: FormatCurrencyOptions
): string {
  const numeric = typeof amount === 'number' ? amount : Number(amount ?? 0);
  const safeNumber = isNaN(numeric) ? 0 : numeric;

  if (options?.showZeroAsFree && safeNumber === 0) {
    return 'Free';
  }

  const isNegative = safeNumber < 0;
  const absValue = Math.abs(safeNumber);

  const found = findCurrencyConfig(currency);
  const sym = found?.symbol || getCurrencySymbol(currency);
  const decimals = options?.decimals ?? 2;

  const formattedNumber = absValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const needsSpace = Boolean(found?.space) || (sym.length > 1 && !sym.includes('$'));
  const sign = isNegative ? '-' : '';

  if (needsSpace) {
    return `${sign}${sym} ${formattedNumber}`;
  }

  return `${sign}${sym}${formattedNumber}`;
}
