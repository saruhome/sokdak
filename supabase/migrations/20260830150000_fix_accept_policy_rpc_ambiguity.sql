-- Fix: accept_current_community_policy failed on every call with
-- 42702 "column reference policy_key is ambiguous".
--
-- The function RETURNS TABLE (policy_key, ...), and PL/pgSQL treats OUT
-- parameters as variables, so the unqualified `where policy_key = ...` in the
-- active-version lookup collided with the community_policy_versions column.
-- Discovered during post-seed verification of policy 0.9.0: every
-- authenticated call died at the active-version lookup before reaching any
-- guard, so the bug was unreachable until the ledger + seed landed today.
--
-- Only this one reference is ambiguous: the consents insert already qualifies
-- `returning community_policy_consents.accepted_at`, and the other queries use
-- aliases or non-conflicting names. has_accepted_current_community_policy and
-- require_current_community_policy_consent are unaffected (no conflicting
-- variables).
--
-- CREATE OR REPLACE preserves the existing ACLs (EXECUTE revoked from
-- public/anon, granted to authenticated) — no grant changes here.
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.

create or replace function public.accept_current_community_policy(
  p_locale text,
  p_source text default 'community_onboarding',
  p_app_version text default null,
  p_platform text default null
)
returns table (
  policy_key text,
  policy_version text,
  policy_locale text,
  accepted_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_locale text := lower(replace(trim(p_locale), '_', '-'));
  v_policy public.community_policy_versions%rowtype;
  v_localized public.community_policy_locales%rowtype;
  v_accepted_at timestamptz;
begin
  if v_user_id is null then
    raise exception using
      errcode = '42501',
      message = 'Authentication is required to accept the community policy';
  end if;

  if p_source not in ('community_onboarding', 'post_gate', 'comment_gate', 'policy_update', 'account_settings') then
    raise exception using
      errcode = '22023',
      message = 'Unsupported community policy consent source';
  end if;

  if p_platform is not null and p_platform not in ('android', 'ios', 'web') then
    raise exception using
      errcode = '22023',
      message = 'Unsupported client platform';
  end if;

  select *
    into v_policy
  from public.community_policy_versions versions
  where versions.policy_key = 'community_guidelines'
    and versions.status = 'active'
    and versions.effective_at <= now()
  order by versions.effective_at desc
  limit 1;

  if not found then
    raise exception using
      errcode = '55000',
      message = 'No active community policy is published';
  end if;

  select *
    into v_localized
  from public.community_policy_locales locales
  where locales.policy_version_id = v_policy.id
    and locales.locale = v_locale
    and locales.translation_status = 'published'
  limit 1;

  if not found then
    raise exception using
      errcode = '22023',
      message = format('No published community policy translation exists for locale %s', v_locale);
  end if;

  insert into public.community_policy_consents (
    user_id,
    policy_version_id,
    policy_key,
    policy_version,
    policy_locale,
    localized_content_sha256,
    source,
    app_version,
    platform
  )
  values (
    v_user_id,
    v_policy.id,
    v_policy.policy_key,
    v_policy.version,
    v_localized.locale,
    v_localized.content_sha256,
    p_source,
    nullif(trim(p_app_version), ''),
    p_platform
  )
  on conflict (user_id, policy_version_id) do nothing
  returning community_policy_consents.accepted_at into v_accepted_at;

  if v_accepted_at is null then
    select consent.accepted_at
      into v_accepted_at
    from public.community_policy_consents consent
    where consent.user_id = v_user_id
      and consent.policy_version_id = v_policy.id;
  end if;

  -- This is a cache for fast client rendering only. The consent ledger remains
  -- the authority used by the write trigger below. The update trigger accepts
  -- cache writes only for this transaction-local RPC path.
  perform set_config('app.community_policy_consent_write', 'on', true);

  insert into public.account_settings (
    user_id,
    current_community_policy_version_id,
    community_guidelines_accepted_at
  )
  values (v_user_id, v_policy.id, v_accepted_at)
  on conflict (user_id) do update
  set current_community_policy_version_id = excluded.current_community_policy_version_id,
      community_guidelines_accepted_at = excluded.community_guidelines_accepted_at,
      updated_at = now();

  return query
  select v_policy.policy_key, v_policy.version, v_localized.locale, v_accepted_at;
end;
$$;
