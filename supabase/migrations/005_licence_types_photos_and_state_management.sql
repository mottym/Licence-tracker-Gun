alter table public.licences
  add column if not exists type text not null default 'drivers_licence',
  add column if not exists photo_url text;

alter table public.states
  add column if not exists is_custom boolean not null default false,
  add column if not exists gun_renewal_url text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'licences_type_check'
      and conrelid = 'public.licences'::regclass
  ) then
    alter table public.licences
      add constraint licences_type_check check (
        type in ('drivers_licence', 'gun_licence', 'gun_course', 'other')
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'states_gun_renewal_url_check'
      and conrelid = 'public.states'::regclass
  ) then
    alter table public.states
      add constraint states_gun_renewal_url_check check (
        gun_renewal_url is null
        or gun_renewal_url ~* '^https?://'
      );
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('licence-photos', 'licence-photos', false, 5242880, '{"image/jpeg","image/png","image/webp"}')
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload own licence photos" on storage.objects;
create policy "Users can upload own licence photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'licence-photos'
    and owner = auth.uid()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can read own licence photos" on storage.objects;
create policy "Users can read own licence photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'licence-photos'
    and owner = auth.uid()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update own licence photos" on storage.objects;
create policy "Users can update own licence photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'licence-photos'
    and owner = auth.uid()
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'licence-photos'
    and owner = auth.uid()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete own licence photos" on storage.objects;
create policy "Users can delete own licence photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'licence-photos'
    and owner = auth.uid()
    and (storage.foldername(name))[1] = auth.uid()::text
  );
