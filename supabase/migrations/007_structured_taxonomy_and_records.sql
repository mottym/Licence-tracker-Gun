create table if not exists public.record_categories (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.jurisdictions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  state_id uuid references public.states (id) on delete set null,
  is_city boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.record_types (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.record_categories (id) on delete cascade,
  jurisdiction_id uuid references public.jurisdictions (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete cascade,
  key text not null unique,
  name text not null,
  requires_renewal boolean not null default true,
  expiration_months integer check (expiration_months is null or expiration_months > 0),
  renewal_processing_days integer check (renewal_processing_days is null or renewal_processing_days >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (jurisdiction_id is not null and organization_id is null)
    or (jurisdiction_id is null and organization_id is not null)
    or (jurisdiction_id is null and organization_id is null)
  )
);

create table if not exists public.gun_licences (
  id uuid primary key default gen_random_uuid(),
  legacy_licence_id uuid unique references public.licences (id) on delete set null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  state_id uuid references public.states (id) on delete set null,
  jurisdiction_id uuid not null references public.jurisdictions (id) on delete restrict,
  record_type_id uuid not null references public.record_types (id) on delete restrict,
  issued_at date,
  last_renewed_at date not null,
  licence_number text,
  notes text,
  photo_url text,
  birth_month smallint check (birth_month between 1 and 12),
  birth_day smallint check (birth_day between 1 and 31),
  manually_marked_expired boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gun_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete restrict,
  record_type_id uuid not null references public.record_types (id) on delete restrict,
  completed_at date not null,
  renewed_at date,
  certificate_url text,
  notes text,
  manually_marked_expired boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gun_licences_user_id_idx on public.gun_licences (user_id);
create index if not exists gun_courses_user_id_idx on public.gun_courses (user_id);

create trigger jurisdictions_updated_at before update on public.jurisdictions
  for each row execute function public.set_updated_at();
create trigger organizations_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();
create trigger record_types_updated_at before update on public.record_types
  for each row execute function public.set_updated_at();
create trigger gun_licences_updated_at before update on public.gun_licences
  for each row execute function public.set_updated_at();
create trigger gun_courses_updated_at before update on public.gun_courses
  for each row execute function public.set_updated_at();

alter table public.record_categories enable row level security;
alter table public.jurisdictions enable row level security;
alter table public.organizations enable row level security;
alter table public.record_types enable row level security;
alter table public.gun_licences enable row level security;
alter table public.gun_courses enable row level security;

drop policy if exists "Anyone authenticated can read record categories" on public.record_categories;
create policy "Anyone authenticated can read record categories"
  on public.record_categories for select to authenticated using (true);
drop policy if exists "Admins manage record categories" on public.record_categories;
create policy "Admins manage record categories"
  on public.record_categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Anyone authenticated can read jurisdictions" on public.jurisdictions;
create policy "Anyone authenticated can read jurisdictions"
  on public.jurisdictions for select to authenticated using (true);
drop policy if exists "Admins manage jurisdictions" on public.jurisdictions;
create policy "Admins manage jurisdictions"
  on public.jurisdictions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Anyone authenticated can read organizations" on public.organizations;
create policy "Anyone authenticated can read organizations"
  on public.organizations for select to authenticated using (true);
drop policy if exists "Admins manage organizations" on public.organizations;
create policy "Admins manage organizations"
  on public.organizations for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Anyone authenticated can read record types" on public.record_types;
create policy "Anyone authenticated can read record types"
  on public.record_types for select to authenticated using (true);
drop policy if exists "Admins manage record types" on public.record_types;
create policy "Admins manage record types"
  on public.record_types for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users manage own gun licences" on public.gun_licences;
create policy "Users manage own gun licences"
  on public.gun_licences for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own gun courses" on public.gun_courses;
create policy "Users manage own gun courses"
  on public.gun_courses for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into public.record_categories (key, name)
values
  ('gun_licence', 'Gun Licence'),
  ('gun_course', 'Gun Course')
on conflict (key) do nothing;

insert into public.jurisdictions (name, code, state_id, is_city)
select s.name, lower(s.code), s.id, false
from public.states s
on conflict (code) do nothing;

insert into public.jurisdictions (name, code, state_id, is_city)
select 'New York City', 'nyc', s.id, true
from public.states s
where s.code = 'NY'
on conflict (code) do nothing;

insert into public.organizations (name, code)
values
  ('NRA', 'nra'),
  ('USCCA', 'uscca'),
  ('Ammo Yisroel', 'ammo_yisroel')
on conflict (code) do nothing;

insert into public.record_types (category_id, key, name, requires_renewal)
select rc.id, 'uncategorized_licence', 'Uncategorized', true
from public.record_categories rc
where rc.key = 'gun_licence'
on conflict (key) do nothing;

insert into public.record_types (category_id, key, name, requires_renewal)
select rc.id, 'uncategorized_course', 'Uncategorized', false
from public.record_categories rc
where rc.key = 'gun_course'
on conflict (key) do nothing;

insert into public.record_types (category_id, jurisdiction_id, key, name, requires_renewal)
select rc.id, j.id, 'nj_fid', 'FID Card', true
from public.record_categories rc
join public.jurisdictions j on j.code = 'nj'
where rc.key = 'gun_licence'
on conflict (key) do nothing;

insert into public.record_types (category_id, jurisdiction_id, key, name, requires_renewal)
select rc.id, j.id, 'nyc_premises', 'Premises Licence', true
from public.record_categories rc
join public.jurisdictions j on j.code = 'nyc'
where rc.key = 'gun_licence'
on conflict (key) do nothing;

insert into public.record_types (category_id, jurisdiction_id, key, name, requires_renewal)
select rc.id, j.id, 'nyc_carry', 'Carry Licence', true
from public.record_categories rc
join public.jurisdictions j on j.code = 'nyc'
where rc.key = 'gun_licence'
on conflict (key) do nothing;

insert into public.record_types (category_id, jurisdiction_id, key, name, requires_renewal)
select rc.id, j.id, 'nyc_rifle_shotgun', 'Rifle / Shotgun Licence', true
from public.record_categories rc
join public.jurisdictions j on j.code = 'nyc'
where rc.key = 'gun_licence'
on conflict (key) do nothing;

insert into public.record_types (
  category_id,
  organization_id,
  key,
  name,
  requires_renewal,
  expiration_months,
  renewal_processing_days
)
select rc.id, o.id, 'nra_basic_pistol', 'Basic Pistol', false, null, null
from public.record_categories rc
join public.organizations o on o.code = 'nra'
where rc.key = 'gun_course'
on conflict (key) do nothing;

insert into public.record_types (
  category_id,
  organization_id,
  key,
  name,
  requires_renewal,
  expiration_months,
  renewal_processing_days
)
select rc.id, o.id, 'nra_basic_rifle', 'Basic Rifle', false, null, null
from public.record_categories rc
join public.organizations o on o.code = 'nra'
where rc.key = 'gun_course'
on conflict (key) do nothing;

insert into public.record_types (
  category_id,
  organization_id,
  key,
  name,
  requires_renewal,
  expiration_months,
  renewal_processing_days
)
select rc.id, o.id, 'uscca_ccw_basic', 'CCW Basic', true, 36, 60
from public.record_categories rc
join public.organizations o on o.code = 'uscca'
where rc.key = 'gun_course'
on conflict (key) do nothing;

insert into public.gun_licences (
  legacy_licence_id,
  user_id,
  state_id,
  jurisdiction_id,
  record_type_id,
  last_renewed_at,
  licence_number,
  notes,
  photo_url,
  birth_month,
  birth_day,
  manually_marked_expired
)
select
  l.id,
  l.user_id,
  l.state_id,
  coalesce(
    (select j_nyc.id from public.jurisdictions j_nyc where j_nyc.code = 'nyc' and s.code = 'NY' and l.type = 'gun_licence' limit 1),
    (select j_state.id from public.jurisdictions j_state where j_state.state_id = l.state_id and j_state.is_city = false limit 1),
    (select j_default.id from public.jurisdictions j_default where j_default.code = lower(s.code) limit 1)
  ) as jurisdiction_id,
  coalesce(
    (
      select rt.id
      from public.record_types rt
      where rt.key = case
        when s.code = 'NJ' and l.type = 'gun_licence' then 'nj_fid'
        when s.code = 'NY' and l.type = 'gun_licence' then 'nyc_premises'
        else 'uncategorized_licence'
      end
      limit 1
    ),
    (select rt_fallback.id from public.record_types rt_fallback where rt_fallback.key = 'uncategorized_licence' limit 1)
  ) as record_type_id,
  l.last_renewed_at,
  l.licence_number,
  l.notes,
  l.photo_url,
  l.birth_month,
  l.birth_day,
  l.manually_marked_expired
from public.licences l
left join public.states s on s.id = l.state_id
where not exists (
  select 1 from public.gun_licences gl where gl.legacy_licence_id = l.id
);
