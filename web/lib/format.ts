/**
 * Format money amount with consistent convention
 * - No decimal places for whole numbers
 * - Thousands separator (comma)
 * - Currency code displayed
 * 
 * Examples:
 * - 10000000 → "10,000,000"
 * - 1234.56 → "1,234.56"
 * - 0 → "0"
 */
export function formatMoney(amount: number, currency?: string, options?: {
  showDecimals?: boolean;
  showCurrency?: boolean;
}): string {
  const showDecimals = options?.showDecimals ?? false;
  const showCurrency = options?.showCurrency ?? true;
  
  // Format number with thousands separator
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: showDecimals && amount % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: showDecimals && amount % 1 !== 0 ? 2 : 0,
  });
  
  // Add currency if provided and requested
  if (currency && showCurrency) {
    return `${formatted} ${currency}`;
  }
  
  return formatted;
}

/**
 * Format money from minor units (cents) to major units
 * Example: 1000000 cents → "10,000 USD"
 */
export function formatMoneyFromMinor(amountMinor: number, currency?: string, options?: {
  showDecimals?: boolean;
  showCurrency?: boolean;
}): string {
  return formatMoney(amountMinor / 100, currency, options);
}

/**
 * Format money with sign prefix (+/-)
 */
export function formatMoneyWithSign(amount: number, currency?: string, options?: {
  showDecimals?: boolean;
  showCurrency?: boolean;
}): string {
  const sign = amount >= 0 ? "+" : "";
  return sign + formatMoney(amount, currency, options);
}
