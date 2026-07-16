-- Call sheet: client calls (like crew calls) and locations (name + link).
-- Both default to empty and are hidden on the printed sheet when empty.

alter table call_sheets
  add column client_calls jsonb not null default '[]', -- [{name, role, phone, call_time}]
  add column locations jsonb not null default '[]';    -- [{name, link}]
