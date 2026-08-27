/**
 * private 프로필 아바타의 signed URL 수명 관리 — 발급·만료 추적·재발급을 전담한다.
 * profileStore는 발급(issue)만 호출하고, 만료 상태와 registry 연동은 여기가 소유한다.
 * 앱 foreground 복귀 시 재발급은 privateSignedMediaRegistry가 refresh()를 호출하는 경로.
 */
import { sessionStore } from './sessionStore';
import {
  createProfileAvatarSignedUrl,
  isProfileAvatarPath,
  PROFILE_AVATAR_SIGNED_URL_TTL_SECONDS,
} from '../../../../constants/profileAvatarStorage';
import {
  notifyPrivateSignedMediaChanged,
  registerPrivateSignedMediaResource,
} from '../../../../constants/privateSignedMediaRegistry';

let _expiresAt: number | null = null;

function setExpiresAt(value: number | null) {
  _expiresAt = value;
  notifyPrivateSignedMediaChanged();
}

export const avatarUrlCache = {
  /** signed URL을 발급하고 만료 시각을 기록한다 — fetchProfile/updateUser 공용 경로 */
  async issue(avatarPath: string | null): Promise<string | null> {
    const signedUrl = await createProfileAvatarSignedUrl(avatarPath);
    setExpiresAt(signedUrl ? Date.now() + PROFILE_AVATAR_SIGNED_URL_TTL_SECONDS * 1000 : null);
    return signedUrl;
  },

  /** 앱이 foreground로 복귀할 때 private 아바타의 짧은 수명 signed URL만 재발급한다. */
  async refresh() {
    const user = sessionStore.getUser();
    if (!user || !isProfileAvatarPath(user.avatarPath)) return { error: null };

    const signedAvatarUrl = await createProfileAvatarSignedUrl(user.avatarPath);
    if (!signedAvatarUrl) return { error: '프로필 사진 링크를 새로 만들 수 없어요.' };

    setExpiresAt(Date.now() + PROFILE_AVATAR_SIGNED_URL_TTL_SECONDS * 1000);
    sessionStore.patchUser({ avatarUrl: signedAvatarUrl });
    sessionStore.notify();
    return { error: null };
  },

  getExpiresAt: () => _expiresAt,

  /** 로그아웃/세션 종료 시 만료 상태를 비운다. */
  clear() {
    setExpiresAt(null);
  },
};

registerPrivateSignedMediaResource({
  id: 'profile-avatar',
  getExpiresAt: () => _expiresAt,
  refresh: () => avatarUrlCache.refresh(),
});
