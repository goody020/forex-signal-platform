export function formatPrice(value: unknown, decimals: number) {
  return Number(value).toFixed(decimals);
}