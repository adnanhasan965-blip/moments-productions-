import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CallSheetSheet, ShotListSheet } from "@/components/production/day-sheets";
import { PrintButton } from "@/components/documents/print-button";
import type { CallSheet, ProductionDay, SheetLang, Shot } from "@/lib/production";

export const dynamic = "force-dynamic";

export default async function PrintDayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ key?: string; view?: string; lang?: string }>;
}) {
  const { id } = await params;
  const { key, view, lang } = await searchParams;
  if (!key) notFound();

  const supabase = await createClient();
  const { data: day } = await supabase
    .from("production_days")
    .select("*")
    .eq("id", id)
    .eq("share_key", key)
    .single<ProductionDay>();
  if (!day) notFound();

  const [{ data: project }, { data: shots }, { data: callSheet }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("name, client_logo_path")
        .eq("id", day.project_id)
        .single(),
      supabase
        .from("shots")
        .select("*")
        .eq("production_day_id", id)
        .order("sort_order")
        .returns<Shot[]>(),
      supabase
        .from("call_sheets")
        .select("*")
        .eq("production_day_id", id)
        .maybeSingle<CallSheet>(),
    ]);

  const projectName = project?.name ?? "";
  const clientLogoUrl = project?.client_logo_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/client-logos/${project.client_logo_path}`
    : undefined;
  const showCall = view === "call";
  const sheetLang: SheetLang = lang === "ar" ? "ar" : "en";

  const effectiveCallSheet: CallSheet = callSheet ?? {
    id: "",
    production_day_id: day.id,
    general_call_time: null,
    day_number: null,
    total_days: null,
    weather_note: "",
    key_contacts: [],
    schedule: [],
    crew_calls: [],
    cast_list: [],
    notes: "",
  };

  return (
    <main className="min-h-screen bg-black/90 py-8 print:bg-transparent print:py-0">
      <div className="mx-auto mb-6 flex w-full max-w-[190mm] justify-end px-4 print:hidden">
        <PrintButton />
      </div>
      <div className="shadow-2xl print:shadow-none">
        {showCall ? (
          <CallSheetSheet day={day} callSheet={effectiveCallSheet} projectName={projectName} lang={sheetLang} clientLogoUrl={clientLogoUrl} />
        ) : (
          <ShotListSheet day={day} shots={shots ?? []} projectName={projectName} lang={sheetLang} clientLogoUrl={clientLogoUrl} />
        )}
      </div>
    </main>
  );
}
