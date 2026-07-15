import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetBar } from "@/components/budget-bar";
import { StatusBadge } from "@/components/status-badge";
import { ArchiveProjectButton } from "@/components/archive-project-button";
import { DeleteProjectButton } from "@/components/delete-project-button";
import { CostsTable } from "@/components/finance/costs-table";
import { CrewTable } from "@/components/finance/crew-table";
import { ExportButtons } from "@/components/finance/export-buttons";
import { DocumentsTable } from "@/components/documents/documents-table";
import { InvoiceDialog } from "@/components/documents/invoice-dialog";
import { ReceiptDialog } from "@/components/documents/receipt-dialog";
import { DayDialog } from "@/components/production/day-dialog";
import {
  ProductionCalendar,
  type CalendarEntry,
} from "@/components/production/production-calendar";
import { CopyLinkButton } from "@/components/copy-link-button";
import type { DocumentRow } from "@/lib/documents";
import type { ProductionDay } from "@/lib/production";
import { getLocale, getTranslations } from "next-intl/server";
import { formatDate, formatMoney } from "@/lib/format";
import {
  crewTotal,
  type Cost,
  type CostCategory,
  type CrewMember,
  type Project,
  type ProjectCrewRow,
} from "@/lib/types";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; cal?: string; calview?: string }>;
}) {
  const { id } = await params;
  const { tab, cal, calview } = await searchParams;
  const [t, tDay, locale] = await Promise.all([
    getTranslations(),
    getTranslations("dayType"),
    getLocale(),
  ]);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: project },
    { data: profile },
    { data: costs },
    { data: categories },
    { data: crew },
    { data: directory },
    { data: documents },
    { data: days },
  ] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).single<Project>(),
    supabase.from("profiles").select("role").eq("id", user?.id ?? "").single(),
    supabase
      .from("costs")
      .select("*, cost_categories(name)")
      .eq("project_id", id)
      .order("cost_date", { ascending: false, nullsFirst: false })
      .returns<Cost[]>(),
    supabase.from("cost_categories").select("id, name").order("name").returns<CostCategory[]>(),
    supabase
      .from("project_crew")
      .select("*, crew_members(*)")
      .eq("project_id", id)
      .order("created_at")
      .returns<ProjectCrewRow[]>(),
    supabase.from("crew_members").select("*").order("name").returns<CrewMember[]>(),
    supabase
      .from("documents")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false })
      .returns<DocumentRow[]>(),
    supabase
      .from("production_days")
      .select("*")
      .eq("project_id", id)
      .order("day_date")
      .returns<ProductionDay[]>(),
  ]);

  if (!project) notFound();

  // Signed URLs for receipt attachments (1 hour)
  const costRows = costs ?? [];
  const receiptPaths = costRows.filter((c) => c.receipt_path).map((c) => c.receipt_path!);
  if (receiptPaths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("receipts")
      .createSignedUrls(receiptPaths, 3600);
    const byPath = new Map(
      (signed ?? [])
        .filter((s) => s.path)
        .map((s) => [s.path as string, s.signedUrl])
    );
    for (const c of costRows) {
      if (c.receipt_path) c.receipt_url = byPath.get(c.receipt_path) ?? undefined;
    }
  }

  // Signed URLs for generated PDFs (1 hour)
  const docRows = documents ?? [];
  const pdfPaths = docRows.filter((d) => d.pdf_path).map((d) => d.pdf_path!);
  if (pdfPaths.length > 0) {
    const { data: signedPdfs } = await supabase.storage
      .from("documents")
      .createSignedUrls(pdfPaths, 3600);
    const pdfByPath = new Map(
      (signedPdfs ?? [])
        .filter((s) => s.path)
        .map((s) => [s.path as string, s.signedUrl])
    );
    for (const d of docRows) {
      if (d.pdf_path) d.pdf_url = pdfByPath.get(d.pdf_path) ?? undefined;
    }
  }

  const dayRows = days ?? [];
  const calMonth =
    cal && /^\d{4}-\d{2}$/.test(cal) ? cal : new Date().toISOString().slice(0, 7);
  const calendarEntries: CalendarEntry[] = dayRows.map((d) => ({
    date: d.day_date,
    label: d.title || tDay(d.day_type),
    type: d.day_type,
    href: `/projects/${id}/days/${d.id}`,
  }));

  const crewRows = crew ?? [];
  const crewSum = crewRows.reduce((s, c) => s + crewTotal(c), 0);
  const spent = costRows.reduce((s, c) => s + Number(c.amount), 0) + crewSum;
  const remaining = Number(project.total_budget) - spent;
  const isAdmin = profile?.role === "admin";

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl">{project.name}</h1>
            <StatusBadge status={project.status} />
            {project.archived && (
              <Badge variant="outline">{t("project.archivedBadge")}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {project.client_name && <>{project.client_name} · </>}
            {project.start_date ? formatDate(project.start_date, locale) : "—"}
            {" → "}
            {project.end_date ? formatDate(project.end_date, locale) : "—"} ·{" "}
            {project.currency}
          </p>
          {project.description && (
            <p className="max-w-2xl text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${project.id}/edit`}>{t("common.edit")}</Link>
          </Button>
          <ArchiveProjectButton projectId={project.id} archived={project.archived} />
          {isAdmin && (
            <DeleteProjectButton
              projectId={project.id}
              projectName={project.name}
            />
          )}
        </div>
      </div>

      {/* Budget summary */}
      <div className="grid gap-px border bg-border sm:grid-cols-4">
        {[
          [t("budget.budget"), formatMoney(Number(project.total_budget), project.currency, locale)],
          [t("budget.spent"), formatMoney(spent, project.currency, locale)],
          [
            t("budget.remaining"),
            formatMoney(remaining, project.currency, locale),
            remaining < 0,
          ],
        ].map(([label, value, danger]) => (
          <div key={label as string} className="bg-background p-4">
            <p className="text-xs tracking-widest text-muted-foreground">
              {(label as string).toUpperCase()}
            </p>
            <p
              className={`mt-1 text-xl ${danger ? "font-bold text-destructive" : ""}`}
            >
              {value as string}
            </p>
          </div>
        ))}
        <div className="flex flex-col justify-center bg-background p-4">
          <BudgetBar
            budget={Number(project.total_budget)}
            spent={spent}
            currency={project.currency}
          />
        </div>
      </div>

      <Tabs defaultValue={tab === "days" || tab === "documents" ? tab : "finance"}>
        <TabsList>
          <TabsTrigger value="finance">{t("project.tabFinance")}</TabsTrigger>
          <TabsTrigger value="documents">{t("project.tabDocuments")}</TabsTrigger>
          <TabsTrigger value="days">{t("project.tabDays")}</TabsTrigger>
        </TabsList>
        <TabsContent value="finance" className="space-y-10 pt-6">
          <div className="flex flex-wrap justify-end gap-2">
            <Button size="sm" asChild>
              <a href={`/api/finance-pdf?project=${project.id}&lang=${locale}`}>
                {t("costs.exportAll")}
              </a>
            </Button>
            <ExportButtons
              projectName={project.name}
              currency={project.currency}
              budget={Number(project.total_budget)}
              costs={costRows}
              crew={crewRows}
            />
          </div>
          <CostsTable
            projectId={project.id}
            currency={project.currency}
            costs={costRows}
            categories={categories ?? []}
            crewTotal={crewSum}
          />
          <CrewTable
            projectId={project.id}
            currency={project.currency}
            crew={crewRows}
            directory={directory ?? []}
          />
        </TabsContent>
        <TabsContent value="documents" className="space-y-6 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-2xl">{t("docs.title")}</h3>
            <div className="flex gap-2">
              <ReceiptDialog
                projectId={project.id}
                currency={project.currency}
                triggerLabel={t("docs.newReceipt")}
                triggerVariant="outline"
              />
              <InvoiceDialog
                projectId={project.id}
                currency={project.currency}
                clientName={project.client_name}
                triggerLabel={t("docs.newInvoice")}
              />
            </div>
          </div>
          <DocumentsTable documents={docRows} projectId={project.id} />
        </TabsContent>
        <TabsContent value="days" className="space-y-8 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-2xl">{t("days.title")}</h3>
            <div className="flex flex-wrap gap-2">
              <CopyLinkButton
                path={`/print/schedule/${project.id}?key=${project.share_key}&lang=${locale}`}
                label={t("days.copyScheduleLink")}
              />
              <Button variant="outline" size="sm" asChild>
                <a href={`/api/schedule-pdf?project=${project.id}&lang=${locale}`}>{t("days.schedulePdf")}</a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`/api/booklet-pdf?project=${project.id}&lang=${locale}`}>{t("days.bookletPdf")}</a>
              </Button>
              <DayDialog projectId={project.id} triggerLabel={t("days.add")} />
            </div>
          </div>

          {dayRows.length === 0 ? (
            <div className="viewfinder mx-auto max-w-xl p-10 text-center">
              <span className="vf absolute inset-0" />
              <h2 className="text-2xl">{t("days.emptyTitle")}</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {t("days.emptyBody")}
              </p>
            </div>
          ) : (
            <div className="divide-y border">
              {dayRows.map((d) => (
                <Link
                  key={d.id}
                  href={`/projects/${project.id}/days/${d.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-secondary"
                >
                  <div>
                    <p className="font-bold">
                      {formatDate(d.day_date, locale)}
                      {d.title ? ` — ${d.title}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {d.locations.map((l) => l.name).filter(Boolean).join(" · ") ||
                        t("days.noLocations")}
                    </p>
                  </div>
                  <Badge variant={d.day_type === "shoot" ? "default" : "outline"}>
                    {tDay(d.day_type)}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          <ProductionCalendar
            entries={calendarEntries}
            month={calMonth}
            view={calview === "week" ? "week" : "month"}
            navHref={(m, v) =>
              `/projects/${project.id}?tab=days&cal=${m}&calview=${v}`
            }
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
