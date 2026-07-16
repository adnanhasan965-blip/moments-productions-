-- Moment Production — initial schema
-- Run in Supabase SQL Editor (or `supabase db push`).

-- ============ ENUMS ============
create type project_status as enum ('planning', 'pre_production', 'shooting', 'post', 'delivered');
create type currency_code as enum ('KWD', 'SAR', 'USD');
create type payment_status as enum ('unpaid', 'partial', 'paid');
create type paid_status as enum ('unpaid', 'paid');
create type day_type as enum ('shoot', 'prep', 'post_deadline', 'delivery');
create type shot_status as enum ('not_shot', 'done');
create type document_type as enum ('receipt', 'invoice');
create type document_status as enum ('active', 'void');
create type user_role as enum ('admin', 'member');

-- ============ PROFILES ============
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role user_role not null default 'member',
  created_at timestamptz not null default now()
);

-- auto-create profile on signup/invite
create or replace function handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============ COMPANY SETTINGS (single row) ============
create table company_settings (
  id int primary key default 1 check (id = 1),
  company_name text not null default 'Moments Productions',
  bank_details text not null default '', -- legacy freeform (kept for old invoices)
  bank_account_name text not null default '',
  bank_name text not null default '',
  bank_branch text not null default '',
  bank_iban text not null default '',
  bank_account_number text not null default '',
  bank_swift text not null default '',
  payment_terms text not null default '',
  -- public marketing site
  public_email text not null default 'contact@momentskuwait.com',
  public_phone text not null default '+965 6588 8826',
  public_phone_2 text not null default '+966 5800 87902',
  instagram_url text not null default 'https://instagram.com/momentskuwait',
  youtube_url text not null default '',
  tiktok_url text not null default '',
  linkedin_url text not null default '',
  youtube_channel_id text not null default '', -- auto-updates Latest work via RSS
  showreel_youtube_id text not null default '7aHIF6F-M-s',
  receipt_prefix text not null default 'MP-RCT-',
  invoice_prefix text not null default 'MP-INV-',
  next_receipt_number int not null default 1,
  next_invoice_number int not null default 1,
  updated_at timestamptz not null default now()
);
insert into company_settings (id) values (1);

-- ============ PROJECTS ============
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_name text not null default '',
  client_contacts jsonb not null default '[]', -- [{name, phone, email}]
  description text not null default '',
  status project_status not null default 'planning',
  currency currency_code not null default 'KWD',
  start_date date,
  end_date date,
  total_budget numeric(14,3) not null default 0,
  client_logo_path text, -- storage path in client-logos bucket; shown on day PDFs only
  archived boolean not null default false, -- archived projects hide from dashboard; listed in settings
  share_key uuid not null default gen_random_uuid(), -- schedule share/PDF page
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ FINANCE ============
create table cost_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

insert into cost_categories (name, is_default) values
  ('equipment', true), ('locations', true), ('crew', true),
  ('transport', true), ('catering', true), ('post-production', true), ('other', true);

create table costs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  category_id uuid references cost_categories (id) on delete set null,
  description text not null default '',
  amount numeric(14,3) not null default 0,
  cost_date date,
  paid paid_status not null default 'unpaid', -- legacy; kept in sync with payment_status
  payment_status payment_status not null default 'unpaid',
  receipt_path text, -- Supabase Storage path
  created_at timestamptz not null default now()
);

create table crew_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  default_role text not null default '',
  phone text not null default '',
  email text not null default '',
  default_day_rate numeric(14,3),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table project_crew (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  crew_member_id uuid not null references crew_members (id) on delete cascade,
  role text not null default '',
  rate numeric(14,3) not null default 0,
  is_flat_fee boolean not null default false,
  days int not null default 1,
  payment_status payment_status not null default 'unpaid',
  amount_paid numeric(14,3) not null default 0,
  created_at timestamptz not null default now(),
  unique (project_id, crew_member_id)
);

-- ============ PRODUCTION DAYS ============
create table production_days (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  day_date date not null,
  day_type day_type not null default 'shoot',
  title text not null default '',
  locations jsonb not null default '[]', -- [{name, address, map_link}]
  notes text not null default '',
  share_key uuid not null default gen_random_uuid(), -- shot list / call sheet share pages
  created_at timestamptz not null default now()
);

create table shots (
  id uuid primary key default gen_random_uuid(),
  production_day_id uuid not null references production_days (id) on delete cascade,
  sort_order int not null default 0,
  shot_number text not null default '',
  scene text not null default '',
  description text not null default '',
  shot_size text not null default '', -- WS/MS/CU/ECU/OTS...
  camera_notes text not null default '',
  location text not null default '',
  cast_subjects text not null default '',
  planned_time time, -- scheduled time of day for the shot
  estimated_minutes int,
  status shot_status not null default 'not_shot',
  created_at timestamptz not null default now()
);

create table call_sheets (
  id uuid primary key default gen_random_uuid(),
  production_day_id uuid not null references production_days (id) on delete cascade unique,
  general_call_time time,
  day_number int,
  total_days int,
  weather_note text not null default '',
  key_contacts jsonb not null default '[]',   -- [{role, name, phone}]
  schedule jsonb not null default '[]',       -- [{time, activity}]
  crew_calls jsonb not null default '[]',     -- [{project_crew_id, name, role, call_time}]
  cast_list jsonb not null default '[]',      -- [{name, role, call_time}]
  notes text not null default '',             -- safety, parking, meals
  updated_at timestamptz not null default now()
);

-- ============ DOCUMENTS (receipts & invoices) ============
create table documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  doc_type document_type not null,
  doc_number text not null unique, -- e.g. MP-RCT-0001
  status document_status not null default 'active',
  language text not null default 'en', -- language it was generated in
  snapshot jsonb not null default '{}', -- full data at generation time
  pdf_path text, -- Supabase Storage path
  share_key uuid not null default gen_random_uuid(), -- printable-page token
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

-- Atomically claim the next document number.
create or replace function next_document_number(p_type document_type)
returns text
language plpgsql security definer set search_path = public as $$
declare
  n int;
  prefix text;
begin
  if p_type = 'receipt' then
    update company_settings set next_receipt_number = next_receipt_number + 1, updated_at = now()
      where id = 1 returning next_receipt_number - 1, receipt_prefix into n, prefix;
  else
    update company_settings set next_invoice_number = next_invoice_number + 1, updated_at = now()
      where id = 1 returning next_invoice_number - 1, invoice_prefix into n, prefix;
  end if;
  return prefix || lpad(n::text, 4, '0');
end;
$$;

-- ============ RLS ============
-- Internal tool: any authenticated team member can read/write;
-- deleting projects and managing users is restricted to admins.

create or replace function is_admin()
returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

alter table profiles enable row level security;
create policy "team reads profiles" on profiles for select to authenticated using (true);
create policy "self or admin updates profile" on profiles for update to authenticated
  using (id = auth.uid() or is_admin());

alter table company_settings enable row level security;
create policy "team reads settings" on company_settings for select to authenticated using (true);
create policy "team updates settings" on company_settings for update to authenticated using (true);

alter table projects enable row level security;
create policy "team reads projects" on projects for select to authenticated using (true);
create policy "team inserts projects" on projects for insert to authenticated with check (true);
create policy "team updates projects" on projects for update to authenticated using (true);
create policy "admin deletes projects" on projects for delete to authenticated using (is_admin());

-- Full team access on the rest.
do $$
declare t text;
begin
  foreach t in array array['cost_categories','costs','crew_members','project_crew',
                           'production_days','shots','call_sheets','documents']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "team all" on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end;
$$;

-- ============ GRANTS ============
-- RLS is the security layer; these table-level grants make the tables
-- reachable at all for the app roles.
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated, service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
grant execute on all functions in schema public to authenticated, service_role;
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated, service_role;

-- ============ PUBLIC SITE VIEW ============
-- Exposes ONLY the public marketing columns of company_settings to anon
-- (no bank details / numbering), so the public homepage can read them with
-- the publishable key. Runs as owner, bypassing company_settings RLS.
create or replace view public.public_site_settings as
select
  public_email, public_phone, public_phone_2,
  instagram_url, youtube_url, tiktok_url, linkedin_url,
  youtube_channel_id, showreel_youtube_id
from public.company_settings
where id = 1;

grant select on public.public_site_settings to anon, authenticated;

-- ============ STORAGE ============
-- Buckets: receipts (cost attachments), documents (generated PDFs)
insert into storage.buckets (id, name, public) values
  ('receipts', 'receipts', false),
  ('documents', 'documents', false),
  ('client-logos', 'client-logos', true) -- public: rendered on printable day sheets
on conflict (id) do nothing;

create policy "public reads client logos" on storage.objects for select
  using (bucket_id = 'client-logos');
create policy "team writes client logos" on storage.objects for insert to authenticated
  with check (bucket_id = 'client-logos');
create policy "team deletes client logos" on storage.objects for delete to authenticated
  using (bucket_id = 'client-logos');

create policy "team reads receipts" on storage.objects for select to authenticated
  using (bucket_id in ('receipts', 'documents'));
create policy "team writes receipts" on storage.objects for insert to authenticated
  with check (bucket_id in ('receipts', 'documents'));
create policy "team deletes receipts" on storage.objects for delete to authenticated
  using (bucket_id in ('receipts', 'documents'));
-- upsert (PDF regeneration, logo replacement) needs UPDATE as well as INSERT
create policy "team updates files" on storage.objects for update to authenticated
  using (bucket_id in ('receipts', 'documents', 'client-logos'))
  with check (bucket_id in ('receipts', 'documents', 'client-logos'));
