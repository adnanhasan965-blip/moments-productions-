/**
 * TEMPLATE — copy this file to `scripts/seed-users.mjs` (gitignored) and
 * fill in the real passwords there. Never commit real passwords.
 *
 * Team accounts — the ONLY people who can sign in.
 * Public sign-up is disabled (supabase/config.toml), so accounts exist
 * only if they are listed here and this script has been run.
 *
 * To add / remove / change a password in future: edit TEAM below, then run
 *   node scripts/seed-users.mjs
 * It creates missing accounts, updates passwords for existing ones, and
 * (with --prune) deletes any auth user not in this list.
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY (never commit real production keys).
 */
import { readFileSync } from "node:fs";

const TEAM = [
  { email: "abdullah@momentskuwait.com", password: "CHANGE_ME", name: "Abdullah", role: "admin" },
  { email: "mohammad@momentskuwait.com", password: "CHANGE_ME", name: "Mohammad", role: "admin" },
  { email: "adnan@momentskuwait.com", password: "CHANGE_ME", name: "Adnan", role: "admin" },
];

const prune = process.argv.includes("--prune");

// --- read env ---
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) throw new Error("Missing Supabase URL / service role key in .env.local");

const api = (path, init = {}) =>
  fetch(`${URL_}/auth/v1${path}`, {
    ...init,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });

async function listUsers() {
  const out = [];
  for (let page = 1; ; page++) {
    const r = await api(`/admin/users?page=${page}&per_page=200`);
    const { users } = await r.json();
    if (!users?.length) break;
    out.push(...users);
    if (users.length < 200) break;
  }
  return out;
}

const existing = await listUsers();
const byEmail = new Map(existing.map((u) => [u.email?.toLowerCase(), u]));

for (const m of TEAM) {
  const found = byEmail.get(m.email.toLowerCase());
  if (found) {
    await api(`/admin/users/${found.id}`, {
      method: "PUT",
      body: JSON.stringify({ password: m.password, email_confirm: true, user_metadata: { full_name: m.name } }),
    });
    console.log("updated", m.email);
  } else {
    const r = await api("/admin/users", {
      method: "POST",
      body: JSON.stringify({ email: m.email, password: m.password, email_confirm: true, user_metadata: { full_name: m.name } }),
    });
    console.log(r.ok ? "created" : "FAILED", m.email);
  }
}

if (prune) {
  const allowed = new Set(TEAM.map((m) => m.email.toLowerCase()));
  for (const u of existing) {
    if (!allowed.has(u.email?.toLowerCase())) {
      await api(`/admin/users/${u.id}`, { method: "DELETE" });
      console.log("pruned", u.email);
    }
  }
}

console.log("\nDone. Remember to also set each account's role to 'admin' in the profiles table if newly created.");
