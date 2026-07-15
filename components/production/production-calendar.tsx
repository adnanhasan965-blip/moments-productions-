import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { DAY_TYPE_CLASSES, DAY_TYPES, type DayType } from "@/lib/production";

export interface CalendarEntry {
  date: string; // YYYY-MM-DD
  label: string;
  type: DayType;
  href: string;
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function monthLabel(d: Date, locale: string): string {
  return d.toLocaleDateString(locale === "ar" ? "ar" : "en-GB", {
    month: "long",
    year: "numeric",
  });
}

interface Props {
  entries: CalendarEntry[];
  /** YYYY-MM anchor month (defaults handled by caller) */
  month: string;
  view: "month" | "week";
  /** builds hrefs for nav, preserving surrounding page state */
  navHref: (month: string, view: "month" | "week") => string;
}

export function ProductionCalendar({ entries, month, view, navHref }: Props) {
  const t = useTranslations("calendar");
  const tDay = useTranslations("dayType");
  const locale = useLocale();
  const [y, m] = month.split("-").map(Number);
  const anchor = new Date(y, m - 1, 1);
  const prev = `${new Date(y, m - 2, 1).getFullYear()}-${String(new Date(y, m - 2, 1).getMonth() + 1).padStart(2, "0")}`;
  const next = `${new Date(y, m, 1).getFullYear()}-${String(new Date(y, m, 1).getMonth() + 1).padStart(2, "0")}`;

  const byDate = new Map<string, CalendarEntry[]>();
  for (const e of entries) {
    byDate.set(e.date, [...(byDate.get(e.date) ?? []), e]);
  }

  // Sunday-start grid covering the anchor month
  const gridStart = new Date(anchor);
  gridStart.setDate(1 - gridStart.getDay());
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push(d);
  }
  const weeks = Array.from({ length: 6 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  const today = ymd(new Date());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={navHref(prev, view)}>←</Link>
          </Button>
          <h3 className="w-44 text-center text-xl">{monthLabel(anchor, locale)}</h3>
          <Button variant="outline" size="sm" asChild>
            <Link href={navHref(next, view)}>→</Link>
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden gap-3 text-xs sm:flex">
            {DAY_TYPES.map((d) => (
              <span key={d} className="flex items-center gap-1.5">
                <span className={`inline-block h-3 w-3 ${DAY_TYPE_CLASSES[d]}`} />
                {tDay(d)}
              </span>
            ))}
          </div>
          <div className="flex border">
            {(["month", "week"] as const).map((v) => (
              <Link
                key={v}
                href={navHref(month, v)}
                className={`px-3 py-1 text-xs uppercase tracking-wider ${
                  view === v ? "bg-foreground text-background" : ""
                }`}
              >
                {t(v)}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {view === "month" ? (
        <div className="overflow-x-auto">
          <div className="min-w-[640px] border-s border-t">
            <div className="grid grid-cols-7">
              {(["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const).map((d) => (
                <div
                  key={d}
                  className="border-b border-e p-2 text-center text-[10px] tracking-[0.2em] text-muted-foreground"
                >
                  {t(d)}
                </div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7">
                {week.map((d) => {
                  const key = ymd(d);
                  const inMonth = d.getMonth() === anchor.getMonth();
                  const dayEntries = byDate.get(key) ?? [];
                  return (
                    <div
                      key={key}
                      className={`min-h-20 border-b border-e p-1.5 ${
                        inMonth ? "" : "bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <p
                        className={`text-xs ${
                          key === today
                            ? "inline-block bg-[var(--brand-signal)] px-1 font-bold text-[var(--brand-cream)]"
                            : ""
                        }`}
                      >
                        {d.getDate()}
                      </p>
                      <div className="mt-1 space-y-1">
                        {dayEntries.map((e, i) => (
                          <Link
                            key={i}
                            href={e.href}
                            className={`block truncate px-1 py-0.5 text-[10px] leading-tight ${DAY_TYPE_CLASSES[e.type]}`}
                            title={e.label}
                          >
                            {e.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="divide-y border">
          {weeks
            .flat()
            .filter((d) => d.getMonth() === anchor.getMonth())
            .map((d) => {
              const key = ymd(d);
              const dayEntries = byDate.get(key) ?? [];
              if (dayEntries.length === 0) return null;
              return (
                <div key={key} className="flex gap-6 p-3">
                  <div className="w-28 shrink-0 text-sm">
                    <p className={key === today ? "font-bold text-destructive" : "font-bold"}>
                      {d.toLocaleDateString(locale === "ar" ? "ar" : "en-GB", { weekday: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="flex flex-1 flex-wrap gap-2">
                    {dayEntries.map((e, i) => (
                      <Link
                        key={i}
                        href={e.href}
                        className={`px-2 py-1 text-xs ${DAY_TYPE_CLASSES[e.type]}`}
                      >
                        {e.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          {entries.filter((e) => e.date.startsWith(month)).length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">
              {t("emptyMonth")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
