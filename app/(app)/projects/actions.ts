"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ClientContact } from "@/lib/types";

export interface ProjectFormState {
  error?: string;
}

function parseContacts(formData: FormData): ClientContact[] {
  const names = formData.getAll("contact_name") as string[];
  const phones = formData.getAll("contact_phone") as string[];
  const emails = formData.getAll("contact_email") as string[];
  return names
    .map((name, i) => ({
      name: name.trim(),
      phone: (phones[i] ?? "").trim(),
      email: (emails[i] ?? "").trim(),
    }))
    .filter((c) => c.name || c.phone || c.email);
}

/** Upload a new client logo if provided; returns the storage path or null. */
async function uploadClientLogo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  formData: FormData
): Promise<{ path?: string | null; error?: string }> {
  if (formData.get("remove_client_logo") === "on") return { path: null };

  const file = formData.get("client_logo") as File | null;
  if (!file || file.size === 0) return {};

  const isSvg =
    file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");

  let uploadBody: Blob | Buffer = file;
  let contentType = file.type || "image/png";
  let ext = file.name.split(".").pop() || "png";

  // Trim transparent/solid borders so every logo fills the fixed box on
  // the sheets consistently (raster only; SVGs are already tight).
  if (!isSvg) {
    try {
      const sharp = (await import("sharp")).default;
      const input = Buffer.from(await file.arrayBuffer());
      const trimmed = await sharp(input)
        .trim()
        .png()
        .toBuffer();
      uploadBody = trimmed;
      contentType = "image/png";
      ext = "png";
    } catch {
      // sharp unavailable / undecodable — fall back to the original file
    }
  }

  const path = `logos/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("client-logos")
    .upload(path, uploadBody, { contentType, upsert: true });
  if (error) return { error: error.message };
  return { path };
}

function projectPayload(formData: FormData) {
  return {
    name: (formData.get("name") as string).trim(),
    client_name: ((formData.get("client_name") as string) ?? "").trim(),
    client_contacts: parseContacts(formData),
    description: ((formData.get("description") as string) ?? "").trim(),
    status: formData.get("status") as string,
    currency: formData.get("currency") as string,
    start_date: (formData.get("start_date") as string) || null,
    end_date: (formData.get("end_date") as string) || null,
    total_budget: Number(formData.get("total_budget") || 0),
  };
}

export async function createProject(
  _prev: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const logo = await uploadClientLogo(supabase, formData);
  if (logo.error) return { error: logo.error };

  const { data, error } = await supabase
    .from("projects")
    .insert({
      ...projectPayload(formData),
      ...(logo.path !== undefined ? { client_logo_path: logo.path } : {}),
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  redirect(`/projects/${data.id}`);
}

export async function updateProject(
  projectId: string,
  _prev: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const supabase = await createClient();

  const logo = await uploadClientLogo(supabase, formData);
  if (logo.error) return { error: logo.error };

  const { error } = await supabase
    .from("projects")
    .update({
      ...projectPayload(formData),
      ...(logo.path !== undefined ? { client_logo_path: logo.path } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function setProjectArchived(
  projectId: string,
  archived: boolean
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ archived, updated_at: new Date().toISOString() })
    .eq("id", projectId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath(`/projects/${projectId}`);
  if (archived) redirect("/dashboard");
}

export async function deleteProject(projectId: string): Promise<void> {
  const supabase = await createClient();
  // RLS restricts deletes to admins; surface nothing fancy here.
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
