// Currency formatting utilities

export function formatCurrency(amount: number | string, currency: string): string {
  try {
    // Convert string to number if needed (handles Drizzle decimal columns)
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Validate the amount
    if (isNaN(numericAmount)) {
      return `${currency} 0.00`;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch (error) {
    // Fallback if currency code is invalid
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${currency} ${(isNaN(numericAmount) ? 0 : numericAmount).toLocaleString()}`;
  }
}
