-- Expose auto-renew at the state level (admin default for gun licences) and on
-- user-managed custom licences.

-- 1. State-level auto-renew. When enabled, gun licences in this state are treated
-- as auto-renewing even if the individual licence wasn't flagged.
alter table public.states
  add column if not exists auto_renew boolean not null default false;

-- 2. Custom licence auto-renew. When enabled and an issue date is present, the
-- expiry rolls forward by the original issued -> expires period so it stays current.
alter table public.custom_licences
  add column if not exists auto_renew boolean not null default false;
