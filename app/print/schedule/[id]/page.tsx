import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "@/components/documents/print-button";
import { formatDate } from "@/lib/format";
import { dayTypeLabel, sheetLabel, type ProductionDay, type SheetLang } from "@/lib/production";

export const dynamic = "force-dynamic";

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

/** Month calendar grids under the schedule table — one per month that has
 *  production days. break-inside-avoid keeps each month on one PDF page. */
function ScheduleCalendar({
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

export default async function PrintSchedulePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ key?: string; lang?: string }>;
}) {
  const { id } = await params;
  const { key, lang } = await searchParams;
  const sheetLang: SheetLang = lang === "ar" ? "ar" : "en";
  if (!key) notFound();

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, start_date, end_date, client_logo_path")
    .eq("id", id)
    .eq("share_key", key)
    .single();
  if (!project) notFound();

  const { data: days } = await supabase
    .from("production_days")
    .select("*")
    .eq("project_id", id)
    .order("day_date")
    .returns<ProductionDay[]>();

  return (
    <main className="min-h-screen bg-black/90 py-8 print:bg-transparent print:py-0">
      <div className="mx-auto mb-6 flex w-full max-w-[190mm] justify-end px-4 print:hidden">
        <PrintButton />
      </div>
      <div
        dir={sheetLang === "ar" ? "rtl" : "ltr"}
        lang={sheetLang}
        className="relative mx-auto w-full max-w-[190mm] bg-[#F5F0E8] p-5 sm:p-10 print:min-h-[277mm] print:w-[190mm] text-black shadow-2xl print:shadow-none"
      >
        <header className="flex items-start justify-between gap-6">
          <div>
            <Image
              src="/brand/logo.png"
              alt="Moments Productions"
              width={1200}
              height={436}
              className="h-12 w-auto"
              priority
            />
            <p className="mt-2 text-sm font-bold">{project.name}</p>
            {project.start_date && (
              <p className="text-xs text-black/55">
                {formatDate(project.start_date, sheetLang)}
                {project.end_date ? ` → ${formatDate(project.end_date, sheetLang)}` : ""}
              </p>
            )}
          </div>
          <div className="text-end">
            <h1 className="text-4xl">{sheetLabel("schedule_title", sheetLang)}</h1>
            {project.client_logo_path && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/client-logos/${project.client_logo_path}`}
                alt=""
                className="ms-auto mt-3 h-12 w-44 object-contain object-right"
              />
            )}
          </div>
        </header>

        <table className="mt-10 w-full text-sm">
          <thead>
            <tr className="border-y border-black text-[10px] tracking-[0.15em] text-black/55">
              <th className="py-2 text-start">{sheetLabel("date", sheetLang)}</th>
              <th className="py-2 text-start">{sheetLabel("type", sheetLang)}</th>
              <th className="py-2 text-start">{sheetLabel("title_col", sheetLang)}</th>
              <th className="py-2 text-start">{sheetLabel("locations_col", sheetLang)}</th>
            </tr>
          </thead>
          <tbody>
            {(days ?? []).map((d) => (
              <tr key={d.id} className="border-b border-black/15 align-top">
                <td className="py-2.5 pe-3 font-bold whitespace-nowrap">
                  {formatDate(d.day_date, sheetLang)}
                </td>
                <td className="py-2.5 pe-3">
                  <span
                    className={
                      d.day_type === "shoot"
                        ? "bg-[#E50914] px-1.5 py-0.5 text-xs text-[#F5F0E8]"
                        : "border border-black px-1.5 py-0.5 text-xs"
                    }
                  >
                    {dayTypeLabel(d.day_type, sheetLang)}
                  </span>
                </td>
                <td className="py-2.5 pe-3">{d.title}</td>
                <td className="py-2.5 text-black/70">
                  {d.locations.map((l) => l.name).filter(Boolean).join(" · ")}
                </td>
              </tr>
            ))}
            {(days ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-black/55">
                  {sheetLabel("nothing_scheduled", sheetLang)}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <ScheduleCalendar days={days ?? []} lang={sheetLang} />

        <footer className="mt-16 border-t border-black/20 pt-4 text-center text-[10px] tracking-[0.3em] text-black/55">
          MOMENTS PRODUCTIONS · KUWAIT · THE WORLD
        </footer>
      </div>
    </main>
  );
}
