-- Recreate the ownership policy so auth.uid() is evaluated once per statement.
drop policy if exists "users manage their own saved posts" on public.saved_posts;

create policy "users manage their own saved posts"
  on public.saved_posts
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
