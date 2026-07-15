import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — server only. Bypasses RLS.
 * Used exclusively for the tokenized printable-document pages,
 * which authenticate via the document's share_key instead of a session.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
