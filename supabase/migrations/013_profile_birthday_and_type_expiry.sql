-- Profile birthday for licence expiry calculations (used by birthday-expiry types).
alter table public.profiles
  add column if not exists birth_month smallint check (birth_month between 1 and 12),
  add column if not exists birth_day smallint check (birth_day between 1 and 31);

-- Birthday expiry is defined per licence type, not per state.
alter table public.record_types
  add column if not exists expires_on_birthday boolean not null default false;

-- Copy existing state-level birthday flags down to gun licence types in those states.
update public.record_types rt
set expires_on_birthday = true
from public.states s
where rt.state_id = s.id
  and s.expires_on_birthday = true
  and rt.category_id in (
    select id from public.record_categories where key = 'gun_licence'
  );
