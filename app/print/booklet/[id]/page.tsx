import Image from "next/image";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { CallSheetSheet, ShotListSheet } from "@/components/production/day-sheets";
import { PrintButton } from "@/components/documents/print-button";
import { formatDate, formatMoney, type Currency } from "@/lib/format";
import {
  dayTypeLabel,
  sheetLabel,
  type CallSheet,
  type ProductionDay,
  type SheetLang,
  type Shot,
} from "@/lib/production";

export const dynamic = "force-dynamic";

interface ProjectRow {
  id: string;
  name: string;
  client_name: string;
  status: string;
  currency: Currency;
  start_date: string | null;
  end_date: string | null;
  client_logo_path: string | null;
}

export default async function PrintBookletPage({
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

  const supabase = createAdminClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, client_name, status, currency, start_date, end_date, client_logo_path")
    .eq("id", id)
    .eq("share_key", key)
    .single<ProjectRow>();
  if (!project) notFound();

  const { data: days } = await supabase
    .from("production_days")
    .select("*")
    .eq("project_id", id)
    .order("day_date")
    .returns<ProductionDay[]>();

  const dayIds = (days ?? []).map((d) => d.id);
  const [{ data: allShots }, { data: allCallSheets }] = await Promise.all([
    supabase
      .from("shots")
      .select("*")
      .in("production_day_id", dayIds.length ? dayIds : ["-"])
      .order("sort_order")
      .returns<Shot[]>(),
    supabase
      .from("call_sheets")
      .select("*")
      .in("production_day_id", dayIds.length ? dayIds : ["-"])
      .returns<CallSheet[]>(),
  ]);

  const clientLogoUrl = project.client_logo_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/client-logos/${project.client_logo_path}`
    : undefined;

  const dir = sheetLang === "ar" ? "rtl" : "ltr";

  return (
    <main className="min-h-screen bg-black/90 py-8 print:bg-transparent print:py-0">
      <div className="mx-auto mb-6 flex w-full max-w-[190mm] justify-end px-4 print:hidden">
        <PrintButton />
      </div>

      <div className="mx-auto w-full max-w-[190mm] space-y-8 print:space-y-0">
        {/* ============ COVER · production overview ============ */}
        <div
          dir={dir}
          lang={sheetLang}
          className="relative flex min-h-[60vh] w-full flex-col justify-between bg-black p-5 text-[#F5F0E8] shadow-2xl sm:p-10 print:min-h-[257mm] print:break-after-page print:shadow-none"
        >
          <div className="flex items-start justify-between gap-6">
            <Image
              src="/brand/logo-dark.png"
              alt="Moments Productions"
              width={1200}
              height={436}
              className="h-12 w-auto"
              priority
            />
            {clientLogoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clientLogoUrl}
                alt=""
                className="h-12 w-44 bg-[#F5F0E8] object-contain p-1.5"
              />
            )}
          </div>
          <div className="py-16">
            <p className="text-xs tracking-[0.3em] text-[#F5F0E8]/60">
              {sheetLabel("overview", sheetLang).toUpperCase()}
            </p>
            <h1 className="mt-3 text-6xl leading-none">{project.name}</h1>
          </div>
          <dl className="grid grid-cols-2 gap-6 border-t border-[#F5F0E8]/25 pt-6 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-[10px] tracking-[0.25em] text-[#F5F0E8]/60">
                {sheetLabel("client", sheetLang)}
              </dt>
              <dd className="mt-1">{project.client_name || "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.25em] text-[#F5F0E8]/60">
                {sheetLabel("dates", sheetLang)}
              </dt>
              <dd className="mt-1">
                {project.start_date ? formatDate(project.start_date, sheetLang) : "—"}
                {" → "}
                {project.end_date ? formatDate(project.end_date, sheetLang) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.25em] text-[#F5F0E8]/60">
                {sheetLabel("days_count", sheetLang)}
              </dt>
              <dd className="mt-1">{(days ?? []).length}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.25em] text-[#F5F0E8]/60">
                {sheetLabel("status_l", sheetLang)}
              </dt>
              <dd className="mt-1 uppercase">{project.status.replace("_", "-")}</dd>
            </div>
          </dl>
        </div>

        {/* ============ SCHEDULE ============ */}
        <div
          dir={dir}
          lang={sheetLang}
          className="relative w-full bg-[#F5F0E8] p-5 text-black shadow-2xl sm:p-10 print:min-h-[277mm] print:break-after-page print:shadow-none"
        >
          <h2 className="text-4xl">{sheetLabel("schedule_title", sheetLang)}</h2>
          <table className="mt-8 w-full text-sm">
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
        </div>

        {/* ============ PER DAY · call sheet + shot list ============ */}
        {(days ?? []).map((day) => {
          const callSheet = (allCallSheets ?? []).find(
            (c) => c.production_day_id === day.id
          );
          const shots = (allShots ?? []).filter(
            (s) => s.production_day_id === day.id
          );
          return (
            <div key={day.id} className="space-y-8 print:space-y-0">
              {callSheet && (
                <div className="shadow-2xl print:break-after-page print:shadow-none">
                  <CallSheetSheet
                    day={day}
                    callSheet={callSheet}
                    projectName={project.name}
                    lang={sheetLang}
                    clientLogoUrl={clientLogoUrl}
                  />
                </div>
              )}
              {shots.length > 0 && (
                <div className="shadow-2xl print:break-after-page print:shadow-none">
                  <ShotListSheet
                    day={day}
                    shots={shots}
                    projectName={project.name}
                    lang={sheetLang}
                    clientLogoUrl={clientLogoUrl}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
