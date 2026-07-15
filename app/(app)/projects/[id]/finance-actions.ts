"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ActionState {
  error?: string;
  done?: boolean;
}

async function uploadReceipt(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  file: File
): Promise<{ path?: string; error?: string }> {
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${projectId}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from("receipts").upload(path, file);
  if (error) return { error: error.message };
  return { path };
}

/** Resolve category: existing id, or create the "new category" name. */
async function resolveCategory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  formData: FormData
): Promise<{ id?: string | null; error?: string }> {
  const categoryId = formData.get("category_id") as string;
  if (categoryId && categoryId !== "__new__") return { id: categoryId };

  const newName = ((formData.get("category_new") as string) ?? "").trim().toLowerCase();
  if (!newName) return { id: null };

  const { data: existing } = await supabase
    .from("cost_categories")
    .select("id")
    .eq("name", newName)
    .maybeSingle();
  if (existing) return { id: existing.id };

  const { data, error } = await supabase
    .from("cost_categories")
    .insert({ name: newName })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { id: data.id };
}

export async function saveCost(
  projectId: string,
  costId: string | null,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const category = await resolveCategory(supabase, formData);
  if (category.error) return { error: category.error };

  const payload: Record<string, unknown> = {
    project_id: projectId,
    category_id: category.id,
    description: ((formData.get("description") as string) ?? "").trim(),
    amount: Number(formData.get("amount") || 0),
    cost_date: (formData.get("cost_date") as string) || null,
    payment_status: (formData.get("payment_status") as string) || "unpaid",
    // keep legacy `paid` in sync for any old readers
    paid: formData.get("payment_status") === "paid" ? "paid" : "unpaid",
  };

  const file = formData.get("receipt") as File | null;
  if (file && file.size > 0) {
    const up = await uploadReceipt(supabase, projectId, file);
    if (up.error) return { error: up.error };
    payload.receipt_path = up.path;
  }

  const { error } = costId
    ? await supabase.from("costs").update(payload).eq("id", costId)
    : await supabase.from("costs").insert(payload);

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
  return { done: true };
}

export async function deleteCost(costId: string, projectId: string): Promise<void> {
  const supabase = await createClient();
  const { data: cost } = await supabase
    .from("costs")
    .select("receipt_path")
    .eq("id", costId)
    .single();

  const { error } = await supabase.from("costs").delete().eq("id", costId);
  if (error) throw new Error(error.message);

  if (cost?.receipt_path) {
    await supabase.storage.from("receipts").remove([cost.receipt_path]);
  }
  revalidatePath(`/projects/${projectId}`);
}

export async function setCostPaymentStatus(
  costId: string,
  projectId: string,
  status: "unpaid" | "partial" | "paid"
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("costs")
    .update({ payment_status: status, paid: status === "paid" ? "paid" : "unpaid" })
    .eq("id", costId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}`);
}

export async function saveProjectCrew(
  projectId: string,
  projectCrewId: string | null,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  // Resolve crew member: existing from directory, or create new global member.
  let crewMemberId = formData.get("crew_member_id") as string;
  if (!projectCrewId && (!crewMemberId || crewMemberId === "__new__")) {
    const name = ((formData.get("new_name") as string) ?? "").trim();
    if (!name) return { error: "Crew member name is required." };
    const { data, error } = await supabase
      .from("crew_members")
      .insert({
        name,
        default_role: ((formData.get("role") as string) ?? "").trim(),
        phone: ((formData.get("new_phone") as string) ?? "").trim(),
        email: ((formData.get("new_email") as string) ?? "").trim(),
        default_day_rate: Number(formData.get("rate") || 0) || null,
      })
      .select("id")
      .single();
    if (error) return { error: error.message };
    crewMemberId = data.id;
  }

  const payload = {
    role: ((formData.get("role") as string) ?? "").trim(),
    rate: Number(formData.get("rate") || 0),
    is_flat_fee: formData.get("is_flat_fee") === "on",
    days: Math.max(1, Number(formData.get("days") || 1)),
    payment_status: (formData.get("payment_status") as string) ?? "unpaid",
    amount_paid: Number(formData.get("amount_paid") || 0),
  };

  const { error } = projectCrewId
    ? await supabase.from("project_crew").update(payload).eq("id", projectCrewId)
    : await supabase.from("project_crew").insert({
        ...payload,
        project_id: projectId,
        crew_member_id: crewMemberId,
      });

  if (error) {
    if (error.code === "23505") {
      return { error: "This crew member is already on the project." };
    }
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  return { done: true };
}

export async function removeProjectCrew(
  projectCrewId: string,
  projectId: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_crew")
    .delete()
    .eq("id", projectCrewId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}`);
}
