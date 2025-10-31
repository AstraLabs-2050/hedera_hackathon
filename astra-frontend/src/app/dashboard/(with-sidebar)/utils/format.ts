export function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatMetric(value: number): string {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(2).replace(/\.00$/, "") + "M";
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(2).replace(/\.00$/, "") + "k";
  }
  return value.toString();
}
