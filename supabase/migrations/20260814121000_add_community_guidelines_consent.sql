-- Records an authenticated user's explicit acceptance of the community guidelines.
-- The application checks this value before allowing a new post or comment.

begin;

alter table public.profiles
  add column if not exists community_guidelines_accepted_at timestamptz;

comment on column public.profiles.community_guidelines_accepted_at is
  'Timestamp of the currently recorded community guidelines acceptance.';

commit;
