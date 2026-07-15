import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Elevated server-only client for contexts with no user session — the
 * public homepage's settings read and the tokenized printable pages.
 *
 * Uses the service_role secret when it's set (bypasses RLS). When it isn't
 * (e.g. only the publishable key is configured), it falls back to the public
 * key so nothing crashes — RLS-restricted reads simply return no rows and
 * callers degrade gracefully.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_KEY;
  return createSupabaseClient(SUPABASE_URL, key, {
    auth: { persistSession: false },
  });
}
