export type Currency = "KWD" | "SAR" | "USD";

/** KWD uses 3 decimal places; SAR and USD use 2. */
export const CURRENCY_DECIMALS: Record<Currency, number> = {
  KWD: 3,
  SAR: 2,
  USD: 2,
};

/**
 * Format an amount in the project currency, localized.
 * locale "ar" renders Arabic currency names/digits per Intl rules.
 */
export function formatMoney(
  amount: number,
  currency: Currency,
  locale: string = "en"
): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar" : "en", {
    style: "currency",
    currency,
    minimumFractionDigits: CURRENCY_DECIMALS[currency],
    maximumFractionDigits: CURRENCY_DECIMALS[currency],
  }).format(amount);
}

export function formatDate(date: string | Date, locale: string = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}
