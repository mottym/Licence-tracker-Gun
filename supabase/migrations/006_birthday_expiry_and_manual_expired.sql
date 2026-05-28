alter table public.states
  add column if not exists expires_on_birthday boolean not null default false;

alter table public.licences
  add column if not exists birth_month smallint check (birth_month between 1 and 12),
  add column if not exists birth_day smallint check (birth_day between 1 and 31),
  add column if not exists manually_marked_expired boolean not null default false;
