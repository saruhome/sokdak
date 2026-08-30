/**
 * Supabase 기반 인증/세션 orchestration — 앱 시작/세션 전환과 화면용 public API 조립.
 * - 세션 상태: src/features/auth/model/sessionStore.ts
 * - stateless 인증 호출: src/features/auth/api/authApi.ts
 * - 프로필/아바타/알림 설정: src/features/auth/model/profileStore.ts
 * - 유료 권한/무료 한도/TTS 카운터: src/features/auth/model/entitlementStore.ts
 * - 커뮤니티 정책 동의: src/features/auth/model/consentStore.ts
 * - 북마크·차단 캐시: src/features/bookmarks/model/bookmarkStore.ts
 * 기존 화면들은 constants/authStore.ts facade를 통해 이 스토어를 그대로 사용한다.
 */
import * as Linking from 'expo-linking';
import { supabase } from '../../../shared/api/supabaseClient';
import { authApi } from '../api/authApi';
import { consentStore } from './consentStore';
import { sessionStore, type AuthListener, type SokDakUser } from './sessionStore';
import { profileStore } from './profileStore';
import { notificationPrefsStore, type NotificationPrefs } from './notificationPrefsStore';
import { avatarUrlCache } from './avatarUrlCache';
import {
  BETA_UNLIMITED_ENTITLEMENTS,
  entitlementStore,
  FREE_CATEGORY_LIKE_LIMIT,
  FREE_TTS_DAILY_LIMIT,
  FREE_WORD_SAVE_LIMIT,
} from './entitlementStore';
import { bookmarkStore } from '../../bookmarks/model/bookmarkStore';

export type { SokDakUser, NotificationPrefs };
export { BETA_UNLIMITED_ENTITLEMENTS, FREE_CATEGORY_LIKE_LIMIT, FREE_TTS_DAILY_LIMIT, FREE_WORD_SAVE_LIMIT };

let _initialized = false;
let _initPromise: Promise<void> | null = null;

function clearLocalCaches() {
  avatarUrlCache.clear();
  bookmarkStore.clearAll();
  entitlementStore.resetTts();
}

async function applySession(userId: string | undefined, email: string | undefined) {
  if (!userId || !email) {
    sessionStore.clearUser();
    clearLocalCaches();
    sessionStore.notify();
    bookmarkStore.notify();
    return;
  }
  sessionStore.setUser(await profileStore.fetchProfile(userId, email));
  await Promise.all([bookmarkStore.loadForUser(userId), entitlementStore.loadTtsPlaysToday(userId)]);
  sessionStore.notify();
  bookmarkStore.notify();
}

export const authStore = {
  /** 앱 시작 시 1회 호출 — 저장된 세션 복원 + 이후 인증 상태 변화 구독. */
  initialize() {
    if (_initPromise) return _initPromise;
    _initPromise = (async () => {
      const session = await authApi.getSession();
      if (session) {
        await applySession(session.user.id, session.user.email);
      }
      _initialized = true;

      supabase.auth.onAuthStateChange((event, session) => {
        /* 구독 직후 즉시 발행되는 INITIAL_SESSION은 위에서 이미 처리했다 */
        if (event === 'INITIAL_SESSION') return;
        applySession(session?.user.id, session?.user.email);
      });

      /* 이메일 인증·비밀번호 재설정 링크로 앱이 열렸을 때 세션 넘겨받기.
       * 네이티브에는 URL을 자동으로 읽어주는 주체가 없어(detectSessionInUrl: false)
       * 링크에 담겨 온 토큰을 직접 setSession에 넘겨야 로그인 상태가 된다. */
      const consumeAuthLink = async (url: string | null) => {
        if (!url) return;
        const fragment = url.split('#')[1];
        if (!fragment) return;
        const params = new URLSearchParams(fragment);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
          await authApi.setSessionFromTokens({ access_token, refresh_token });
        }
      };
      consumeAuthLink(await Linking.getInitialURL());
      Linking.addEventListener('url', ({ url }) => { consumeAuthLink(url); });
    })();
    return _initPromise;
  },
  isInitialized: () => _initialized,

  isLoggedIn: () => sessionStore.isLoggedIn(),
  getUser: () => sessionStore.getUser(),

  /**
   * 회원가입: profiles row는 DB 트리거(handle_new_user)가 자동 생성.
   * Supabase 프로젝트의 "Confirm email" 설정이 켜져 있으면 session이 바로 오지 않고
   * 이메일 인증 후에야 로그인 가능 — needsEmailConfirmation으로 화면에서 분기.
   */
  signUp: authApi.signUp,

  async signIn({ email, password }: { email: string; password: string }) {
    const { error } = await authApi.signIn({ email, password });
    if (!error) {
      const session = await authApi.getSession();
      if (session?.user) {
        await applySession(session.user.id, session.user.email);
      }
    }
    return { error };
  },

  async logout() {
    await authApi.signOut();
    sessionStore.clearUser();
    clearLocalCaches();
    sessionStore.notify();
    bookmarkStore.notify();
  },

  requestPasswordReset: authApi.requestPasswordReset,

  updateUser: profileStore.updateUser,
  refreshProfileAvatarSignedUrl: avatarUrlCache.refresh,
  getProfileAvatarSignedUrlExpiresAt: avatarUrlCache.getExpiresAt,

  hasAcceptedCommunityGuidelines: consentStore.hasAcceptedCommunityGuidelines,
  acceptCommunityGuidelines: consentStore.acceptCommunityGuidelines,

  updateEmail: authApi.updateEmail,
  updatePassword: authApi.updatePassword,

  fetchNotificationPrefs: notificationPrefsStore.fetchNotificationPrefs,
  updateNotificationPrefs: notificationPrefsStore.updateNotificationPrefs,

  /* ── 프리미엄 ──
   * entitlement는 결제 서버의 영수증 검증·웹훅만 갱신해야 한다. 앱은 현재 서버가 전달한
   * 상태를 읽기만 하며, 클라이언트에서 is_premium을 직접 쓰는 경로는 제공하지 않는다. */
  isPremium: entitlementStore.isPremium,
  getStreakCount: () => sessionStore.getUser()?.streakCount ?? 0,
  /** 무료 회원 단어 저장 상한 체크 — 이미 저장된 단어를 해제하는 건 항상 허용,
   *  새로 추가할 때만 막는다. 화면에서 toggleWordSaved 호출 전에 확인한다. */
  canSaveMoreWords: () => entitlementStore.hasUnlimited() || bookmarkStore.getSavedWordCount() < FREE_WORD_SAVE_LIMIT,
  /** 무료 회원 카테고리 좋아요 상한 — 단어 저장과 동일한 패턴, 해제는 항상 허용 */
  canLikeMoreCategories: () => entitlementStore.hasUnlimited() || bookmarkStore.getLikedCategoryCount() < FREE_CATEGORY_LIKE_LIMIT,

  canPlayTtsToday: entitlementStore.canPlayTtsToday,
  recordTtsPlay: entitlementStore.recordTtsPlay,

  /* ── 성인 확인 — slang(속어) 열람 게이트: 프리미엄과 별개 축(베타 무제한이 우회 못 함) ── */
  isAdultVerified: entitlementStore.isAdultVerified,
  canViewAdultContent: entitlementStore.canViewAdultContent,
  promptAdultVerification: entitlementStore.promptAdultVerification,

  /** 회원탈퇴 — 인증된 호출자를 Edge Function에서 검증한 뒤, 서비스 역할로 Auth·연관 DB 데이터와
   *  본인 게시 이미지 Storage 객체를 정리한다. 클라이언트는 privileged RPC를 직접 실행하지 않는다. */
  async deleteAccount() {
    const { error } = await authApi.invokeDeleteAccount();
    if (error) return { error };
    await authApi.signOut();
    return { error: null };
  },

  subscribe(fn: AuthListener) {
    return sessionStore.subscribe(fn);
  },

  /* ── 북마크/차단 — src/features/bookmarks/model/bookmarkStore.ts 위임 ── */
  isWordSaved: bookmarkStore.isWordSaved,
  toggleWordSaved: bookmarkStore.toggleWordSaved,
  getSavedWordIds: bookmarkStore.getSavedWordIds,

  isPostSaved: bookmarkStore.isPostSaved,
  togglePostSaved: bookmarkStore.togglePostSaved,
  getSavedPostIds: bookmarkStore.getSavedPostIds,

  isPostLiked: bookmarkStore.isPostLiked,
  togglePostLiked: bookmarkStore.togglePostLiked,
  getLikedPostIds: bookmarkStore.getLikedPostIds,

  isCommentLiked: bookmarkStore.isCommentLiked,
  toggleCommentLiked: bookmarkStore.toggleCommentLiked,

  isCategoryLiked: bookmarkStore.isCategoryLiked,
  toggleCategoryLiked: bookmarkStore.toggleCategoryLiked,
  getLikedCategorySlugs: bookmarkStore.getLikedCategorySlugs,

  isUserBlocked: bookmarkStore.isUserBlocked,
  blockUser: bookmarkStore.blockUser,
  getBlockedUserIds: bookmarkStore.getBlockedUserIds,

  subscribeBookmarks: bookmarkStore.subscribe,
};
