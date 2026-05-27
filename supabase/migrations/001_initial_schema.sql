-- Profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- State groups
create table public.state_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  expiration_months integer not null check (expiration_months > 0),
  renewal_processing_days integer not null check (renewal_processing_days >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- States
create table public.states (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  group_id uuid references public.state_groups (id) on delete set null,
  expiration_months integer check (expiration_months > 0),
  renewal_processing_days integer check (renewal_processing_days >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Licences
create table public.licences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  state_id uuid not null references public.states (id) on delete restrict,
  last_renewed_at date not null,
  licence_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index licences_user_id_idx on public.licences (user_id);
create index licences_state_id_idx on public.licences (state_id);

-- Notification preferences
create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  email_enabled boolean not null default true,
  push_enabled boolean not null default true,
  notify_days_before integer[] not null default '{60,30,14,7,1}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Push subscriptions
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

-- Notification log
create table public.notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  licence_id uuid not null references public.licences (id) on delete cascade,
  channel text not null check (channel in ('email', 'push')),
  notification_type text not null,
  sent_at timestamptz not null default now(),
  unique (licence_id, channel, notification_type)
);

create index notification_log_licence_id_idx on public.notification_log (licence_id);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger state_groups_updated_at before update on public.state_groups
  for each row execute function public.set_updated_at();
create trigger states_updated_at before update on public.states
  for each row execute function public.set_updated_at();
create trigger licences_updated_at before update on public.licences
  for each row execute function public.set_updated_at();
create trigger notification_preferences_updated_at before update on public.notification_preferences
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  admin_email text := 'muller3493@gmail.com';
  user_role text := 'user';
begin
  if lower(new.email) = lower(admin_email) then
    user_role := 'admin';
  end if;

  insert into public.profiles (id, email, role)
  values (new.id, new.email, user_role);

  insert into public.notification_preferences (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.state_groups enable row level security;
alter table public.states enable row level security;
alter table public.licences enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notification_log enable row level security;

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- Profiles policies
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- State groups policies
create policy "Anyone authenticated can read state groups"
  on public.state_groups for select
  to authenticated
  using (true);

create policy "Admins manage state groups"
  on public.state_groups for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- States policies
create policy "Anyone authenticated can read states"
  on public.states for select
  to authenticated
  using (true);

create policy "Admins manage states"
  on public.states for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Licences policies
create policy "Users manage own licences"
  on public.licences for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Notification preferences policies
create policy "Users manage own notification preferences"
  on public.notification_preferences for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Push subscriptions policies
create policy "Users manage own push subscriptions"
  on public.push_subscriptions for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Notification log policies
create policy "Users read own notification log"
  on public.notification_log for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Service role inserts notification log"
  on public.notification_log for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Seed US states
insert into public.states (name, code) values
  ('Alabama', 'AL'),
  ('Alaska', 'AK'),
  ('Arizona', 'AZ'),
  ('Arkansas', 'AR'),
  ('California', 'CA'),
  ('Colorado', 'CO'),
  ('Connecticut', 'CT'),
  ('Delaware', 'DE'),
  ('Florida', 'FL'),
  ('Georgia', 'GA'),
  ('Hawaii', 'HI'),
  ('Idaho', 'ID'),
  ('Illinois', 'IL'),
  ('Indiana', 'IN'),
  ('Iowa', 'IA'),
  ('Kansas', 'KS'),
  ('Kentucky', 'KY'),
  ('Louisiana', 'LA'),
  ('Maine', 'ME'),
  ('Maryland', 'MD'),
  ('Massachusetts', 'MA'),
  ('Michigan', 'MI'),
  ('Minnesota', 'MN'),
  ('Mississippi', 'MS'),
  ('Missouri', 'MO'),
  ('Montana', 'MT'),
  ('Nebraska', 'NE'),
  ('Nevada', 'NV'),
  ('New Hampshire', 'NH'),
  ('New Jersey', 'NJ'),
  ('New Mexico', 'NM'),
  ('New York', 'NY'),
  ('North Carolina', 'NC'),
  ('North Dakota', 'ND'),
  ('Ohio', 'OH'),
  ('Oklahoma', 'OK'),
  ('Oregon', 'OR'),
  ('Pennsylvania', 'PA'),
  ('Rhode Island', 'RI'),
  ('South Carolina', 'SC'),
  ('South Dakota', 'SD'),
  ('Tennessee', 'TN'),
  ('Texas', 'TX'),
  ('Utah', 'UT'),
  ('Vermont', 'VT'),
  ('Virginia', 'VA'),
  ('Washington', 'WA'),
  ('West Virginia', 'WV'),
  ('Wisconsin', 'WI'),
  ('Wyoming', 'WY'),
  ('District of Columbia', 'DC');
