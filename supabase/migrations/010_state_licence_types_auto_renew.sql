-- Move gun licence types to state-level management, drop group usage, add auto-renew.

-- 1. Scope gun licence types directly to a state.
alter table public.record_types
  add column if not exists state_id uuid references public.states (id) on delete cascade;

create index if not exists record_types_state_id_idx on public.record_types (state_id);

-- Relax the original (jurisdiction xor organization) parent check so a record type
-- can instead be parented by a state. At most one parent may be set.
alter table public.record_types drop constraint if exists record_types_check;
alter table public.record_types drop constraint if exists record_types_parent_check;
alter table public.record_types
  add constraint record_types_parent_check
  check (num_nonnulls(jurisdiction_id, organization_id, state_id) <= 1);

-- Existing gun licence types are linked via a jurisdiction; resolve them to the
-- jurisdiction's state so they show up under that state going forward.
update public.record_types rt
set state_id = j.state_id
from public.jurisdictions j
where rt.jurisdiction_id = j.id
  and rt.state_id is null
  and j.state_id is not null
  and rt.category_id in (
    select id from public.record_categories where key = 'gun_licence'
  );

-- 2. Auto-renew flag for gun licences.
alter table public.gun_licences
  add column if not exists auto_renew boolean not null default false;

-- 3. Gun licences are now keyed off state directly; jurisdiction becomes optional.
alter table public.gun_licences alter column jurisdiction_id drop not null;

-- 4. Retire state groups: fold any group rules down into each state, then detach.
update public.states s
set expiration_months = g.expiration_months,
    renewal_processing_days = g.renewal_processing_days
from public.state_groups g
where s.group_id = g.id
  and s.expiration_months is null
  and s.renewal_processing_days is null;

update public.states set group_id = null where group_id is not null;
