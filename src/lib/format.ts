export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatEcosystem(eco: string): string {
  return eco.charAt(0).toUpperCase() + eco.slice(1);
}
