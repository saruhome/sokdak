-- Community policy consent ledger (P0)
--
-- This migration replaces the obsolete consent check against
-- profiles.community_guidelines_accepted_at. That column was moved to
-- account_settings in 20260814140000_split_private_account_settings.sql.
--
-- A timestamp in account_settings remains a non-authoritative UX cache.
-- The authoritative, append-only evidence is public.community_policy_consents.
--
-- IMPORTANT DEPLOYMENT ORDER
-- 1) Apply this migration.
-- 2) Publish reviewed policy content and locale rows using the seed template
--    in docs/operations/community-policy-seed-template.sql.
-- 3) Confirm the RPC works for each supported locale before opening posting.

begin;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Immutable policy metadata and reviewed locale copies
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public.community_policy_versions (
  id uuid primary key default gen_random_uuid(),
  policy_key text not null default 'community_guidelines'
    check (policy_key = 'community_guidelines'),
  version text not null
    check (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'active', 'retired')),
  effective_at timestamptz not null,
  -- SHA-256 of the canonical, reviewed policy source. Never overwrite a
  -- published source: create a new version instead.
  canonical_content_sha256 text not null
    check (canonical_content_sha256 ~ '^[a-f0-9]{64}$'),
  default_locale text not null default 'ko'
    check (default_locale ~ '^[a-z]{2,3}(-[a-z0-9]{2,8})*$'),
  created_at timestamptz not null default now(),
  published_at timestamptz,
  retired_at timestamptz,
  unique (policy_key, version)
);

-- Only one currently active version per policy key. Future versions should use
-- status = scheduled until the moment they are activated.
create unique index if not exists community_policy_versions_one_active_per_key
  on public.community_policy_versions (policy_key)
  where status = 'active';

create index if not exists community_policy_versions_active_lookup_idx
  on public.community_policy_versions (policy_key, status, effective_at desc);

create table if not exists public.community_policy_locales (
  policy_version_id uuid not null
    references public.community_policy_versions(id) on delete restrict,
  locale text not null
    check (locale ~ '^[a-z]{2,3}(-[a-z0-9]{2,8})*$'),
  -- The URL must resolve to an immutable, versioned public document. Do not
  -- re-use a mutable /guidelines URL for different versions.
  content_url text not null check (content_url ~ '^https://'),
  -- SHA-256 of exactly the document shown to this locale.
  content_sha256 text not null
    check (content_sha256 ~ '^[a-f0-9]{64}$'),
  translation_status text not null default 'draft'
    check (translation_status in ('draft', 'reviewed', 'published', 'retired')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  primary key (policy_version_id, locale)
);

create index if not exists community_policy_locales_published_lookup_idx
  on public.community_policy_locales (locale, translation_status);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Append-only consent evidence and account-settings UX cache
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public.community_policy_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  policy_version_id uuid not null
    references public.community_policy_versions(id) on delete restrict,
  -- Snapshot fields intentionally duplicate version metadata. They make each
  -- consent record independently auditable even when a policy is later retired.
  policy_key text not null,
  policy_version text not null,
  policy_locale text not null,
  localized_content_sha256 text not null
    check (localized_content_sha256 ~ '^[a-f0-9]{64}$'),
  accepted_at timestamptz not null default now(),
  source text not null default 'community_onboarding'
    check (source in ('community_onboarding', 'post_gate', 'comment_gate', 'policy_update', 'account_settings')),
  app_version text,
  platform text check (platform in ('android', 'ios', 'web')),
  created_at timestamptz not null default now(),
  -- Repeating the same acceptance request is idempotent. A later policy version
  -- creates a new row rather than overwriting old evidence.
  unique (user_id, policy_version_id)
);

create index if not exists community_policy_consents_user_accepted_idx
  on public.community_policy_consents (user_id, accepted_at desc);

create index if not exists community_policy_consents_version_idx
  on public.community_policy_consents (policy_version_id, accepted_at desc);

alter table public.account_settings
  add column if not exists current_community_policy_version_id uuid
    references public.community_policy_versions(id) on delete set null;

-- A direct app update must not manufacture a consent cache. Column-level
-- REVOKE alone cannot override an existing table-level UPDATE grant, so a
-- trigger protects the cache as defense in depth. Only the RPC below sets this
-- transaction-local flag before it updates the cache.
create or replace function public.prevent_client_community_policy_cache_write()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if (
    new.community_guidelines_accepted_at is distinct from old.community_guidelines_accepted_at
    or new.current_community_policy_version_id is distinct from old.current_community_policy_version_id
  )
  and auth.role() <> 'service_role'
  and coalesce(current_setting('app.community_policy_consent_write', true), '') <> 'on' then
    raise exception using
      errcode = '42501',
      message = 'Community policy consent cache may only be updated by the consent RPC';
  end if;
  return new;
end;
$$;

drop trigger if exists account_settings_prevent_client_community_policy_cache_write
  on public.account_settings;
create trigger account_settings_prevent_client_community_policy_cache_write
  before update on public.account_settings
  for each row
  execute function public.prevent_client_community_policy_cache_write();

revoke update (community_guidelines_accepted_at, current_community_policy_version_id)
  on public.account_settings from anon, authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. RLS and grants
-- ────────────────────────────────────────────────────────────────────────────

alter table public.community_policy_versions enable row level security;
alter table public.community_policy_locales enable row level security;
alter table public.community_policy_consents enable row level security;

-- Expose only effective, active policy metadata and its published language
-- copies. This allows onboarding before login while keeping drafts private.
create policy "public can read effective active community policy versions"
  on public.community_policy_versions for select
  to anon, authenticated
  using (
    status = 'active'
    and effective_at <= now()
  );

create policy "public can read published locales for effective active policies"
  on public.community_policy_locales for select
  to anon, authenticated
  using (
    translation_status = 'published'
    and exists (
      select 1
      from public.community_policy_versions policy
      where policy.id = community_policy_locales.policy_version_id
        and policy.status = 'active'
        and policy.effective_at <= now()
    )
  );

-- A user can review their own consent evidence but cannot insert, update or
-- delete it through the client API. The SECURITY DEFINER RPC below writes it.
create policy "users can read their own community policy consents"
  on public.community_policy_consents for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.community_policy_versions from public, anon, authenticated;
revoke all on public.community_policy_locales from public, anon, authenticated;
revoke all on public.community_policy_consents from public, anon, authenticated;

grant select on public.community_policy_versions to anon, authenticated;
grant select on public.community_policy_locales to anon, authenticated;
grant select on public.community_policy_consents to authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Authenticated, server-timestamped consent RPC
-- ────────────────────────────────────────────────────────────────────────────

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
  from public.community_policy_versions
  where policy_key = 'community_guidelines'
    and status = 'active'
    and effective_at <= now()
  order by effective_at desc
  limit 1;

  if not found then
    raise exception using
      errcode = '55000',
      message = 'No active community policy is published';
  end if;

  select *
    into v_localized
  from public.community_policy_locales
  where policy_version_id = v_policy.id
    and locale = v_locale
    and translation_status = 'published'
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

revoke all on function public.accept_current_community_policy(text, text, text, text)
  from public, anon;
grant execute on function public.accept_current_community_policy(text, text, text, text)
  to authenticated;

-- The app uses this server-derived result to decide whether to show the policy
-- gate. The database trigger below remains the final authorization boundary.
create or replace function public.has_accepted_current_community_policy()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.community_policy_consents consent
    join public.community_policy_versions policy
      on policy.id = consent.policy_version_id
    where consent.user_id = auth.uid()
      and policy.policy_key = 'community_guidelines'
      and policy.status = 'active'
      and policy.effective_at <= now()
  );
$$;

revoke all on function public.has_accepted_current_community_policy()
  from public, anon;
grant execute on function public.has_accepted_current_community_policy()
  to authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Replace stale post/comment trigger with current-consent enforcement
-- ────────────────────────────────────────────────────────────────────────────

create or replace function public.require_current_community_policy_consent()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_policy_id uuid;
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if auth.uid() is null then
    raise exception using
      errcode = '42501',
      message = 'Authentication is required to contribute to the community';
  end if;

  select id
    into v_policy_id
  from public.community_policy_versions
  where policy_key = 'community_guidelines'
    and status = 'active'
    and effective_at <= now()
  order by effective_at desc
  limit 1;

  if v_policy_id is null then
    raise exception using
      errcode = '55000',
      message = 'Community posting is unavailable until an active policy is published';
  end if;

  if not exists (
    select 1
    from public.community_policy_consents consent
    where consent.user_id = auth.uid()
      and consent.policy_version_id = v_policy_id
  ) then
    raise exception using
      errcode = '42501',
      message = 'Current community policy acceptance is required before posting';
  end if;

  return new;
end;
$$;

-- Keep the existing trigger names so no application-side references change.
drop trigger if exists posts_require_community_guidelines_acceptance on public.posts;
drop trigger if exists comments_require_community_guidelines_acceptance on public.comments;

create trigger posts_require_community_guidelines_acceptance
  before insert on public.posts
  for each row
  execute function public.require_current_community_policy_consent();

create trigger comments_require_community_guidelines_acceptance
  before insert on public.comments
  for each row
  execute function public.require_current_community_policy_consent();

comment on table public.community_policy_consents is
  'Append-only, server-timestamped evidence of a user accepting a reviewed community policy locale.';
comment on function public.accept_current_community_policy(text, text, text, text) is
  'Records the authenticated user’s acceptance of the active reviewed community policy locale and updates the non-authoritative account-settings cache.';

commit;
