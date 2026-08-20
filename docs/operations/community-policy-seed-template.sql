-- Community policy publication seed template
--
-- Do not execute unchanged. Replace every angle-bracket value with facts from
-- reviewed, immutable policy documents. Compute SHA-256 from the exact UTF-8
-- policy file that users see at the corresponding versioned content_url.
--
-- First-release target locales: en, ja, es, vi, de.
-- Korean (ko) is included because it is the canonical source locale.

begin;

with published_version as (
  insert into public.community_policy_versions (
    policy_key,
    version,
    status,
    effective_at,
    canonical_content_sha256,
    default_locale,
    published_at
  )
  values (
    'community_guidelines',
    '<SEMVER_EG_1.0.0>',
    'active',
    '<EFFECTIVE_AT_ISO8601>'::timestamptz,
    '<SHA256_OF_REVIEWED_KOREAN_CANONICAL_DOCUMENT>',
    'ko',
    now()
  )
  returning id
)
insert into public.community_policy_locales (
  policy_version_id,
  locale,
  content_url,
  content_sha256,
  translation_status,
  reviewed_at,
  published_at
)
select
  published_version.id,
  localized.locale,
  localized.content_url,
  localized.content_sha256,
  'published',
  now(),
  now()
from published_version
cross join (
  values
    ('ko', 'https://<PUBLIC_DOMAIN>/policies/community-guidelines/1.0.0/ko', '<SHA256_OF_KO_DOCUMENT>'),
    ('en', 'https://<PUBLIC_DOMAIN>/policies/community-guidelines/1.0.0/en', '<SHA256_OF_EN_DOCUMENT>'),
    ('ja', 'https://<PUBLIC_DOMAIN>/policies/community-guidelines/1.0.0/ja', '<SHA256_OF_JA_DOCUMENT>'),
    ('es', 'https://<PUBLIC_DOMAIN>/policies/community-guidelines/1.0.0/es', '<SHA256_OF_ES_DOCUMENT>'),
    ('vi', 'https://<PUBLIC_DOMAIN>/policies/community-guidelines/1.0.0/vi', '<SHA256_OF_VI_DOCUMENT>'),
    ('de', 'https://<PUBLIC_DOMAIN>/policies/community-guidelines/1.0.0/de', '<SHA256_OF_DE_DOCUMENT>')
) as localized(locale, content_url, content_sha256);

commit;

-- To publish a later version:
-- 1. INSERT a new row with status = 'scheduled' and all reviewed locale rows.
-- 2. In one controlled transaction, change the old active row to 'retired' and
--    change the scheduled row to 'active'. Do not UPDATE or DELETE published
--    policy content or consent rows.
-- 3. Existing users will be prompted to accept the newly active version on
--    their next participation action.
