/**
 * Currency Utilities
 * UK-focused currency formatting and calculations
 */

export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatUSD = (amount: number): string => {
  return formatCurrency(amount, 'USD', 'en-US');
};

export const formatGBP = (amount: number): string => {
  return formatCurrency(amount, 'USD', 'en-US');
};

export const parseCurrency = (value: string): number => {
  // Remove currency symbols and parse
  const cleaned = value.replace(/[$$,\s]/g, '');
  return parseFloat(cleaned) || 0;
};

export const calculateVAT = (amount: number, vatRate: number = 0.2): number => {
  return amount * vatRate;
};

export const addVAT = (amount: number, vatRate: number = 0.2): number => {
  return amount * (1 + vatRate);
};

export const removeVAT = (amount: number, vatRate: number = 0.2): number => {
  return amount / (1 + vatRate);
};

