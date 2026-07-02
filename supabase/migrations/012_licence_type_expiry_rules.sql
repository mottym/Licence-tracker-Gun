-- Expiry rules now live on gun licence types (record_types), not states.
-- Copy any state-level rules down to types that don't have their own yet.

update public.record_types rt
set expiration_months = s.expiration_months,
    renewal_processing_days = s.renewal_processing_days
from public.states s
where rt.state_id = s.id
  and rt.category_id in (
    select id from public.record_categories where key = 'gun_licence'
  )
  and rt.expiration_months is null
  and rt.renewal_processing_days is null
  and s.expiration_months is not null
  and s.renewal_processing_days is not null;
