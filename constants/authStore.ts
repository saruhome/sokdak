/**
 * Supabase 기반 인증/세션 상태 스토어.
 * - 로그인 상태와 프로필은 메모리 캐시로 유지하고, 실제 소스는 Supabase Auth + `profiles` 테이블.
 * - 저장한 단어/게시글 저장/좋아요 한 게시글도 메모리 캐시(Set)로 유지하되, 실제 소스는
 *   `saved_words`/`saved_posts`/`post_likes` 테이블.
 * - toggleWordSaved/togglePostLiked/togglePostSaved는 화면 코드에서 await 없이 호출되므로(기존 컨벤션 유지),
 *   먼저 로컬 캐시를 낙관적으로 갱신해 구독자에게 즉시 알리고, DB 반영은 백그라운드에서 처리한다.
 *   실패 시 롤백하고 다시 알린다.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';
import { createProfileAvatarSignedUrl, isProfileAvatarPath } from './profileAvatarStorage';

/** 이메일 인증·비밀번호 재설정 링크가 돌아올 주소.
 *  네이티브는 앱 스킴(sokdak://), 웹은 현재 오리진으로 자동 해석된다.
 *  Supabase 대시보드 Authentication > URL Configuration의 Redirect URLs에도 등록돼 있어야 한다. */
const AUTH_REDIRECT_URL = Linking.createURL('/auth/callback');

type AuthListener = (loggedIn: boolean) => void;
type BookmarkListener = () => void;

export type SokDakUser = {
  id: string;
  name: string;
  email: string;
  emoji: string;
  /** DB에 저장되는 private Storage 상대 경로 또는 기존 공개 URL. */
  avatarPath?: string | null;
  /** 화면에서만 쓰는 signed URL 또는 기존 공개 URL. */
  avatarUrl?: string | null;
  phone?: string | null;
  timezone: string;
  level: string;
  isPremium: boolean;
  streakCount: number;
};

/** ponytail: 무료 회원 저장 단어/좋아요 카테고리/TTS 일일 상한. 프리미엄은 무제한.
 *  실제 결제 연동 전까지는 클라이언트 상수 — 서버에서 강제하는 값이 아니라 UX 가드일 뿐이다. */
export const FREE_WORD_SAVE_LIMIT = 3;
export const FREE_CATEGORY_LIKE_LIMIT = 2;
export const FREE_TTS_DAILY_LIMIT = 3;
/** 결제가 비활성인 비공개 베타에서는 유료 제한·자동 삭제를 적용하지 않는다. */
export const BETA_UNLIMITED_ENTITLEMENTS = true;

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

let _isLoggedIn = false;
let _user: SokDakUser | null = null;
const _listeners = new Set<AuthListener>();

const _savedWordIds = new Set<string>();
const _savedPostIds = new Set<string>();
const _likedPostIds = new Set<string>();
/** 좋아요 한 댓글 — 로그인 계정에만 의미가 있어 로그인 시에만 채운다 */
const _likedCommentIds = new Set<string>();
/** 좋아요 한 카테고리 — DB 테이블이 아직 없어 세션 동안만 유지(로그아웃/새로고침 시 초기화) */
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

function notifyAuth() {
  _listeners.forEach(fn => fn(_isLoggedIn));
}

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

type BookmarkTable = 'saved_words' | 'saved_posts' | 'post_likes' | 'comment_likes';

/** id 하나를 (user_id, <idColumn>) 조인 테이블에 낙관적으로 insert/delete하는 공용 토글.
 * toggleWordSaved/togglePostSaved/togglePostLiked/toggleCommentLiked가 테이블·컬럼명만 바꿔 공유한다.
 * requireLogin이 true면 비로그인일 때 로컬 Set도 건드리지 않고 그냥 no-op(단어 저장 전용). */
function toggleBookmark(set: Set<string>, id: string, table: BookmarkTable, idColumn: string, requireLogin: boolean) {
  if (requireLogin && !_user) return;

  const was = set.has(id);
  if (was) set.delete(id); else set.add(id);
  notifyBookmarks();

  if (!_user) return;
  const userId = _user.id;

  // ponytail: 테이블/컬럼이 런타임 문자열이라 Supabase의 리터럴 유니언 타입과 안 맞음 — any로 우회.
  const write = was
    ? supabase.from(table).delete().eq('user_id', userId).eq(idColumn, id)
    : (supabase.from(table) as any).insert({ user_id: userId, [idColumn]: id });

  write.then(({ error }: { error: unknown }) => {
    if (!error) return;
    if (was) set.add(id); else set.delete(id);
    notifyBookmarks();
  });
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

async function fetchProfile(userId: string, email: string): Promise<SokDakUser> {
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
  const signedAvatarUrl = await createProfileAvatarSignedUrl(avatarPath);

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
}

async function fetchBookmarks(userId: string) {
  const [savedRes, likedRes, savedPostsRes, likedCommentsRes] = await Promise.all([
    supabase.from('saved_words').select('word_id').eq('user_id', userId),
    supabase.from('post_likes').select('post_id').eq('user_id', userId),
    supabase.from('saved_posts').select('post_id').eq('user_id', userId),
    supabase.from('comment_likes').select('comment_id').eq('user_id', userId),
  ]);

  _savedWordIds.clear();
  savedRes.data?.forEach(row => _savedWordIds.add(row.word_id));
  _likedPostIds.clear();
  likedRes.data?.forEach(row => _likedPostIds.add(row.post_id));
  _savedPostIds.clear();
  savedPostsRes.data?.forEach(row => _savedPostIds.add(row.post_id));
  _likedCommentIds.clear();
  likedCommentsRes.data?.forEach(row => _likedCommentIds.add(row.comment_id));

  await loadTtsPlaysToday(userId);
}

async function fetchBlockedUsers(userId: string) {
  const { data } = await supabase.from('blocked_users').select('blocked_id').eq('blocker_id', userId);
  _blockedUserIds.clear();
  data?.forEach(row => _blockedUserIds.add(row.blocked_id));
}

async function applySession(userId: string | undefined, email: string | undefined) {
  if (!userId || !email) {
    _isLoggedIn = false;
    _user = null;
    _savedWordIds.clear();
    _savedPostIds.clear();
    _likedPostIds.clear();
    _likedCommentIds.clear();
    _likedCategorySlugs.clear();
    _blockedUserIds.clear();
    _ttsPlaysToday = 0;
    _ttsPlaysDate = '';
    notifyAuth();
    notifyBookmarks();
    return;
  }
  _user = await fetchProfile(userId, email);
  _isLoggedIn = true;
  await Promise.all([fetchBookmarks(userId), fetchBlockedUsers(userId)]);
  notifyAuth();
  notifyBookmarks();
}

export const authStore = {
  /** 앱 시작 시 1회 호출 — 저장된 세션 복원 + 이후 인증 상태 변화 구독. */
  initialize() {
    if (_initPromise) return _initPromise;
    _initPromise = (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await applySession(data.session.user.id, data.session.user.email);
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
          await supabase.auth.setSession({ access_token, refresh_token });
        }
      };
      consumeAuthLink(await Linking.getInitialURL());
      Linking.addEventListener('url', ({ url }) => { consumeAuthLink(url); });
    })();
    return _initPromise;
  },
  isInitialized: () => _initialized,

  isLoggedIn: () => _isLoggedIn,
  getUser: () => _user,

  /**
   * 회원가입: profiles row는 DB 트리거(handle_new_user)가 자동 생성.
   * Supabase 프로젝트의 "Confirm email" 설정이 켜져 있으면 session이 바로 오지 않고
   * 이메일 인증 후에야 로그인 가능 — needsEmailConfirmation으로 화면에서 분기.
   */
  async signUp({ email, password, nickname }: { email: string; password: string; nickname: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname, avatar_emoji: '🐦' },
        /* 지정하지 않으면 Supabase 기본 Site URL(웹)로 리다이렉트돼 폰에서 인증 후 앱으로
         * 돌아올 방법이 없다. 앱 스킴(sokdak://) 딥링크로 되돌려 세션을 넘겨받는다. */
        emailRedirectTo: AUTH_REDIRECT_URL,
      },
    });
    return {
      error: error?.message ?? null,
      needsEmailConfirmation: !error && !data.session,
    };
  },

  async signIn({ email, password }: { email: string; password: string }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        await applySession(data.session.user.id, data.session.user.email);
      }
    }
    return { error: error?.message ?? null };
  },

  async logout() {
    await supabase.auth.signOut();
    _isLoggedIn = false;
    _user = null;
    _savedWordIds.clear();
    _savedPostIds.clear();
    _likedPostIds.clear();
    _likedCategorySlugs.clear();
    _ttsPlaysToday = 0;
    _ttsPlaysDate = '';
    notifyAuth();
    notifyBookmarks();
  },

  async requestPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: AUTH_REDIRECT_URL });
    return { error: error?.message ?? null };
  },

  async updateUser(patch: Partial<{
    name: string; emoji: string; avatarPath: string | null; phone: string | null; timezone: string;
  }>) {
    if (!_user) return { error: '로그인이 필요해요.' };

    if (patch.name !== undefined || patch.emoji !== undefined || patch.avatarPath !== undefined) {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...(patch.name !== undefined ? { nickname: patch.name } : {}),
          ...(patch.emoji !== undefined ? { avatar_emoji: patch.emoji } : {}),
          ...(patch.avatarPath !== undefined ? { avatar_url: patch.avatarPath } : {}),
        })
        .eq('id', _user.id);
      if (error) return { error: error.message };
    }

    if (patch.phone !== undefined || patch.timezone !== undefined) {
      const { error } = await supabase
        .from('account_settings')
        .update({
          ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
          ...(patch.timezone !== undefined ? { timezone: patch.timezone } : {}),
        })
        .eq('user_id', _user.id);
      if (error) return { error: error.message };
    }

    const signedAvatarUrl = patch.avatarPath !== undefined
      ? await createProfileAvatarSignedUrl(patch.avatarPath)
      : undefined;

    _user = {
      ..._user,
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.emoji !== undefined ? { emoji: patch.emoji } : {}),
      ...(patch.avatarPath !== undefined ? {
        avatarPath: patch.avatarPath,
        avatarUrl: signedAvatarUrl ?? (isProfileAvatarPath(patch.avatarPath) ? null : patch.avatarPath),
      } : {}),
      ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
      ...(patch.timezone !== undefined ? { timezone: patch.timezone } : {}),
    };
    notifyAuth();
    return { error: null };
  },

  /** 앱이 foreground로 복귀할 때 private 아바타의 짧은 수명 signed URL만 재발급한다. */
  async refreshProfileAvatarSignedUrl() {
    if (!_user || !isProfileAvatarPath(_user.avatarPath)) return { error: null };

    const signedAvatarUrl = await createProfileAvatarSignedUrl(_user.avatarPath);
    if (!signedAvatarUrl) return { error: '프로필 사진 링크를 새로 만들 수 없어요.' };

    _user = { ..._user, avatarUrl: signedAvatarUrl };
    notifyAuth();
    return { error: null };
  },

  /**
   * 커뮤니티 게시 전, 서버가 판정한 최신 활성 정책 버전에 동의했는지 확인한다.
   * 단순 timestamp 캐시는 정책 개정 후에도 남을 수 있으므로 권한 판단에 사용하지 않는다.
   */
  async hasAcceptedCommunityGuidelines() {
    if (!_user) return false;
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
    locale: 'ko' | 'en' | 'ja' | 'es' | 'vi';
    source?: 'community_onboarding' | 'post_gate' | 'comment_gate' | 'policy_update' | 'account_settings';
    appVersion?: string;
    platform?: 'android' | 'ios' | 'web';
  }) {
    if (!_user) return { error: '로그인이 필요해요.', consent: null };
    const { data, error } = await supabase.rpc('accept_current_community_policy', {
      p_locale: locale,
      p_source: source,
      p_app_version: appVersion ?? null,
      p_platform: platform ?? null,
    });
    return { error: error?.message ?? null, consent: data?.[0] ?? null };
  },

  /** 이메일 변경 — Supabase가 새 주소로 확인 메일을 보내고, 확인 후에 실제로 바뀐다. */
  async updateEmail(email: string) {
    const { error } = await supabase.auth.updateUser({ email });
    return { error: error?.message ?? null };
  },

  /** 비밀번호 변경 — 재로그인 없이 현재 세션으로 바로 변경된다. */
  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  },

  /** 알림 설정 — `like`/`comment`는 실제 알림 트리거(notify_on_like/notify_on_comment)가 참고한다.
   *  newSlang/popularSlang/popularPost는 아직 그 알림 자체를 만드는 백엔드가 없어 값만 저장된다. */
  async fetchNotificationPrefs(): Promise<NotificationPrefs> {
    if (!_user) return DEFAULT_NOTIFICATION_PREFS;
    const { data } = await supabase
      .from('account_settings')
      .select('notification_prefs')
      .eq('user_id', _user.id)
      .single();
    return { ...DEFAULT_NOTIFICATION_PREFS, ...(data?.notification_prefs as Partial<NotificationPrefs> ?? {}) };
  },

  async updateNotificationPrefs(prefs: NotificationPrefs) {
    if (!_user) return { error: '로그인이 필요해요.' };
    const { error } = await supabase
      .from('account_settings')
      .update({ notification_prefs: prefs })
      .eq('user_id', _user.id);
    return { error: error?.message ?? null };
  },

  /* ── 프리미엄 ──
   * entitlement는 결제 서버의 영수증 검증·웹훅만 갱신해야 한다. 앱은 현재 서버가 전달한
   * 상태를 읽기만 하며, 클라이언트에서 is_premium을 직접 쓰는 경로는 제공하지 않는다. */
  isPremium: () => _user?.isPremium ?? false,
  getStreakCount: () => _user?.streakCount ?? 0,
  /** 무료 회원 단어 저장 상한 체크 — 이미 저장된 단어를 해제하는 건 항상 허용,
   *  새로 추가할 때만 막는다. 화면에서 toggleWordSaved 호출 전에 확인한다. */
  canSaveMoreWords: () => BETA_UNLIMITED_ENTITLEMENTS || _user?.isPremium === true || _savedWordIds.size < FREE_WORD_SAVE_LIMIT,
  /** 무료 회원 카테고리 좋아요 상한 — 단어 저장과 동일한 패턴, 해제는 항상 허용 */
  canLikeMoreCategories: () => BETA_UNLIMITED_ENTITLEMENTS || _user?.isPremium === true || _likedCategorySlugs.size < FREE_CATEGORY_LIKE_LIMIT,

  /** 무료 회원 TTS 일일 재생 상한. 비로그인은 애초에 speakWord에서 로그인 요구로 막는다. */
  canPlayTtsToday: () => {
    if (BETA_UNLIMITED_ENTITLEMENTS) return Boolean(_user);
    if (_user?.isPremium) return true;
    if (!_user) return false;
    if (_ttsPlaysDate !== todayString()) return true; // 날짜가 바뀌었으면 아직 오늘 재생 없음
    return _ttsPlaysToday < FREE_TTS_DAILY_LIMIT;
  },
  recordTtsPlay() {
    if (!_user || _user.isPremium || BETA_UNLIMITED_ENTITLEMENTS) return;
    const today = todayString();
    if (_ttsPlaysDate !== today) { _ttsPlaysDate = today; _ttsPlaysToday = 0; }
    _ttsPlaysToday += 1;
    AsyncStorage.setItem(ttsStorageKey(_user.id), String(_ttsPlaysToday)).catch(() => {});
  },

  /** 회원탈퇴 — 인증된 호출자를 Edge Function에서 검증한 뒤, 서비스 역할로 Auth·연관 DB 데이터와
   *  본인 게시 이미지 Storage 객체를 정리한다. 클라이언트는 privileged RPC를 직접 실행하지 않는다. */
  async deleteAccount() {
    const { data, error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
    if (error) return { error: error.message };
    if (!data?.deleted) return { error: '회원탈퇴 처리 결과를 확인할 수 없어요.' };
    await supabase.auth.signOut();
    return { error: null };
  },

  subscribe(fn: AuthListener) {
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
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

  /* ── 좋아요 한 카테고리 (세션 전용, DB 미연동) ── */
  isCategoryLiked: (slug: string) => _likedCategorySlugs.has(slug),
  toggleCategoryLiked(slug: string) {
    if (!_user) return;
    if (_likedCategorySlugs.has(slug)) _likedCategorySlugs.delete(slug); else _likedCategorySlugs.add(slug);
    notifyBookmarks();
  },
  getLikedCategorySlugs: () => Array.from(_likedCategorySlugs),

  /* ── 차단한 유저 — 차단하면 그 유저 글이 목록에서 안 보인다(constants/community.ts에서 필터링) ── */
  isUserBlocked: (userId: string) => _blockedUserIds.has(userId),
  async blockUser(userId: string) {
    if (!_user) return { error: '로그인이 필요해요.' };
    _blockedUserIds.add(userId);
    notifyBookmarks();
    const { error } = await supabase.from('blocked_users').insert({ blocker_id: _user.id, blocked_id: userId });
    if (error) { _blockedUserIds.delete(userId); notifyBookmarks(); return { error: error.message }; }
    return { error: null };
  },
  getBlockedUserIds: () => Array.from(_blockedUserIds),

  subscribeBookmarks(fn: BookmarkListener) {
    _bookmarkListeners.add(fn);
    return () => { _bookmarkListeners.delete(fn); };
  },
};
