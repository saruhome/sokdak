/**
 * Supabase 기반 인증/세션 상태 스토어 — auth migration 진행 중.
 * - 세션 상태(현재 유저·로그인 여부·인증 리스너)의 소유자는 src/features/auth/model/sessionStore.ts,
 *   stateless Supabase 인증 호출은 src/features/auth/api/authApi.ts로 이동했다.
 * - 이 파일은 잔여 orchestration(프로필 fetch, 북마크/차단 캐시, 정책 동의, entitlement)과
 *   기존 화면들이 쓰는 public API의 호환 facade를 담당한다. 로직은 이동 전과 동일하다.
 * - 저장한 단어/게시글 저장/좋아요 한 게시글은 메모리 캐시(Set)로 유지하되, 실제 소스는
 *   `saved_words`/`saved_posts`/`post_likes` 테이블.
 * - toggleWordSaved/togglePostLiked/togglePostSaved는 화면 코드에서 await 없이 호출되므로(기존 컨벤션 유지),
 *   먼저 로컬 캐시를 낙관적으로 갱신해 구독자에게 즉시 알리고, DB 반영은 백그라운드에서 처리한다.
 *   실패 시 롤백하고 다시 알린다.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';
import type { Language } from './languageStore';
import { authApi } from '../src/features/auth/api/authApi';
import { sessionStore, type AuthListener, type SokDakUser } from '../src/features/auth/model/sessionStore';
import { profileStore, type NotificationPrefs } from '../src/features/auth/model/profileStore';

export type { SokDakUser, NotificationPrefs };

type BookmarkListener = () => void;

/** ponytail: 무료 회원 저장 단어/좋아요 카테고리/TTS 일일 상한. 프리미엄은 무제한.
 *  실제 결제 연동 전까지는 클라이언트 상수 — 서버에서 강제하는 값이 아니라 UX 가드일 뿐이다. */
export const FREE_WORD_SAVE_LIMIT = 3;
export const FREE_CATEGORY_LIKE_LIMIT = 2;
export const FREE_TTS_DAILY_LIMIT = 3;
/** 결제가 비활성인 비공개 베타에서는 유료 제한·자동 삭제를 적용하지 않는다. */
export const BETA_UNLIMITED_ENTITLEMENTS = true;

const _savedWordIds = new Set<string>();
const _savedPostIds = new Set<string>();
const _likedPostIds = new Set<string>();
/** 좋아요 한 댓글 — 로그인 계정에만 의미가 있어 로그인 시에만 채운다 */
const _likedCommentIds = new Set<string>();
/** 좋아요 한 카테고리 — liked_categories 테이블에 영속화 */
const _likedCategorySlugs = new Set<string>();
/** 차단한 유저 — 로그인 계정에만 의미가 있어 로그인 시에만 채운다 */
const _blockedUserIds = new Set<string>();
const _bookmarkListeners = new Set<BookmarkListener>();

/** 무료 회원 TTS 일일 재생 횟수 — 계정+날짜별로 기기에 저장(서버 강제 아님, UX 가드).
 *  ponytail: 세션이 자정을 넘겨 계속 켜져 있으면 갱신은 다음 recordTtsPlay/canPlayTtsToday
 *  호출 시점에 반영된다 — 실시간 자정 리셋 타이머는 만들지 않았다. */
let _ttsPlaysToday = 0;
let _ttsPlaysDate = '';

let _initialized = false;
let _initPromise: Promise<void> | null = null;

function notifyBookmarks() {
  _bookmarkListeners.forEach(fn => fn());
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function ttsStorageKey(userId: string) {
  return `sokdak.tts.${userId}.${todayString()}`;
}

async function loadTtsPlaysToday(userId: string) {
  const today = todayString();
  const raw = await AsyncStorage.getItem(ttsStorageKey(userId));
  _ttsPlaysToday = raw ? parseInt(raw, 10) || 0 : 0;
  _ttsPlaysDate = today;
}

type BookmarkTable = 'saved_words' | 'saved_posts' | 'post_likes' | 'comment_likes' | 'liked_categories';

/** id 하나를 (user_id, <idColumn>) 조인 테이블에 낙관적으로 insert/delete하는 공용 토글.
 * toggleWordSaved/togglePostSaved/togglePostLiked/toggleCommentLiked가 테이블·컬럼명만 바꿔 공유한다.
 * requireLogin이 true면 비로그인일 때 로컬 Set도 건드리지 않고 그냥 no-op(단어 저장 전용). */
function toggleBookmark(set: Set<string>, id: string, table: BookmarkTable, idColumn: string, requireLogin: boolean) {
  const user = sessionStore.getUser();
  if (requireLogin && !user) return;

  const was = set.has(id);
  if (was) set.delete(id); else set.add(id);
  notifyBookmarks();

  if (!user) return;
  const userId = user.id;

  // ponytail: 테이블/컬럼이 런타임 문자열이라 Supabase의 리터럴 유니언 타입과 안 맞음 — any로 우회.
  const write = was
    ? supabase.from(table as any).delete().eq('user_id', userId).eq(idColumn, id)
    : supabase.from(table as any).insert({ user_id: userId, [idColumn]: id });

  write.then(({ error }: { error: unknown }) => {
    if (!error) return;
    if (was) set.add(id); else set.delete(id);
    notifyBookmarks();
  });
}

async function fetchBookmarks(userId: string) {
  const [savedRes, likedRes, savedPostsRes, likedCommentsRes, likedCategoriesRes] = await Promise.all([
    supabase.from('saved_words').select('word_id').eq('user_id', userId),
    supabase.from('post_likes').select('post_id').eq('user_id', userId),
    supabase.from('saved_posts').select('post_id').eq('user_id', userId),
    supabase.from('comment_likes').select('comment_id').eq('user_id', userId),
    // ponytail: liked_categories는 아직 운영 DB에 없는 신규 마이그레이션이라 생성된 타입에
    // 없음 — toggleBookmark의 insert와 동일하게 any로 우회. 마이그레이션 적용 + 타입 재생성 후
    // 지워도 되는 캐스트.
    (supabase.from('liked_categories' as any) as any).select('category_slug').eq('user_id', userId),
  ]);

  _savedWordIds.clear();
  savedRes.data?.forEach(row => _savedWordIds.add(row.word_id));
  _likedPostIds.clear();
  likedRes.data?.forEach(row => _likedPostIds.add(row.post_id));
  _savedPostIds.clear();
  savedPostsRes.data?.forEach(row => _savedPostIds.add(row.post_id));
  _likedCommentIds.clear();
  likedCommentsRes.data?.forEach(row => _likedCommentIds.add(row.comment_id));
  _likedCategorySlugs.clear();
  likedCategoriesRes.data?.forEach((row: { category_slug: string }) => _likedCategorySlugs.add(row.category_slug));

  await loadTtsPlaysToday(userId);
}

async function fetchBlockedUsers(userId: string) {
  const { data } = await supabase.from('blocked_users').select('blocked_id').eq('blocker_id', userId);
  _blockedUserIds.clear();
  data?.forEach(row => _blockedUserIds.add(row.blocked_id));
}

function clearLocalCaches() {
  profileStore.clearAvatarSignedUrlExpiry();
  _savedWordIds.clear();
  _savedPostIds.clear();
  _likedPostIds.clear();
  _likedCommentIds.clear();
  _likedCategorySlugs.clear();
  _blockedUserIds.clear();
  _ttsPlaysToday = 0;
  _ttsPlaysDate = '';
}

async function applySession(userId: string | undefined, email: string | undefined) {
  if (!userId || !email) {
    sessionStore.clearUser();
    clearLocalCaches();
    sessionStore.notify();
    notifyBookmarks();
    return;
  }
  sessionStore.setUser(await profileStore.fetchProfile(userId, email));
  await Promise.all([fetchBookmarks(userId), fetchBlockedUsers(userId)]);
  sessionStore.notify();
  notifyBookmarks();
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
    /* 이동 전 코드와 동일하게 likedComment/blocked는 세션 종료 알림 전에 명시적으로 비우지
     * 않았어도 applySession(undefined)가 곧 이어 정리한다 — 여기서는 전체를 한 번에 비운다. */
    clearLocalCaches();
    sessionStore.notify();
    notifyBookmarks();
  },

  requestPasswordReset: authApi.requestPasswordReset,

  updateUser: profileStore.updateUser,
  refreshProfileAvatarSignedUrl: profileStore.refreshProfileAvatarSignedUrl,
  getProfileAvatarSignedUrlExpiresAt: profileStore.getProfileAvatarSignedUrlExpiresAt,

  /**
   * 커뮤니티 게시 전, 서버가 판정한 최신 활성 정책 버전에 동의했는지 확인한다.
   * 단순 timestamp 캐시는 정책 개정 후에도 남을 수 있으므로 권한 판단에 사용하지 않는다.
   */
  async hasAcceptedCommunityGuidelines() {
    if (!sessionStore.getUser()) return false;
    const { data, error } = await supabase.rpc('has_accepted_current_community_policy');
    return !error && data === true;
  },

  /**
   * 정책 화면에서 사용자가 명시적으로 동의하면 서버 RPC가 정책 버전·언어·원문
   * 해시·서버 시각을 append-only 동의 이력에 기록한다. 현재 UI 언어는 정책
   * 전문을 표시한 언어와 같아야 하므로 호출 화면이 locale을 명시적으로 넘긴다.
   */
  async acceptCommunityGuidelines({
    locale,
    source = 'community_onboarding',
    appVersion,
    platform,
  }: {
    locale: Language;
    source?: 'community_onboarding' | 'post_gate' | 'comment_gate' | 'policy_update' | 'account_settings';
    appVersion?: string;
    platform?: 'android' | 'ios' | 'web';
  }) {
    if (!sessionStore.getUser()) return { error: '로그인이 필요해요.', consent: null };
    const { data, error } = await supabase.rpc('accept_current_community_policy', {
      p_locale: locale,
      p_source: source,
      p_app_version: appVersion ?? null,
      p_platform: platform ?? null,
    });
    return { error: error?.message ?? null, consent: data?.[0] ?? null };
  },

  updateEmail: authApi.updateEmail,
  updatePassword: authApi.updatePassword,

  fetchNotificationPrefs: profileStore.fetchNotificationPrefs,
  updateNotificationPrefs: profileStore.updateNotificationPrefs,

  /* ── 프리미엄 ──
   * entitlement는 결제 서버의 영수증 검증·웹훅만 갱신해야 한다. 앱은 현재 서버가 전달한
   * 상태를 읽기만 하며, 클라이언트에서 is_premium을 직접 쓰는 경로는 제공하지 않는다. */
  isPremium: () => sessionStore.getUser()?.isPremium ?? false,
  getStreakCount: () => sessionStore.getUser()?.streakCount ?? 0,
  /** 무료 회원 단어 저장 상한 체크 — 이미 저장된 단어를 해제하는 건 항상 허용,
   *  새로 추가할 때만 막는다. 화면에서 toggleWordSaved 호출 전에 확인한다. */
  canSaveMoreWords: () => BETA_UNLIMITED_ENTITLEMENTS || sessionStore.getUser()?.isPremium === true || _savedWordIds.size < FREE_WORD_SAVE_LIMIT,
  /** 무료 회원 카테고리 좋아요 상한 — 단어 저장과 동일한 패턴, 해제는 항상 허용 */
  canLikeMoreCategories: () => BETA_UNLIMITED_ENTITLEMENTS || sessionStore.getUser()?.isPremium === true || _likedCategorySlugs.size < FREE_CATEGORY_LIKE_LIMIT,

  /** 무료 회원 TTS 일일 재생 상한. 비로그인은 애초에 speakWord에서 로그인 요구로 막는다. */
  canPlayTtsToday: () => {
    const user = sessionStore.getUser();
    if (BETA_UNLIMITED_ENTITLEMENTS) return Boolean(user);
    if (user?.isPremium) return true;
    if (!user) return false;
    if (_ttsPlaysDate !== todayString()) return true; // 날짜가 바뀌었으면 아직 오늘 재생 없음
    return _ttsPlaysToday < FREE_TTS_DAILY_LIMIT;
  },
  recordTtsPlay() {
    const user = sessionStore.getUser();
    if (!user || user.isPremium || BETA_UNLIMITED_ENTITLEMENTS) return;
    const today = todayString();
    if (_ttsPlaysDate !== today) { _ttsPlaysDate = today; _ttsPlaysToday = 0; }
    _ttsPlaysToday += 1;
    AsyncStorage.setItem(ttsStorageKey(user.id), String(_ttsPlaysToday)).catch(() => {});
  },

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

  /* ── 저장한 단어 (로그인 전용 — 화면에서 isLoggedIn() 확인 후 호출할 것) ── */
  isWordSaved: (id: string) => _savedWordIds.has(id),
  toggleWordSaved(id: string) { toggleBookmark(_savedWordIds, id, 'saved_words', 'word_id', true); },
  getSavedWordIds: () => Array.from(_savedWordIds),

  /* ── 저장한 게시글 ── */
  isPostSaved: (id: string) => _savedPostIds.has(id),
  togglePostSaved(id: string) { toggleBookmark(_savedPostIds, id, 'saved_posts', 'post_id', false); },
  getSavedPostIds: () => Array.from(_savedPostIds),

  /* ── 좋아요 한 게시글 ── */
  isPostLiked: (id: string) => _likedPostIds.has(id),
  togglePostLiked(id: string) { toggleBookmark(_likedPostIds, id, 'post_likes', 'post_id', false); },
  getLikedPostIds: () => Array.from(_likedPostIds),

  /* ── 좋아요 한 댓글 ── */
  isCommentLiked: (id: string) => _likedCommentIds.has(id),
  toggleCommentLiked(id: string) { toggleBookmark(_likedCommentIds, id, 'comment_likes', 'comment_id', false); },

  /* ── 좋아요 한 카테고리 — liked_categories 테이블에 영속화(마이페이지가 즐겨찾기로 보여주므로) ── */
  isCategoryLiked: (slug: string) => _likedCategorySlugs.has(slug),
  toggleCategoryLiked(slug: string) {
    toggleBookmark(_likedCategorySlugs, slug, 'liked_categories', 'category_slug', true);
  },
  getLikedCategorySlugs: () => Array.from(_likedCategorySlugs),

  /* ── 차단한 유저 — 차단하면 그 유저 글이 목록에서 안 보인다(constants/community.ts에서 필터링) ── */
  isUserBlocked: (userId: string) => _blockedUserIds.has(userId),
  async blockUser(userId: string) {
    const user = sessionStore.getUser();
    if (!user) return { error: '로그인이 필요해요.' };
    _blockedUserIds.add(userId);
    notifyBookmarks();
    const { error } = await supabase.from('blocked_users').insert({ blocker_id: user.id, blocked_id: userId });
    if (error) { _blockedUserIds.delete(userId); notifyBookmarks(); return { error: error.message }; }
    return { error: null };
  },
  getBlockedUserIds: () => Array.from(_blockedUserIds),

  subscribeBookmarks(fn: BookmarkListener) {
    _bookmarkListeners.add(fn);
    return () => { _bookmarkListeners.delete(fn); };
  },
};
