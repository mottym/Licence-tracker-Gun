-- =============================================================================
-- Run this ONCE in Supabase → SQL Editor
-- (Do NOT re-run 001_initial_schema.sql — tables already exist)
-- =============================================================================
-- Makes muller3493@gmail.com an admin:
--   1. Your EXISTING account (already signed up)
--   2. Any NEW sign-up with that email
-- =============================================================================

-- 1) Existing user: promote muller3493@gmail.com to admin
update public.profiles
set role = 'admin'
where lower(email) = lower('muller3493@gmail.com');

insert into public.profiles (id, email, role)
select id, email, 'admin'
from auth.users
where lower(email) = lower('muller3493@gmail.com')
on conflict (id) do update set role = 'admin';

insert into public.notification_preferences (user_id)
select id
from auth.users
where lower(email) = lower('muller3493@gmail.com')
on conflict (user_id) do nothing;

-- 2) Future sign-ups: same email becomes admin automatically
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

-- Verify (should show role = admin)
-- select email, role from public.profiles where lower(email) = lower('muller3493@gmail.com');
