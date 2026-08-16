-- Adds an auditable moderation workflow and hides non-published UGC from public
-- reads while preserving access for the original author and trusted operators.

begin;

alter table public.posts
  add column if not exists moderation_status text not null default 'published'
    check (moderation_status in ('published', 'hidden', 'removed')),
  add column if not exists moderated_at timestamptz,
  add column if not exists moderation_reason text;

alter table public.comments
  add column if not exists moderation_status text not null default 'published'
    check (moderation_status in ('published', 'hidden', 'removed')),
  add column if not exists moderated_at timestamptz,
  add column if not exists moderation_reason text;

alter table public.reports
  add column if not exists status text not null default 'open'
    check (status in ('open', 'in_review', 'actioned', 'dismissed')),
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists resolution_note text;

create index if not exists reports_open_queue_idx
  on public.reports (status, created_at asc)
  where status in ('open', 'in_review');

create or replace function public.prevent_client_moderation_changes()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if (
    new.moderation_status is distinct from old.moderation_status
    or new.moderated_at is distinct from old.moderated_at
    or new.moderation_reason is distinct from old.moderation_reason
  )
  and auth.role() <> 'service_role'
  and current_user not in ('postgres', 'supabase_admin') then
    raise exception 'moderation fields may only be changed by a trusted operator';
  end if;
  return new;
end;
$$;

drop trigger if exists posts_prevent_client_moderation_changes on public.posts;
create trigger posts_prevent_client_moderation_changes
before update on public.posts
for each row
execute function public.prevent_client_moderation_changes();

drop trigger if exists comments_prevent_client_moderation_changes on public.comments;
create trigger comments_prevent_client_moderation_changes
before update on public.comments
for each row
execute function public.prevent_client_moderation_changes();

drop policy if exists "posts are publicly readable" on public.posts;
create policy "published posts are publicly readable"
  on public.posts for select to public
  using (moderation_status = 'published' or (select auth.uid()) = author_id);

drop policy if exists "comments are publicly readable" on public.comments;
create policy "published comments are publicly readable"
  on public.comments for select to public
  using (moderation_status = 'published' or (select auth.uid()) = author_id);

commit;
