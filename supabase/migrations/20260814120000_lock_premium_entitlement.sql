-- SokDak launch hardening: entitlement writes must be server-only.
--
-- Apply this migration to the production Supabase project before enabling any
-- premium purchase flow. A trusted server-side billing webhook uses the
-- service_role key; mobile clients must never update profiles.is_premium.

begin;

create or replace function public.prevent_client_premium_write()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.is_premium is distinct from old.is_premium and auth.role() <> 'service_role' then
    raise exception 'is_premium may only be changed by the trusted billing service';
  end if;
  return new;
end;
$$;

comment on function public.prevent_client_premium_write() is
  'Prevents anonymous and authenticated client sessions from changing premium entitlement.';

drop trigger if exists profiles_prevent_client_premium_write on public.profiles;

create trigger profiles_prevent_client_premium_write
before update on public.profiles
for each row
execute function public.prevent_client_premium_write();

commit;
