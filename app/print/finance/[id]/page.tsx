import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "@/components/documents/print-button";
import { formatDate, formatMoney, type Currency } from "@/lib/format";
import { crewTotal, type Cost, type ProjectCrewRow } from "@/lib/types";
import { sheetLabel, type SheetLang } from "@/lib/production";

export const dynamic = "force-dynamic";

interface ProjectRow {
  id: string;
  name: string;
  client_name: string;
  currency: Currency;
  start_date: string | null;
  end_date: string | null;
  total_budget: number;
  client_logo_path: string | null;
}

function payLabel(status: string, lang: SheetLang): string {
  if (status === "paid") return sheetLabel("pay_paid", lang);
  if (status === "partial") return sheetLabel("pay_partial", lang);
  return sheetLabel("pay_unpaid", lang);
}

export default async function PrintFinancePage({
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
    .select(
      "id, name, client_name, currency, start_date, end_date, total_budget, client_logo_path"
    )
    .eq("id", id)
    .eq("share_key", key)
    .single<ProjectRow>();
  if (!project) notFound();

  const [{ data: costs }, { data: crew }] = await Promise.all([
    supabase
      .from("costs")
      .select("*, cost_categories(name)")
      .eq("project_id", id)
      .order("cost_date", { ascending: true, nullsFirst: false })
      .returns<Cost[]>(),
    supabase
      .from("project_crew")
      .select("*, crew_members(*)")
      .eq("project_id", id)
      .order("created_at")
      .returns<ProjectCrewRow[]>(),
  ]);

  const costRows = costs ?? [];
  const crewRows = crew ?? [];
  const costsTotal = costRows.reduce((s, c) => s + Number(c.amount), 0);
  const crewSum = crewRows.reduce((s, c) => s + crewTotal(c), 0);
  const spent = costsTotal + crewSum;
  const remaining = Number(project.total_budget) - spent;
  const loc = sheetLang;
  const money = (n: number) => formatMoney(n, project.currency, loc);

  const clientLogoUrl = project.client_logo_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/client-logos/${project.client_logo_path}`
    : undefined;

  return (
    <main className="min-h-screen bg-black/90 py-8 print:bg-transparent print:py-0">
      <div className="mx-auto mb-6 flex w-full max-w-[190mm] justify-end px-4 print:hidden">
        <PrintButton />
      </div>

      <div
        dir={sheetLang === "ar" ? "rtl" : "ltr"}
        lang={sheetLang}
        className="relative mx-auto w-full max-w-[190mm] bg-[#F5F0E8] p-5 text-black shadow-2xl sm:p-10 print:min-h-[277mm] print:w-[190mm] print:shadow-none"
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
            <p className="text-xs text-black/55">
              {project.client_name && <>{project.client_name} · </>}
              {project.start_date ? formatDate(project.start_date, loc) : "—"}
              {" → "}
              {project.end_date ? formatDate(project.end_date, loc) : "—"}
            </p>
          </div>
          <div className="text-end">
            <h1 className="text-4xl">{sheetLabel("finance", sheetLang)}</h1>
            {clientLogoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clientLogoUrl}
                alt=""
                className="ms-auto mt-3 h-12 w-44 object-contain object-right"
              />
            )}
          </div>
        </header>

        {/* budget strip */}
        <div className="viewfinder mt-10 flex flex-wrap items-center justify-between gap-6 p-6">
          <span className="vf absolute inset-0" />
          {(
            [
              ["budget_l", money(Number(project.total_budget)), false],
              ["spent_l", money(spent), false],
              ["remaining_l", money(remaining), remaining < 0],
            ] as const
          ).map(([labelKey, value, danger]) => (
            <div key={labelKey}>
              <p className="text-[10px] tracking-[0.25em] text-black/55">
                {sheetLabel(labelKey, sheetLang)}
              </p>
              <p
                className={`mt-1 text-2xl ${danger ? "text-[#E50914]" : ""}`}
                dir="ltr"
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* costs */}
        <section className="mt-10">
          <h2 className="mb-2 text-xl">{sheetLabel("costs_l", sheetLang)}</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-black text-[10px] tracking-[0.15em] text-black/55">
                <th className="py-2 pe-2 text-start">{sheetLabel("date", sheetLang)}</th>
                <th className="py-2 pe-2 text-start">{sheetLabel("category", sheetLang)}</th>
                <th className="py-2 pe-2 text-start">{sheetLabel("description", sheetLang)}</th>
                <th className="py-2 pe-2 text-end">{sheetLabel("amount_col", sheetLang)}</th>
                <th className="py-2 text-end">{sheetLabel("payment_col", sheetLang)}</th>
              </tr>
            </thead>
            <tbody>
              {costRows.map((c) => (
                <tr key={c.id} className="border-b border-black/15 align-top">
                  <td className="py-2 pe-2 whitespace-nowrap">
                    {c.cost_date ? formatDate(c.cost_date, loc) : "—"}
                  </td>
                  <td className="py-2 pe-2 uppercase text-xs pt-2.5">
                    {c.cost_categories?.name ?? "—"}
                  </td>
                  <td className="py-2 pe-2">{c.description}</td>
                  <td className="py-2 pe-2 text-end whitespace-nowrap" dir="ltr">
                    {money(Number(c.amount))}
                  </td>
                  <td className="py-2 text-end">{payLabel(c.payment_status, sheetLang)}</td>
                </tr>
              ))}
              {costRows.length === 0 && crewSum === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-black/55">
                    {sheetLabel("no_costs", sheetLang)}
                  </td>
                </tr>
              )}
              {crewSum > 0 && (
                <tr className="border-b border-black/15">
                  <td className="py-2 pe-2">—</td>
                  <td className="py-2 pe-2 uppercase text-xs pt-2.5">
                    {sheetLabel("crew_l", sheetLang)}
                  </td>
                  <td className="py-2 pe-2 text-black/55">
                    {sheetLabel("crew_rollup", sheetLang)}
                  </td>
                  <td className="py-2 pe-2 text-end whitespace-nowrap" dir="ltr">
                    {money(crewSum)}
                  </td>
                  <td />
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-black">
                <td colSpan={3} className="py-2 font-bold">
                  {sheetLabel("total_costs", sheetLang)}
                </td>
                <td className="py-2 pe-2 text-end font-bold whitespace-nowrap" dir="ltr">
                  {money(costsTotal + crewSum)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </section>

        {/* crew */}
        <section className="mt-10">
          <h2 className="mb-2 text-xl">{sheetLabel("crew_l", sheetLang)}</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-black text-[10px] tracking-[0.15em] text-black/55">
                <th className="py-2 pe-2 text-start">{sheetLabel("name", sheetLang)}</th>
                <th className="py-2 pe-2 text-start">{sheetLabel("role", sheetLang)}</th>
                <th className="py-2 pe-2 text-end">{sheetLabel("rate_col", sheetLang)}</th>
                <th className="py-2 pe-2 text-end">{sheetLabel("days_col", sheetLang)}</th>
                <th className="py-2 pe-2 text-end">{sheetLabel("total_col", sheetLang)}</th>
                <th className="py-2 text-end">{sheetLabel("payment_col", sheetLang)}</th>
              </tr>
            </thead>
            <tbody>
              {crewRows.map((c) => (
                <tr key={c.id} className="border-b border-black/15">
                  <td className="py-2 pe-2">{c.crew_members.name}</td>
                  <td className="py-2 pe-2">
                    {c.role || c.crew_members.default_role || "—"}
                  </td>
                  <td className="py-2 pe-2 text-end whitespace-nowrap" dir="ltr">
                    {money(Number(c.rate))}
                    {c.is_flat_fee && (
                      <span className="text-xs text-black/55">
                        {" "}
                        {sheetLabel("flat_fee", sheetLang)}
                      </span>
                    )}
                  </td>
                  <td className="py-2 pe-2 text-end">
                    {c.is_flat_fee ? "—" : c.days}
                  </td>
                  <td className="py-2 pe-2 text-end font-bold whitespace-nowrap" dir="ltr">
                    {money(crewTotal(c))}
                  </td>
                  <td className="py-2 text-end">
                    {payLabel(c.payment_status, sheetLang)}
                  </td>
                </tr>
              ))}
              {crewRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-black/55">
                    {sheetLabel("no_crew", sheetLang)}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-black">
                <td colSpan={4} className="py-2 font-bold">
                  {sheetLabel("crew_total", sheetLang)}
                </td>
                <td className="py-2 pe-2 text-end font-bold whitespace-nowrap" dir="ltr">
                  {money(crewSum)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </section>

        <footer className="mt-16 border-t border-black/20 pt-4 text-center text-[10px] tracking-[0.3em] text-black/55">
          MOMENTS PRODUCTIONS · KUWAIT · THE WORLD
        </footer>
      </div>
    </main>
  );
}
