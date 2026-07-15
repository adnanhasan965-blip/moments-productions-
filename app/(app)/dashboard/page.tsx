import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BudgetBar } from "@/components/budget-bar";
import { StatusBadge } from "@/components/status-badge";
import {
  ProductionCalendar,
  type CalendarEntry,
} from "@/components/production/production-calendar";
import { getLocale, getTranslations } from "next-intl/server";
import { formatDate, formatMoney } from "@/lib/format";
import { computeSpent, type Project, type ProjectSpendRows } from "@/lib/types";
import type { ProductionDay } from "@/lib/production";

type ProjectRow = Project & ProjectSpendRows;
type GlobalDay = ProductionDay & { projects: { name: string } | null };

async function fetchProjects(): Promise<
  { ok: true; projects: ProjectRow[] } | { ok: false; message: string }
> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select(
        "*, costs(amount), project_crew(rate, days, is_flat_fee)"
      )
      .eq("archived", false)
      .order("created_at", { ascending: false });
    if (error) return { ok: false, message: error.message };
    return { ok: true, projects: (data ?? []) as ProjectRow[] };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "unknown" };
  }
}

async function fetchGlobalDays(): Promise<GlobalDay[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("production_days")
      .select("*, projects!inner(name, archived)")
      .eq("projects.archived", false)
      .order("day_date")
      .returns<GlobalDay[]>();
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ cal?: string; calview?: string }>;
}) {
  const { cal, calview } = await searchParams;
  const [t, tDay, locale] = await Promise.all([
    getTranslations(),
    getTranslations("dayType"),
    getLocale(),
  ]);
  const [result, globalDays] = await Promise.all([
    fetchProjects(),
    fetchGlobalDays(),
  ]);

  const calMonth =
    cal && /^\d{4}-\d{2}$/.test(cal) ? cal : new Date().toISOString().slice(0, 7);
  const calendarEntries: CalendarEntry[] = globalDays.map((d) => ({
    date: d.day_date,
    label: `${d.projects?.name ?? "?"} — ${d.title || tDay(d.day_type)}`,
    type: d.day_type,
    href: `/projects/${d.project_id}/days/${d.id}`,
  }));

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl">{t("dashboard.title")}</h1>
          <p className="font-[family-name:var(--font-editorial)] italic text-muted-foreground">
            {t("dashboard.tagline")}
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">{t("dashboard.newProject")}</Link>
        </Button>
      </div>

      {!result.ok ? (
        <div className="viewfinder mx-auto max-w-xl p-10 text-center">
          <span className="vf absolute inset-0" />
          <h2 className="text-2xl">{t("dashboard.notConnectedTitle")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("dashboard.notConnectedBody")}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">({result.message})</p>
        </div>
      ) : result.projects.length === 0 ? (
        <div className="viewfinder mx-auto max-w-xl p-10 text-center">
          <span className="vf absolute inset-0" />
          <h2 className="text-2xl">{t("dashboard.emptyTitle")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("dashboard.emptyBody")}
          </p>
          <Button asChild className="mt-6">
            <Link href="/projects/new">{t("dashboard.newProject")}</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("dashboard.colProject")}</TableHead>
                <TableHead>{t("dashboard.colClient")}</TableHead>
                <TableHead>{t("dashboard.colStatus")}</TableHead>
                <TableHead>{t("dashboard.colDates")}</TableHead>
                <TableHead className="w-56">{t("dashboard.colBudget")}</TableHead>
                <TableHead className="text-end">{t("dashboard.colRemaining")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.projects.map((p) => {
                const spent = computeSpent(p);
                const remaining = Number(p.total_budget) - spent;
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link
                        href={`/projects/${p.id}`}
                        className="font-bold hover:underline"
                      >
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.client_name || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {p.start_date ? formatDate(p.start_date, locale) : "—"}
                      {" → "}
                      {p.end_date ? formatDate(p.end_date, locale) : "—"}
                    </TableCell>
                    <TableCell>
                      <BudgetBar
                        budget={Number(p.total_budget)}
                        spent={spent}
                        currency={p.currency}
                        showAmounts
                      />
                    </TableCell>
                    <TableCell
                      className={`text-end whitespace-nowrap ${
                        remaining < 0 ? "font-bold text-destructive" : ""
                      }`}
                    >
                      {formatMoney(remaining, p.currency, locale)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {result.ok && (
        <section className="space-y-4 pt-4">
          <h2 className="text-3xl">{t("dashboard.calendarTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.calendarHint")}
          </p>
          <ProductionCalendar
            entries={calendarEntries}
            month={calMonth}
            view={calview === "week" ? "week" : "month"}
            navHref={(m, v) => `/dashboard?cal=${m}&calview=${v}`}
          />
        </section>
      )}
    </main>
  );
}
