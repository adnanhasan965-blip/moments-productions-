import Image from "next/image";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { PrintButton } from "@/components/documents/print-button";
import { formatDate } from "@/lib/format";
import { dayTypeLabel, sheetLabel, type ProductionDay, type SheetLang } from "@/lib/production";

export const dynamic = "force-dynamic";

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

  const supabase = createAdminClient();
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

        <footer className="mt-16 border-t border-black/20 pt-4 text-center text-[10px] tracking-[0.3em] text-black/55">
          MOMENTS PRODUCTIONS · KUWAIT · THE WORLD
        </footer>
      </div>
    </main>
  );
}
