-- Custom (user-defined) licences such as driver's licences, OSHA cards, or
-- any other credential that doesn't fit the structured gun-licence / gun-course
-- taxonomy. The user supplies the expiry date directly and an optional
-- reminder threshold (in days before expiry) that drives the "renewal soon"
-- status badge.

create table if not exists public.custom_licences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  issuer text,
  licence_number text,
  issued_at date,
  expires_at date not null,
  renewal_reminder_days integer not null default 60
    check (renewal_reminder_days >= 0 and renewal_reminder_days <= 365),
  notes text,
  photo_url text,
  manually_marked_expired boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists custom_licences_user_id_idx
  on public.custom_licences (user_id);

create index if not exists custom_licences_expires_at_idx
  on public.custom_licences (expires_at);

create trigger custom_licences_updated_at
  before update on public.custom_licences
  for each row execute function public.set_updated_at();

alter table public.custom_licences enable row level security;

drop policy if exists "Users manage own custom licences" on public.custom_licences;
create policy "Users manage own custom licences"
  on public.custom_licences for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
