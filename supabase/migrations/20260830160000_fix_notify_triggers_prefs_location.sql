-- Fix: notify_on_comment / notify_on_like still read profiles.notification_prefs,
-- but 20260814140000_split_private_account_settings moved that column to
-- account_settings. Since then every comment INSERT and post-like INSERT died
-- with 42703 "column pr.notification_prefs does not exist" — masked until today
-- because the stale consent trigger blocked all community writes anyway.
-- Discovered during the post-consent-ledger verification of the full
-- accept -> post -> comment flow.
--
-- Change: join account_settings on user_id instead of profiles on id.
-- LEFT join (profiles was inner): a user without an account_settings row must
-- still generate notifications — coalesce(default true) already covers the
-- null prefs case.
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.

create or replace function public.notify_on_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into notifications (recipient_id, actor_id, type, post_id, comment_id)
  select p.author_id, new.author_id, 'comment', new.post_id, new.id
  from posts p
  left join account_settings s on s.user_id = p.author_id
  where p.id = new.post_id
    and p.author_id != new.author_id
    and coalesce((s.notification_prefs->>'comment')::boolean, true);
  return new;
end;
$$;

create or replace function public.notify_on_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into notifications (recipient_id, actor_id, type, post_id)
  select p.author_id, new.user_id, 'like', new.post_id
  from posts p
  left join account_settings s on s.user_id = p.author_id
  where p.id = new.post_id
    and p.author_id != new.user_id
    and coalesce((s.notification_prefs->>'like')::boolean, true);
  return new;
end;
$$;
