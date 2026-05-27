-- Pending invites: role is applied when the user accepts and signs up
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  invited_by uuid not null references public.profiles (id) on delete cascade,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index invitations_pending_email_idx
  on public.invitations (lower(email))
  where accepted_at is null;

alter table public.invitations enable row level security;

create policy "Admins manage invitations"
  on public.invitations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can read all profiles"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update profiles"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Apply invited role on signup (replaces hardcoded admin email check)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text := 'user';
  invite_role text;
begin
  select i.role into invite_role
  from public.invitations i
  where lower(i.email) = lower(new.email)
    and i.accepted_at is null
  order by i.created_at desc
  limit 1;

  if invite_role is not null then
    user_role := invite_role;
  end if;

  insert into public.profiles (id, email, role)
  values (new.id, new.email, user_role);

  insert into public.notification_preferences (user_id)
  values (new.id);

  if invite_role is not null then
    update public.invitations
    set accepted_at = now()
    where lower(email) = lower(new.email)
      and accepted_at is null;
  end if;

  return new;
end;
$$ language plpgsql security definer;
