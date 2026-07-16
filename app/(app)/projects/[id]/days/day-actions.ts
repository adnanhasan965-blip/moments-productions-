"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/app/(app)/projects/[id]/finance-actions";
import { normalizeTime } from "@/lib/time";
import type { DayLocation } from "@/lib/production";

function parseLocations(formData: FormData): DayLocation[] {
  const names = formData.getAll("location_name") as string[];
  const links = formData.getAll("location_link") as string[];
  return names
    .map((name, i) => ({ name: name.trim(), map_link: (links[i] ?? "").trim() }))
    .filter((l) => l.name || l.map_link);
}

export async function saveDay(
  projectId: string,
  dayId: string | null,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const payload = {
    project_id: projectId,
    day_date: formData.get("day_date") as string,
    day_type: formData.get("day_type") as string,
    title: ((formData.get("title") as string) ?? "").trim(),
    locations: parseLocations(formData),
    notes: ((formData.get("notes") as string) ?? "").trim(),
  };
  if (!payload.day_date) return { error: "Date is required." };

  const { error } = dayId
    ? await supabase.from("production_days").update(payload).eq("id", dayId)
    : await supabase.from("production_days").insert(payload);
  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
  if (dayId) revalidatePath(`/projects/${projectId}/days/${dayId}`);
  return { done: true };
}

export async function deleteDay(dayId: string, projectId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("production_days").delete().eq("id", dayId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}?tab=days`);
}

// ---------- shots ----------

export async function saveShot(
  dayId: string,
  projectId: string,
  shotId: string | null,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {
    production_day_id: dayId,
    shot_number: ((formData.get("shot_number") as string) ?? "").trim(),
    scene: ((formData.get("scene") as string) ?? "").trim(),
    description: ((formData.get("description") as string) ?? "").trim(),
    shot_size: ((formData.get("shot_size") as string) ?? "").trim(),
    camera_notes: ((formData.get("camera_notes") as string) ?? "").trim(),
    location: ((formData.get("location") as string) ?? "").trim(),
    cast_subjects: ((formData.get("cast_subjects") as string) ?? "").trim(),
    planned_time: normalizeTime((formData.get("planned_time") as string) ?? "") || null,
    estimated_minutes: Number(formData.get("estimated_minutes")) || null,
  };

  if (!shotId) {
    const { data: last } = await supabase
      .from("shots")
      .select("sort_order")
      .eq("production_day_id", dayId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    payload.sort_order = (last?.sort_order ?? 0) + 1;
  }

  const { error } = shotId
    ? await supabase.from("shots").update(payload).eq("id", shotId)
    : await supabase.from("shots").insert(payload);
  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}/days/${dayId}`);
  return { done: true };
}

export async function duplicateShot(
  shotId: string,
  dayId: string,
  projectId: string
): Promise<void> {
  const supabase = await createClient();
  const { data: shot } = await supabase
    .from("shots")
    .select("*")
    .eq("id", shotId)
    .single();
  if (!shot) throw new Error("Shot not found");

  const { id: _id, created_at: _c, ...rest } = shot;
  const { error } = await supabase.from("shots").insert({
    ...rest,
    sort_order: Number(shot.sort_order) + 1,
    status: "not_shot",
  });
  if (error) throw new Error(error.message);

  // shift subsequent shots down
  const { data: after } = await supabase
    .from("shots")
    .select("id, sort_order")
    .eq("production_day_id", dayId)
    .gt("sort_order", shot.sort_order)
    .neq("id", shotId);
  for (const s of after ?? []) {
    await supabase
      .from("shots")
      .update({ sort_order: Number(s.sort_order) + 1 })
      .eq("id", s.id);
  }

  revalidatePath(`/projects/${projectId}/days/${dayId}`);
}

export async function deleteShot(
  shotId: string,
  dayId: string,
  projectId: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("shots").delete().eq("id", shotId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}/days/${dayId}`);
}

export async function toggleShotStatus(
  shotId: string,
  dayId: string,
  projectId: string,
  done: boolean
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("shots")
    .update({ status: done ? "done" : "not_shot" })
    .eq("id", shotId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}/days/${dayId}`);
}

export async function reorderShots(
  dayId: string,
  projectId: string,
  orderedIds: string[]
): Promise<void> {
  const supabase = await createClient();
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from("shots")
      .update({ sort_order: i + 1 })
      .eq("id", orderedIds[i])
      .eq("production_day_id", dayId);
  }
  revalidatePath(`/projects/${projectId}/days/${dayId}`);
}

// ---------- to-dos (prep / post / delivery days) ----------
// Todos are keyed by (project_id, day_type), not by day: every prep day of a
// project shares one list, so an edit made on any prep day is instantly on
// all of them. Same for post production and delivery.

/** Revalidate every day page of the project — the shared list shows on all
 *  days of its type. */
function revalidateProjectDays(projectId: string) {
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/[id]/days/[dayId]`, "page");
}

export async function saveTodo(
  projectId: string,
  dayType: string,
  todoId: string | null,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {
    project_id: projectId,
    day_type: dayType,
    title: ((formData.get("title") as string) ?? "").trim(),
    notes: ((formData.get("notes") as string) ?? "").trim(),
    priority: (formData.get("priority") as string) || "medium",
    due_date: (formData.get("due_date") as string) || null,
  };
  if (!payload.title) return { error: "Task is required." };

  if (!todoId) {
    const { data: last } = await supabase
      .from("project_todos")
      .select("sort_order")
      .eq("project_id", projectId)
      .eq("day_type", dayType)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    payload.sort_order = (last?.sort_order ?? 0) + 1;
  }

  const { error } = todoId
    ? await supabase.from("project_todos").update(payload).eq("id", todoId)
    : await supabase.from("project_todos").insert(payload);
  if (error) return { error: error.message };

  revalidateProjectDays(projectId);
  return { done: true };
}

export async function deleteTodo(
  todoId: string,
  projectId: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("project_todos").delete().eq("id", todoId);
  if (error) throw new Error(error.message);
  revalidateProjectDays(projectId);
}

export async function toggleTodoDone(
  todoId: string,
  projectId: string,
  done: boolean
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_todos")
    .update({ done })
    .eq("id", todoId);
  if (error) throw new Error(error.message);
  revalidateProjectDays(projectId);
}

export async function reorderTodos(
  projectId: string,
  dayType: string,
  orderedIds: string[]
): Promise<void> {
  const supabase = await createClient();
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from("project_todos")
      .update({ sort_order: i + 1 })
      .eq("id", orderedIds[i])
      .eq("project_id", projectId)
      .eq("day_type", dayType);
  }
  revalidateProjectDays(projectId);
}

// ---------- call sheet ----------

function parseJsonRows<T>(
  formData: FormData,
  fields: { form: string; key: keyof T }[]
): T[] {
  const columns = fields.map((f) => formData.getAll(f.form) as string[]);
  const count = Math.max(...columns.map((c) => c.length), 0);
  const rows: T[] = [];
  for (let i = 0; i < count; i++) {
    const row = {} as T;
    let hasValue = false;
    fields.forEach((f, j) => {
      let v = (columns[j][i] ?? "").trim();
      if (String(f.key).includes("time")) v = normalizeTime(v);
      row[f.key] = v as T[keyof T];
      if (v) hasValue = true;
    });
    if (hasValue) rows.push(row);
  }
  return rows;
}

export async function saveCallSheet(
  dayId: string,
  projectId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const payload = {
    production_day_id: dayId,
    general_call_time: normalizeTime((formData.get("general_call_time") as string) ?? "") || null,
    day_number: Number(formData.get("day_number")) || null,
    total_days: Number(formData.get("total_days")) || null,
    weather_note: ((formData.get("weather_note") as string) ?? "").trim(),
    key_contacts: parseJsonRows(formData, [
      { form: "contact_role", key: "role" },
      { form: "contact_name", key: "name" },
      { form: "contact_phone", key: "phone" },
    ]),
    locations: parseJsonRows(formData, [
      { form: "csloc_name", key: "name" },
      { form: "csloc_link", key: "link" },
    ]),
    schedule: parseJsonRows(formData, [
      { form: "schedule_time", key: "time" },
      { form: "schedule_activity", key: "activity" },
    ]),
    client_calls: parseJsonRows(formData, [
      { form: "client_name", key: "name" },
      { form: "client_role", key: "role" },
      { form: "client_phone", key: "phone" },
      { form: "client_call_time", key: "call_time" },
    ]),
    crew_calls: parseJsonRows(formData, [
      { form: "crew_name", key: "name" },
      { form: "crew_role", key: "role" },
      { form: "crew_phone", key: "phone" },
      { form: "crew_call_time", key: "call_time" },
    ]),
    cast_list: parseJsonRows(formData, [
      { form: "cast_name", key: "name" },
      { form: "cast_role", key: "role" },
      { form: "cast_call_time", key: "call_time" },
    ]),
    notes: ((formData.get("notes") as string) ?? "").trim(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("call_sheets")
    .upsert(payload, { onConflict: "production_day_id" });
  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}/days/${dayId}`);
  return { done: true };
}
