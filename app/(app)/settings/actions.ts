"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/app/(app)/projects/[id]/finance-actions";

export async function saveCrewMember(
  memberId: string | null,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const payload = {
    name: ((formData.get("name") as string) ?? "").trim(),
    default_role: ((formData.get("default_role") as string) ?? "").trim(),
    phone: ((formData.get("phone") as string) ?? "").trim(),
    email: ((formData.get("email") as string) ?? "").trim(),
    default_day_rate: Number(formData.get("default_day_rate")) || null,
  };
  if (!payload.name) return { error: "Name is required." };

  const { error } = memberId
    ? await supabase.from("crew_members").update(payload).eq("id", memberId)
    : await supabase.from("crew_members").insert(payload);
  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { done: true };
}

export async function deleteCrewMember(memberId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("crew_members")
    .delete()
    .eq("id", memberId);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

export async function updateCompanySettings(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("company_settings")
    .update({
      company_name: ((formData.get("company_name") as string) ?? "").trim(),
      payment_terms: ((formData.get("payment_terms") as string) ?? "").trim(),
      bank_account_name: ((formData.get("bank_account_name") as string) ?? "").trim(),
      bank_name: ((formData.get("bank_name") as string) ?? "").trim(),
      bank_branch: ((formData.get("bank_branch") as string) ?? "").trim(),
      bank_iban: ((formData.get("bank_iban") as string) ?? "").trim(),
      bank_account_number: ((formData.get("bank_account_number") as string) ?? "").trim(),
      bank_swift: ((formData.get("bank_swift") as string) ?? "").trim(),
      public_email: ((formData.get("public_email") as string) ?? "").trim(),
      public_phone: ((formData.get("public_phone") as string) ?? "").trim(),
      public_phone_2: ((formData.get("public_phone_2") as string) ?? "").trim(),
      instagram_url: ((formData.get("instagram_url") as string) ?? "").trim(),
      youtube_url: ((formData.get("youtube_url") as string) ?? "").trim(),
      tiktok_url: ((formData.get("tiktok_url") as string) ?? "").trim(),
      linkedin_url: ((formData.get("linkedin_url") as string) ?? "").trim(),
      youtube_channel_id: ((formData.get("youtube_channel_id") as string) ?? "").trim(),
      showreel_youtube_id: ((formData.get("showreel_youtube_id") as string) ?? "").trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { done: true };
}
