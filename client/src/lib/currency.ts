/**
 * Currency utility functions for formatting values based on region
 */

export const getCurrencySymbol = (currencyCode: string): string => {
  const symbols: Record<string, string> = {
    'USD': '$',
    'GBP': '£',
    'CAD': '$',
    'EUR': '€',
  };
  
  return symbols[currencyCode] || '$'; // Default to $ if unknown
};

export const formatCurrency = (amount: string | number, currencyCode: string): string => {
  const symbol = getCurrencySymbol(currencyCode);
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle invalid numbers
  if (isNaN(value)) {
    return `${symbol}0.00`;
  }
  
  // Format with 2 decimal places
  return `${symbol}${value.toFixed(2)}`;
};

export const getCurrencyLabel = (currencyCode: string): string => {
  return `(${getCurrencySymbol(currencyCode)})`;
};
