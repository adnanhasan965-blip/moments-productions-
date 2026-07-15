# Moments Productions

Public marketing site + internal production-management app for Moments
Productions (creative/film company, Kuwait).

- **Public homepage** (`/`) — bilingual EN/AR, work showreel, capabilities,
  clients, contact. No login required.
- **Team app** (`/dashboard`, behind login) — projects with budget/costs/crew,
  branded receipt & invoice PDFs, production days (shot lists, call sheets,
  calendar), booklet & finance PDFs, company settings.

## Stack

Next.js (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Supabase
(Postgres, Auth, Storage) · next-intl (EN/AR, RTL) · Puppeteer (branded PDFs)
· SheetJS (Excel/CSV export).

## Run locally

Requires Docker (via Colima) + the Supabase CLI.

```bash
colima start                 # container runtime
supabase start               # local Postgres + Auth + Storage
npm install
npm run dev                  # http://localhost:3000
```

`.env.local` (copy from `.env.example`) holds the Supabase URL + keys. For a
fresh database, run the schema in `supabase/migrations/0001_init.sql`.

## Accounts

Sign-up is disabled — only the accounts seeded by the team script can log in.
Copy `scripts/seed-users.example.mjs` to `scripts/seed-users.mjs`, fill in real
passwords, then:

```bash
node scripts/seed-users.mjs           # create/update accounts
node scripts/seed-users.mjs --prune   # also delete anyone not listed
```

New accounts default to `member`; set `role = 'admin'` in the `profiles` table
for admins (delete projects, manage users).

## Brand

Colors, fonts and the design system live in `app/globals.css` and the `/brand`
page. Three values only: black `#000000`, signal `#E50914`, cream `#F5F0E8`.
Type: Bebas Neue (display), JetBrains Mono (UI), Instrument Serif (editorial),
IBM Plex Sans Arabic (RTL).
