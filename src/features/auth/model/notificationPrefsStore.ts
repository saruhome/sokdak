/**
 * 알림 설정 persistence — account_settings.notification_prefs 전담.
 * 프로필 표시/아바타 상태와 공유하는 것이 없어 profileStore에서 분리했다.
 * `like`/`comment`는 실제 알림 트리거(notify_on_like/notify_on_comment)가 참고한다.
 * newSlang/popularSlang/popularPost는 아직 그 알림 자체를 만드는 백엔드가 없어 값만 저장된다.
 */
import { supabase } from '../../../shared/api/supabaseClient';
import { sessionStore } from './sessionStore';

export type NotificationPrefs = {
  newSlang: boolean;
  popularSlang: boolean;
  popularPost: boolean;
  like: boolean;
  comment: boolean;
};

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  newSlang: true, popularSlang: true, popularPost: true, like: true, comment: true,
};

export const notificationPrefsStore = {
  async fetchNotificationPrefs(): Promise<NotificationPrefs> {
    const user = sessionStore.getUser();
    if (!user) return DEFAULT_NOTIFICATION_PREFS;
    const { data } = await supabase
      .from('account_settings')
      .select('notification_prefs')
      .eq('user_id', user.id)
      .single();
    return { ...DEFAULT_NOTIFICATION_PREFS, ...(data?.notification_prefs as Partial<NotificationPrefs> ?? {}) };
  },

  async updateNotificationPrefs(prefs: NotificationPrefs) {
    const user = sessionStore.getUser();
    if (!user) return { error: '로그인이 필요해요.' };
    const { error } = await supabase
      .from('account_settings')
      .update({ notification_prefs: prefs })
      .eq('user_id', user.id);
    return { error: error?.message ?? null };
  },
};
