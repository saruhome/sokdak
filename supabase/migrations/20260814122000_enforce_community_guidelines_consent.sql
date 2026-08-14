-- Enforce the community-guidelines acceptance on the database write path.
-- Client-side checks improve UX but are not a security boundary.

begin;

create or replace function public.require_community_guidelines_acceptance()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if auth.uid() is null then
    raise exception 'Authentication is required to contribute to the community';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and community_guidelines_accepted_at is not null
  ) then
    raise exception 'Community guidelines acceptance is required before posting';
  end if;

  return new;
end;
$$;

comment on function public.require_community_guidelines_acceptance() is
  'Requires a current user to accept community guidelines before creating posts or comments.';

drop trigger if exists posts_require_community_guidelines_acceptance on public.posts;
create trigger posts_require_community_guidelines_acceptance
before insert on public.posts
for each row
execute function public.require_community_guidelines_acceptance();

drop trigger if exists comments_require_community_guidelines_acceptance on public.comments;
create trigger comments_require_community_guidelines_acceptance
before insert on public.comments
for each row
execute function public.require_community_guidelines_acceptance();

commit;
