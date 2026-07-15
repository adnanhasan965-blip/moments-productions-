"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/env";

export async function login(_prev: { error: string } | null, formData: FormData) {
  const email = ((formData.get("email") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";

  // If the deployment is missing its Supabase keys, fail with a clear
  // message on the form instead of crashing to a full-page server error.
  if (!SUPABASE_CONFIGURED) {
    return {
      error:
        "Sign-in isn't available yet — the site is missing its database configuration. Please contact the admin.",
    };
  }

  let success = false;
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    success = true;
  } catch {
    return { error: "Couldn't reach the server. Please try again in a moment." };
  }

  // redirect() throws internally, so keep it outside the try/catch.
  if (success) redirect("/dashboard");
  return { error: "Sign-in failed. Please try again." };
}

export async function logout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // ignore — sign the user out client-side regardless
  }
  redirect("/login");
}
