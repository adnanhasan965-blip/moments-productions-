import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CallSheetForm } from "@/components/production/call-sheet-form";
import { DayDialog } from "@/components/production/day-dialog";
import { DeleteDayButton } from "@/components/production/delete-day-button";
import { ShotDialog } from "@/components/production/shot-dialog";
import { ShotsTable } from "@/components/production/shots-table";
import { TodoDialog } from "@/components/production/todo-dialog";
import { TodosTable } from "@/components/production/todos-table";
import { CopyLinkButton } from "@/components/copy-link-button";
import { getLocale, getTranslations } from "next-intl/server";
import { formatDate } from "@/lib/format";
import {
  isTodoDayType,
  type CallSheet,
  type ProductionDay,
  type Shot,
  type TodoItem,
} from "@/lib/production";
import type { ProjectCrewRow } from "@/lib/types";

export default async function DayPage({
  params,
}: {
  params: Promise<{ id: string; dayId: string }>;
}) {
  const { id: projectId, dayId } = await params;
  const [t, locale] = await Promise.all([getTranslations(), getLocale()]);
  const supabase = await createClient();

  const [{ data: day }, { data: project }] = await Promise.all([
    supabase
      .from("production_days")
      .select("*")
      .eq("id", dayId)
      .single<ProductionDay>(),
    supabase.from("projects").select("name").eq("id", projectId).single(),
  ]);

  if (!day || day.project_id !== projectId) notFound();

  const todoDay = isTodoDayType(day.day_type);

  // Non-shoot days (prep / post / delivery): one to-do list per day type,
  // shared by every day of that type in the project.
  const { data: todos } = todoDay
    ? await supabase
        .from("project_todos")
        .select("*")
        .eq("project_id", projectId)
        .eq("day_type", day.day_type)
        .order("sort_order")
        .returns<TodoItem[]>()
    : { data: null };

  const [{ data: shots }, { data: callSheet }, { data: crew }] = todoDay
    ? [{ data: null }, { data: null }, { data: null }]
    : await Promise.all([
        supabase
          .from("shots")
          .select("*")
          .eq("production_day_id", dayId)
          .order("sort_order")
          .returns<Shot[]>(),
        supabase
          .from("call_sheets")
          .select("*")
          .eq("production_day_id", dayId)
          .maybeSingle<CallSheet>(),
        supabase
          .from("project_crew")
          .select("role, crew_members(name, phone, default_role)")
          .eq("project_id", projectId)
          .returns<Pick<ProjectCrewRow, "role" | "crew_members">[]>(),
      ]);

  const crewPrefill = (crew ?? []).map((c) => ({
    name: c.crew_members.name,
    role: c.role || c.crew_members.default_role,
    phone: c.crew_members.phone,
    call_time: "",
  }));

  const shotsPrint = `/print/day/${day.id}?key=${day.share_key}&view=shots&lang=${locale}`;
  const callPrint = `/print/day/${day.id}?key=${day.share_key}&view=call&lang=${locale}`;
  const todoPrint = `/print/day/${day.id}?key=${day.share_key}&view=todo&lang=${locale}`;

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            <Link href={`/projects/${projectId}?tab=days`} className="underline">
              {project?.name}
            </Link>
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl">{formatDate(day.day_date, locale)}</h1>
            <Badge variant="outline">{t(`dayType.${day.day_type}`)}</Badge>
          </div>
          {day.title && <p className="text-muted-foreground">{day.title}</p>}
          {day.locations.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {day.locations.map((l, i) => (
                <span key={i}>
                  {i > 0 && " · "}
                  {l.map_link ? (
                    <a href={l.map_link} target="_blank" rel="noreferrer" className="underline">
                      {l.name}
                    </a>
                  ) : (
                    l.name
                  )}
                </span>
              ))}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <DayDialog
            projectId={projectId}
            day={day}
            triggerLabel={t("days.editDay")}
            triggerVariant="outline"
          />
          <DeleteDayButton dayId={day.id} projectId={projectId} />
        </div>
      </div>

      {todoDay ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl">{t("todos.title")}</h2>
              <p className="text-xs text-muted-foreground">
                {t("todos.sharedNote", { type: t(`dayType.${day.day_type}`) })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <CopyLinkButton path={todoPrint} label={t("shots.copyShareLink")} />
              <Button variant="outline" size="sm" asChild>
                <a href={`/api/day-pdf?day=${day.id}&view=todo&lang=${locale}`}>
                  {t("shots.downloadPdf")}
                </a>
              </Button>
              <TodoDialog
                projectId={projectId}
                dayType={day.day_type}
                triggerLabel={t("todos.add")}
              />
            </div>
          </div>
          <TodosTable
            todos={todos ?? []}
            projectId={projectId}
            dayType={day.day_type}
          />
        </section>
      ) : (
        <Tabs defaultValue="shots">
          <TabsList>
            <TabsTrigger value="shots">{t("shots.title")}</TabsTrigger>
            <TabsTrigger value="call">{t("callSheet.title")}</TabsTrigger>
          </TabsList>

          <TabsContent value="shots" className="space-y-4 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl">{t("shots.title")}</h2>
              <div className="flex flex-wrap gap-2">
                <CopyLinkButton path={shotsPrint} label={t("shots.copyShareLink")} />
                <Button variant="outline" size="sm" asChild>
                  <a href={`/api/day-pdf?day=${day.id}&view=shots&lang=${locale}`}>{t("shots.downloadPdf")}</a>
                </Button>
                <ShotDialog
                  dayId={day.id}
                  projectId={projectId}
                  triggerLabel={t("shots.add")}
                />
              </div>
            </div>
            <ShotsTable shots={shots ?? []} dayId={day.id} projectId={projectId} />
          </TabsContent>

          <TabsContent value="call" className="space-y-4 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl">{t("callSheet.title")}</h2>
              <div className="flex flex-wrap gap-2">
                <CopyLinkButton path={callPrint} label={t("shots.copyShareLink")} />
                <Button variant="outline" size="sm" asChild>
                  <a href={`/api/day-pdf?day=${day.id}&view=call&lang=${locale}`}>{t("shots.downloadPdf")}</a>
                </Button>
              </div>
            </div>
            {!callSheet && (
              <p className="text-sm text-muted-foreground">
                {t("callSheet.firstSave")}
              </p>
            )}
            <CallSheetForm
              dayId={day.id}
              projectId={projectId}
              callSheet={callSheet}
              projectCrew={crewPrefill}
            />
          </TabsContent>
        </Tabs>
      )}
    </main>
  );
}
