-- To-do lists for non-shoot production days (prep / post production / delivery).
-- One list per (project, day_type): every prep day of a project shows the same
-- list, so a change made on any prep day is instantly on all of them. Same for
-- post production and delivery.

create type todo_priority as enum ('low', 'medium', 'high');

create table project_todos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  day_type day_type not null,
  sort_order int not null default 0,
  title text not null,
  notes text not null default '',
  priority todo_priority not null default 'medium',
  due_date date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index project_todos_list_idx on project_todos (project_id, day_type, sort_order);

alter table project_todos enable row level security;
create policy "team all" on project_todos for all to authenticated
  using (true) with check (true);

grant select, insert, update, delete on project_todos to authenticated, service_role;
