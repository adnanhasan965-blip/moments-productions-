/**
 * Public Supabase config, shared by the browser + server clients.
 * Prefer the modern publishable key (`sb_publishable_…`); fall back to the
 * legacy anon key for compatibility. Both are safe to expose to the browser.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

/** True when the app has enough config to talk to Supabase. */
export const SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_KEY);
