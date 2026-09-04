/**
 * 알림 실데이터 접근 계층 — Supabase `notifications` 테이블.
 * 알림 생성 자체는 클라이언트가 아니라 DB 트리거(notify_on_comment/notify_on_like)가 담당 —
 * 댓글/좋아요가 실제로 insert될 때만 생성되므로 여기서는 조회·읽음 처리만 한다.
 */
import { supabase } from '../../../shared/api/supabaseClient';
import { languageStore } from '../../../shared/i18n/languageStore';

export type AppNotification = {
  id: string;
  type: 'comment' | 'like';
  actorName: string;
  actorEmoji: string;
  message: string;
  timeAgo: string;
  postId: string;
  read: boolean;
};

function toTimeAgo(iso: string): string {
  const t = languageStore.t;
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return t('timeJustNow');
  if (minutes < 60) return t('timeMinutes').replace('{n}', String(minutes));
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('timeHours').replace('{n}', String(hours));
  return t('timeDays').replace('{n}', String(Math.floor(hours / 24)));
}

/* notifications→profiles 경로가 actor_id/recipient_id 두 가지라 FK 이름을 명시해야
 * PostgREST가 어느 쪽인지 확정할 수 있다(reports/posts에서 겪은 것과 동일한 문제). */
const NOTIFICATION_SELECT =
  'id, type, created_at, read_at, post_id, profiles!notifications_actor_id_fkey(nickname, avatar_emoji), posts(title)';

export async function fetchNotifications(): Promise<AppNotification[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select(NOTIFICATION_SELECT)
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false });
  if (error || !data) return [];

  const t = languageStore.t;
  return data.map(n => {
    const actor = n.profiles as { nickname: string; avatar_emoji: string } | null;
    const title = (n.posts as { title: string } | null)?.title ?? t('postFallback');
    return {
      id: n.id,
      type: n.type as 'comment' | 'like',
      actorName: actor?.nickname ?? t('deletedUser'),
      actorEmoji: actor?.avatar_emoji ?? '👤',
      message: (n.type === 'comment' ? t('notifCommentMsg') : t('notifLikeMsg')).replace('{title}', title),
      timeAgo: toTimeAgo(n.created_at),
      postId: n.post_id,
      read: !!n.read_at,
    };
  });
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', user.id)
    .is('read_at', null);
  return count ?? 0;
}

export async function markAllNotificationsRead() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', user.id)
    .is('read_at', null);
}
