-- Voluntary withdrawal keeps community content: posts/comments survive the author's
-- deletion with author_id set to NULL, and the client renders "탈퇴한 사용자" (deletedUser)
-- when the profile join comes back empty. Forced removal for rule violations goes through
-- admin_ban_user(), which deletes the member's posts and comments before the account.
-- (File timestamp differs from the production version applied via MCP — existing repo convention.)

alter table posts alter column author_id drop not null;
alter table posts drop constraint posts_author_id_fkey;
alter table posts add constraint posts_author_id_fkey
  foreign key (author_id) references profiles(id) on delete set null;

alter table comments alter column author_id drop not null;
alter table comments drop constraint comments_author_id_fkey;
alter table comments add constraint comments_author_id_fkey
  foreign key (author_id) references profiles(id) on delete set null;

-- Operator-only ban helper: run from Supabase Studio (service_role) as
--   select admin_ban_user('<user uuid>');
-- Deletes the member's community content first, then the auth user (cascades to
-- profiles/settings/likes/saved rows). SECURITY DEFINER is required to reach auth.users;
-- the role check plus EXECUTE revoke below keep it away from REST callers, matching the
-- account_settings premium-lock convention.
create or replace function admin_ban_user(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(current_setting('request.jwt.claims', true), '')::jsonb->>'role' is distinct from 'service_role' then
    raise exception 'admin_ban_user is service_role only';
  end if;
  delete from comments where author_id = target;
  delete from posts where author_id = target;
  delete from auth.users where id = target;
end;
$$;

revoke execute on function admin_ban_user(uuid) from public, anon, authenticated;
