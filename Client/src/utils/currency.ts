/**
 * Formats a fare value (which is sent as string by MySQL DECIMAL) into currency string.
 * Example: "850.00" -> "₹850.00" or "₹850"
 */
export const formatCurrency = (amount: string | number): string => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) {
    return `₹${amount}`;
  }
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};
