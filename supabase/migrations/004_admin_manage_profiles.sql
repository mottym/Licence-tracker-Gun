-- Safe to re-run: lets admins read all profiles and change roles (e.g. promote to admin)
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Admins can update profiles" on public.profiles;

create policy "Admins can read all profiles"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update profiles"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
