/**
 * Normalize free-typed time into HH:MM (24h).
 * Accepts "6", "630", "6:30", "18:30", "1830", Arabic-Indic digits, etc.
 * Returns "" when it can't be read as a valid time.
 */
export function normalizeTime(raw: string): string {
  const ascii = raw.replace(/[\u0660-\u0669]/g, (d) =>
    String("\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669".indexOf(d))
  );
  const digits = ascii.replace(/[^0-9]/g, "");
  if (!digits) return "";
  let h: number;
  let m: number;
  if (digits.length <= 2) {
    h = Number(digits);
    m = 0;
  } else if (digits.length === 3) {
    h = Number(digits.slice(0, 1));
    m = Number(digits.slice(1));
  } else {
    h = Number(digits.slice(0, 2));
    m = Number(digits.slice(2, 4));
  }
  if (h > 23 || m > 59) return "";
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
