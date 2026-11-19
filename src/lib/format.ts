const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
})

export function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100)
}

export function formatDuration(minutes: number) {
  return `${minutes} min`
}
