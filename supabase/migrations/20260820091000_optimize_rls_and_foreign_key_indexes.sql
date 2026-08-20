-- Cache auth.uid() once per statement in ownership policies without changing access rules.
alter policy "users manage their own blocks" on public.blocked_users
  using ((select auth.uid()) = blocker_id)
  with check ((select auth.uid()) = blocker_id);

alter policy "authors can update their own comments" on public.comments
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

alter policy "recipients can see their own notifications" on public.notifications
  using ((select auth.uid()) = recipient_id);

alter policy "recipients can mark their own notifications read" on public.notifications
  using ((select auth.uid()) = recipient_id)
  with check ((select auth.uid()) = recipient_id);

alter policy "users can create suggestions" on public.word_suggestions
  with check ((select auth.uid()) = user_id);

alter policy "users can see their own suggestions" on public.word_suggestions
  using ((select auth.uid()) = user_id);

alter policy "users can create reports" on public.reports
  with check ((select auth.uid()) = reporter_id);

alter policy "reporters can see their own reports" on public.reports
  using ((select auth.uid()) = reporter_id);

alter policy "insert own ticket" on public.support_tickets
  with check ((select auth.uid()) = user_id);

alter policy "select own tickets" on public.support_tickets
  using ((select auth.uid()) = user_id);

-- Add indexes for foreign keys and the notification access pattern used by the client.
create index if not exists blocked_users_blocked_id_idx on public.blocked_users (blocked_id);
create index if not exists comment_likes_user_id_idx on public.comment_likes (user_id);
create index if not exists notifications_actor_id_idx on public.notifications (actor_id);
create index if not exists notifications_comment_id_idx on public.notifications (comment_id);
create index if not exists notifications_post_id_idx on public.notifications (post_id);
create index if not exists notifications_recipient_created_at_idx on public.notifications (recipient_id, created_at desc);
create index if not exists notifications_recipient_unread_idx on public.notifications (recipient_id) where read_at is null;
create index if not exists reports_comment_id_idx on public.reports (comment_id);
create index if not exists reports_post_id_idx on public.reports (post_id);
create index if not exists reports_reported_user_id_idx on public.reports (reported_user_id);
create index if not exists reports_reporter_id_idx on public.reports (reporter_id);
create index if not exists reports_reviewed_by_idx on public.reports (reviewed_by);
create index if not exists saved_posts_post_id_idx on public.saved_posts (post_id);
create index if not exists support_tickets_user_id_idx on public.support_tickets (user_id);
create index if not exists word_suggestions_user_id_idx on public.word_suggestions (user_id);
