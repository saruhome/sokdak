-- Account deletion is now handled by the authenticated delete-account Edge Function.
-- Removing the public SECURITY DEFINER RPC closes its PostgREST exposure.

begin;

revoke execute on function public.delete_own_account() from anon, authenticated, public;
drop function if exists public.delete_own_account();

commit;
