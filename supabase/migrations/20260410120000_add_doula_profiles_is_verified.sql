-- Required for admin panel: doula verification KPIs, filters, and verify/reject actions.
-- Apply in Supabase SQL editor or: supabase db push

alter table public.doula_profiles
  add column if not exists is_verified boolean default false;

comment on column public.doula_profiles.is_verified is 'Admin verification; distinct from is_available.';
