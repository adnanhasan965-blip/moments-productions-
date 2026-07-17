import {
  dayTypeLabel,
  type ProductionDay,
  type SheetLang,
} from "@/lib/production";

/** Print chip styles per day type — print palette (cream/black/signal red). */
const PRINT_DAY_CLASSES: Record<ProductionDay["day_type"], string> = {
  shoot: "bg-[#E50914] text-[#F5F0E8]",
  prep: "border border-black text-black",
  post_deadline: "bg-black text-[#F5F0E8]",
  delivery: "bg-black text-[#F5F0E8] underline",
};

/** Months (as first-of-month Dates) that contain at least one production day. */
function monthsWithDays(days: ProductionDay[]): Date[] {
  const seen = new Set<string>();
  for (const d of days) seen.add(d.day_date.slice(0, 7)); // YYYY-MM
  return [...seen].sort().map((ym) => {
    const [y, m] = ym.split("-").map(Number);
    return new Date(y, m - 1, 1);
  });
}

/** 7-wide grid cells (Sun→Sat) for a month; null = padding cell. */
function monthCells(first: Date): (string | null)[] {
  const y = first.getFullYear();
  const m = first.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: first.getDay() }, () => null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(
      `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    );
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Month calendar grids for printable schedule pages (schedule PDF and the
 *  booklet's schedule page) — one grid per month that has production days.
 *  break-inside-avoid keeps each month on one PDF page. */
export function ScheduleCalendar({
  days,
  lang,
}: {
  days: ProductionDay[];
  lang: SheetLang;
}) {
  if (days.length === 0) return null;
  const intlLocale = lang === "ar" ? "ar" : "en";
  const monthName = new Intl.DateTimeFormat(intlLocale, {
    month: "long",
    year: "numeric",
  });
  const weekdayName = new Intl.DateTimeFormat(intlLocale, { weekday: "short" });
  // Sun 4 Jan 1970 → Sat 10 Jan 1970 (a known Sun-to-Sat week)
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    weekdayName.format(new Date(1970, 0, 4 + i))
  );
  const byDate = new Map<string, ProductionDay[]>();
  for (const d of days) {
    byDate.set(d.day_date, [...(byDate.get(d.day_date) ?? []), d]);
  }

  return (
    <div className="mt-12 space-y-10">
      {monthsWithDays(days).map((first) => (
        <section key={first.toISOString()} style={{ breakInside: "avoid" }}>
          <h2 className="mb-3 text-2xl">{monthName.format(first)}</h2>
          <div className="grid grid-cols-7 border-s border-t border-black/25">
            {weekdays.map((w) => (
              <div
                key={w}
                className="border-e border-b border-black/25 px-1 py-1.5 text-center text-[8px] tracking-[0.2em] text-black/55 uppercase"
              >
                {w}
              </div>
            ))}
            {monthCells(first).map((date, i) => (
              <div
                key={i}
                className={`min-h-14 border-e border-b border-black/25 p-1 ${
                  date ? "" : "bg-black/[0.04]"
                }`}
              >
                {date && (
                  <>
                    <p className="text-[9px] text-black/55">
                      {Number(date.slice(8, 10))}
                    </p>
                    {(byDate.get(date) ?? []).map((d) => (
                      <p
                        key={d.id}
                        className={`mt-0.5 truncate px-1 py-0.5 text-[8px] leading-tight ${PRINT_DAY_CLASSES[d.day_type]}`}
                        title={d.title}
                      >
                        {dayTypeLabel(d.day_type, lang)}
                        {d.title ? ` · ${d.title}` : ""}
                      </p>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
