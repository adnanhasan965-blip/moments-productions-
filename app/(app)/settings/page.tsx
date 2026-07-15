import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { SettingsForm } from "@/components/settings-form";
import { SettingsCrew } from "@/components/settings-crew";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import type { CrewMember, Project } from "@/lib/types";

export default async function SettingsPage() {
  const [t, locale] = await Promise.all([getTranslations(), getLocale()]);
  const supabase = await createClient();

  const [{ data: settings }, { data: directory }, { data: archived }] =
    await Promise.all([
      supabase.from("company_settings").select("*").eq("id", 1).single(),
      supabase.from("crew_members").select("*").order("name").returns<CrewMember[]>(),
      supabase
        .from("projects")
        .select("*")
        .eq("archived", true)
        .order("updated_at", { ascending: false })
        .returns<Project[]>(),
    ]);

  if (!settings) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-4xl">{t("settings.title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("settings.notFound")}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-14 px-6 py-10">
      <section className="space-y-6">
        <div>
          <h1 className="text-4xl">{t("settings.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("settings.subtitle")}
          </p>
        </div>
        <SettingsForm settings={settings} />
      </section>

      <SettingsCrew directory={directory ?? []} />

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl">{t("settings.archivedProjects")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("settings.archivedHint")}
          </p>
        </div>
        {(archived ?? []).length === 0 ? (
          <p className="border p-8 text-center text-sm text-muted-foreground">
            {t("settings.archivedEmpty")}
          </p>
        ) : (
          <div className="divide-y border">
            {(archived ?? []).map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-secondary"
              >
                <div>
                  <p className="font-bold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.client_name && <>{p.client_name} · </>}
                    {p.start_date ? formatDate(p.start_date, locale) : "—"}
                    {" → "}
                    {p.end_date ? formatDate(p.end_date, locale) : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={p.status} />
                  <Badge variant="outline">{t("project.archivedBadge")}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
