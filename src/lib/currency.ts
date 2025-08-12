export function formatEUR(value: number): string {
  try {
    return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
      Number.isFinite(value) ? value : 0
    );
  } catch {
    return `€ ${Number(value || 0).toFixed(2)}`;
  }
}


