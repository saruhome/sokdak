/**
 * 프로필 도메인 — auth migration 3단계.
 * profiles/account_settings 테이블의 읽기·쓰기와 연속 학습일(streak) 갱신을 담당한다.
 * 알림 설정은 notificationPrefsStore, 아바타 signed URL 수명은 avatarUrlCache로 분리됐다.
 * 세션 상태는 sessionStore가 소유하고, 이 스토어는 프로필 변경 시
 * sessionStore.patchUser/notify로 반영한다.
 */
import { supabase } from '../../../shared/api/supabaseClient';
import { sessionStore, type SokDakUser } from './sessionStore';
import { avatarUrlCache } from './avatarUrlCache';
import { isProfileAvatarPath } from '../../../../constants/profileAvatarStorage';

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

/** 오늘 처음 로그인/세션 복원 시 연속 학습일(streak)을 갱신한다.
 * 어제까지 활동 → +1, 그보다 오래됐으면 1로 리셋, 오늘 이미 반영했으면 그대로 둔다. */
async function bumpStreak(userId: string, lastActiveDate: string | null, currentStreak: number) {
  const today = todayString();
  if (lastActiveDate === today) return currentStreak;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const nextStreak = lastActiveDate === yesterday ? currentStreak + 1 : 1;

  const { error } = await supabase
    .from('account_settings')
    .update({ streak_count: nextStreak, last_active_date: today })
    .eq('user_id', userId);
  return error ? currentStreak : nextStreak;
}

export const profileStore = {
  async fetchProfile(userId: string, email: string): Promise<SokDakUser> {
    const [{ data: profile }, { data: settings }] = await Promise.all([
      supabase
        .from('profiles')
        .select('nickname, avatar_emoji, avatar_url, level')
        .eq('id', userId)
        .single(),
      supabase
        .from('account_settings')
        .select('phone, timezone, is_premium, streak_count, last_active_date')
        .eq('user_id', userId)
        .single(),
    ]);

    const streakCount = await bumpStreak(userId, settings?.last_active_date ?? null, settings?.streak_count ?? 0);
    const avatarPath = profile?.avatar_url ?? null;
    const signedAvatarUrl = await avatarUrlCache.issue(avatarPath);

    return {
      id: userId,
      email,
      name: profile?.nickname ?? email.split('@')[0],
      emoji: profile?.avatar_emoji ?? '🐦',
      avatarPath,
      avatarUrl: signedAvatarUrl ?? (isProfileAvatarPath(avatarPath) ? null : avatarPath),
      phone: settings?.phone ?? null,
      timezone: settings?.timezone ?? 'UTC',
      level: profile?.level ?? '초급',
      isPremium: settings?.is_premium ?? false,
      streakCount,
    };
  },

  async updateUser(patch: Partial<{
    name: string; emoji: string; avatarPath: string | null; phone: string | null; timezone: string;
  }>) {
    const user = sessionStore.getUser();
    if (!user) return { error: '로그인이 필요해요.' };

    if (patch.name !== undefined || patch.emoji !== undefined || patch.avatarPath !== undefined) {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...(patch.name !== undefined ? { nickname: patch.name } : {}),
          ...(patch.emoji !== undefined ? { avatar_emoji: patch.emoji } : {}),
          ...(patch.avatarPath !== undefined ? { avatar_url: patch.avatarPath } : {}),
        })
        .eq('id', user.id);
      if (error) return { error: error.message };
    }

    if (patch.phone !== undefined || patch.timezone !== undefined) {
      const { error } = await supabase
        .from('account_settings')
        .update({
          ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
          ...(patch.timezone !== undefined ? { timezone: patch.timezone } : {}),
        })
        .eq('user_id', user.id);
      if (error) return { error: error.message };
    }

    const signedAvatarUrl = patch.avatarPath !== undefined
      ? await avatarUrlCache.issue(patch.avatarPath)
      : undefined;

    sessionStore.patchUser({
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.emoji !== undefined ? { emoji: patch.emoji } : {}),
      ...(patch.avatarPath !== undefined ? {
        avatarPath: patch.avatarPath,
        avatarUrl: signedAvatarUrl ?? (isProfileAvatarPath(patch.avatarPath) ? null : patch.avatarPath),
      } : {}),
      ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
      ...(patch.timezone !== undefined ? { timezone: patch.timezone } : {}),
    });
    sessionStore.notify();
    return { error: null };
  },
};
