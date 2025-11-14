/**
 * Format money consistently across the app
 * Format: "10,000 USD" (number with thousands separator, then currency)
 * No decimal places for whole numbers
 */
export function formatMoney(amountMinor: number, currencyCode: string): string {
  // Convert from minor units (cents) to major units (dollars)
  const amount = amountMinor / 100;
  
  // Format with thousands separator, no decimals for whole numbers
  const formatted = amount % 1 === 0 
    ? amount.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  return `${formatted} ${currencyCode}`;
}

/**
 * Format money for display (shorter version for tight spaces)
 */
export function formatMoneyCompact(amountMinor: number, currencyCode: string): string {
  const amount = amountMinor / 100;
  
  if (Math.abs(amount) >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M ${currencyCode}`;
  }
  if (Math.abs(amount) >= 1000) {
    return `${(amount / 1000).toFixed(1)}K ${currencyCode}`;
  }
  
  return formatMoney(amountMinor, currencyCode);
}
