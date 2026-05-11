export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} ${hours}:${minutes}`;
}

export function maskString(str: string, visibleChars: number = 4): string {
  if (!str) return '';
  if (str.length <= visibleChars) return str;
  const masked = '*'.repeat(str.length - visibleChars);
  return masked + str.slice(-visibleChars);
}

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return formatted;
}

export interface ApiConfigError {
  error: string;
  message: string;
}

export function checkApiConfig(keys: string[]): ApiConfigError | null {
  const missing = keys.filter((key) => !process.env[key]);
  if (missing.length === 0) return null;
  return {
    error: 'API_NOT_CONFIGURED',
    message: `The following environment variables are not configured: ${missing.join(', ')}. Please add them to your environment variables.`,
  };
}
