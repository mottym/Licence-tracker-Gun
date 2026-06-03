-- Native push tokens (Expo / FCM) for the Android mobile app.
-- This is separate from the web `push_subscriptions` table because the wire
-- protocols are different (Web Push uses endpoint+p256dh+auth, Expo uses a
-- single opaque ExponentPushToken[...] string).

create table if not exists public.expo_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('android', 'ios')),
  device_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, token)
);

create index if not exists expo_push_tokens_user_id_idx
  on public.expo_push_tokens (user_id);

alter table public.expo_push_tokens enable row level security;

create policy "Users manage own expo push tokens"
  on public.expo_push_tokens for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists expo_push_tokens_set_updated_at on public.expo_push_tokens;
create trigger expo_push_tokens_set_updated_at
  before update on public.expo_push_tokens
  for each row execute function public.set_updated_at();
