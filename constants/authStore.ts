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

/** 이메일 인증·비밀번호 재설정 링크가 돌아올 주소.
 *  네이티브는 앱 스킴(sokdak://), 웹은 현재 오리진으로 자동 해석된다.
 *  Supabase 대시보드 Authentication > URL Configuration의 Redirect URLs에도 등록돼 있어야 한다. */
const AUTH_REDIRECT_URL = Linking.createURL('/auth/callback');

type AuthListener = (loggedIn: boolean) => void;
type BookmarkListener = () => void;

/* 비로그인(게스트) 즐겨찾기 로컬 보관 키 — 로그인하면 DB로 이관 후 비운다. */
const GUEST_SAVED_KEY = 'sokdak.guest.savedWords';
const GUEST_SAVED_POSTS_KEY = 'sokdak.guest.savedPosts';
const GUEST_LIKED_POSTS_KEY = 'sokdak.guest.likedPosts';
const GUEST_LIKED_CATEGORIES_KEY = 'sokdak.guest.likedCategories';

export type SokDakUser = {
  id: string;
  name: string;
  email: string;
  emoji: string;
  avatarUrl?: string | null;
  phone?: string | null;
  timezone: string;
  level: string;
  isPremium: boolean;
  streakCount: number;
};

/** ponytail: 무료 사용자(게스트 포함) 저장 단어 상한. 프리미엄은 무제한.
 *  실제 결제 연동 전까지는 클라이언트 상수 — 서버에서 강제하는 값이 아니라 UX 가드일 뿐이다. */
export const FREE_WORD_SAVE_LIMIT = 15;

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
/** 좋아요 한 댓글 — 로그인 계정에만 의미가 있어 게스트 이관 로직 없이 로그인 시에만 채운다 */
const _likedCommentIds = new Set<string>();
/** 좋아요 한 카테고리 — DB 테이블이 아직 없어 세션 동안만 유지(로그아웃/새로고침 시 초기화) */
const _likedCategorySlugs = new Set<string>();
/** 차단한 유저 — 로그인 계정에만 의미가 있어 게스트 이관 로직 없이 로그인 시에만 채운다 */
const _blockedUserIds = new Set<string>();
const _bookmarkListeners = new Set<BookmarkListener>();

let _initialized = false;
let _initPromise: Promise<void> | null = null;

function notifyAuth() {
  _listeners.forEach(fn => fn(_isLoggedIn));
}

function notifyBookmarks() {
  _bookmarkListeners.forEach(fn => fn());
  persistGuestBookmarks();
}

/** 게스트 즐겨찾기를 기기에 저장 — 로그인 상태에선 DB가 소스라 저장하지 않는다. */
function persistGuestBookmarks() {
  if (_user) return;
  Promise.all([
    AsyncStorage.setItem(GUEST_SAVED_KEY, JSON.stringify(Array.from(_savedWordIds))),
    AsyncStorage.setItem(GUEST_SAVED_POSTS_KEY, JSON.stringify(Array.from(_savedPostIds))),
    AsyncStorage.setItem(GUEST_LIKED_POSTS_KEY, JSON.stringify(Array.from(_likedPostIds))),
    AsyncStorage.setItem(GUEST_LIKED_CATEGORIES_KEY, JSON.stringify(Array.from(_likedCategorySlugs))),
  ]).catch(() => { /* 저장 실패해도 세션 내 동작에는 영향 없음 */ });
}

/** 앱 시작 시(비로그인) 기기에 저장된 게스트 즐겨찾기 복원 */
async function loadGuestBookmarks() {
  const read = async (key: string): Promise<string[]> => {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return []; /* 손상된 값이면 무시하고 빈 상태로 시작 */
    }
  };
  const [saved, savedPosts, likedPosts, likedCategories] = await Promise.all([
    read(GUEST_SAVED_KEY),
    read(GUEST_SAVED_POSTS_KEY),
    read(GUEST_LIKED_POSTS_KEY),
    read(GUEST_LIKED_CATEGORIES_KEY),
  ]);
  saved.forEach(id => _savedWordIds.add(id));
  savedPosts.forEach(id => _savedPostIds.add(id));
  likedPosts.forEach(id => _likedPostIds.add(id));
  likedCategories.forEach(slug => _likedCategorySlugs.add(slug));
}

function clearGuestBookmarkStorage() {
  Promise.all([
    AsyncStorage.removeItem(GUEST_SAVED_KEY),
    AsyncStorage.removeItem(GUEST_SAVED_POSTS_KEY),
    AsyncStorage.removeItem(GUEST_LIKED_POSTS_KEY),
    AsyncStorage.removeItem(GUEST_LIKED_CATEGORIES_KEY),
  ]).catch(() => {});
}

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
    .from('profiles')
    .update({ streak_count: nextStreak, last_active_date: today })
    .eq('id', userId);
  return error ? currentStreak : nextStreak;
}

async function fetchProfile(userId: string, email: string): Promise<SokDakUser> {
  const { data } = await supabase
    .from('profiles')
    .select('nickname, avatar_emoji, avatar_url, phone, timezone, level, is_premium, streak_count, last_active_date')
    .eq('id', userId)
    .single();

  const streakCount = await bumpStreak(userId, data?.last_active_date ?? null, data?.streak_count ?? 0);

  return {
    id: userId,
    email,
    name: data?.nickname ?? email.split('@')[0],
    emoji: data?.avatar_emoji ?? '🐦',
    avatarUrl: data?.avatar_url ?? null,
    phone: data?.phone ?? null,
    timezone: data?.timezone ?? 'UTC',
    level: data?.level ?? '초급',
    isPremium: data?.is_premium ?? false,
    streakCount,
  };
}

async function fetchBookmarks(userId: string) {
  /* 로그인 전 게스트 상태에서 저장해 둔 항목 — 아래에서 계정으로 이관한다. */
  const guestSaved = Array.from(_savedWordIds);
  const guestLiked = Array.from(_likedPostIds);
  const guestSavedPosts = Array.from(_savedPostIds);

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

  /* 게스트 저장분을 계정에 병합 (이미 있는 건 제외). 실패 시 로컬에도 반영하지 않는다. */
  const newSaved = guestSaved.filter(id => !_savedWordIds.has(id));
  const newSavedPosts = guestSavedPosts.filter(id => !_savedPostIds.has(id));
  const newLiked = guestLiked.filter(id => !_likedPostIds.has(id));

  if (newSaved.length > 0) {
    const { error } = await supabase
      .from('saved_words')
      .insert(newSaved.map(word_id => ({ user_id: userId, word_id })));
    if (!error) newSaved.forEach(id => _savedWordIds.add(id));
  }
  if (newSavedPosts.length > 0) {
    const { error } = await supabase
      .from('saved_posts')
      .insert(newSavedPosts.map(post_id => ({ user_id: userId, post_id })));
    if (!error) newSavedPosts.forEach(id => _savedPostIds.add(id));
  }
  if (newLiked.length > 0) {
    const { error } = await supabase
      .from('post_likes')
      .insert(newLiked.map(post_id => ({ user_id: userId, post_id })));
    if (!error) newLiked.forEach(id => _likedPostIds.add(id));
  }

  /* 계정으로 옮겼으니 기기에 남은 게스트 사본은 정리 */
  clearGuestBookmarkStorage();
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
    _likedPostIds.clear();
    _likedCommentIds.clear();
    _likedCategorySlugs.clear();
    _blockedUserIds.clear();
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
      } else {
        /* 게스트: applySession의 로그아웃 분기는 세트를 비우므로 호출하지 않고,
         * 기기에 저장해 둔 즐겨찾기를 복원한 뒤 구독자에게 알린다. */
        await loadGuestBookmarks();
        notifyAuth();
        notifyBookmarks();
      }
      _initialized = true;

      supabase.auth.onAuthStateChange((event, session) => {
        /* 구독 직후 즉시 발행되는 INITIAL_SESSION은 위에서 이미 처리했다.
         * 그대로 흘려보내면 게스트 분기에서 복원한 즐겨찾기를 로그아웃 분기가 지워버린다. */
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
    notifyAuth();
    notifyBookmarks();
  },

  async requestPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: AUTH_REDIRECT_URL });
    return { error: error?.message ?? null };
  },

  async updateUser(patch: Partial<{
    name: string; emoji: string; avatarUrl: string | null; phone: string | null; timezone: string;
  }>) {
    if (!_user) return { error: '로그인이 필요해요.' };
    const { error } = await supabase
      .from('profiles')
      .update({
        ...(patch.name !== undefined ? { nickname: patch.name } : {}),
        ...(patch.emoji !== undefined ? { avatar_emoji: patch.emoji } : {}),
        ...(patch.avatarUrl !== undefined ? { avatar_url: patch.avatarUrl } : {}),
        ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
        ...(patch.timezone !== undefined ? { timezone: patch.timezone } : {}),
      })
      .eq('id', _user.id);
    if (error) return { error: error.message };
    _user = {
      ..._user,
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.emoji !== undefined ? { emoji: patch.emoji } : {}),
      ...(patch.avatarUrl !== undefined ? { avatarUrl: patch.avatarUrl } : {}),
      ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
      ...(patch.timezone !== undefined ? { timezone: patch.timezone } : {}),
    };
    notifyAuth();
    return { error: null };
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
      .from('profiles')
      .select('notification_prefs')
      .eq('id', _user.id)
      .single();
    return { ...DEFAULT_NOTIFICATION_PREFS, ...(data?.notification_prefs as Partial<NotificationPrefs> ?? {}) };
  },

  async updateNotificationPrefs(prefs: NotificationPrefs) {
    if (!_user) return { error: '로그인이 필요해요.' };
    const { error } = await supabase
      .from('profiles')
      .update({ notification_prefs: prefs })
      .eq('id', _user.id);
    return { error: error?.message ?? null };
  },

  /* ── 프리미엄 ──
   * ponytail: 실제 결제 SDK(Google Play Billing/Stripe) 연동 전 임시 구조 — setPremiumStatus를
   * "테스트 활성화" 버튼이 직접 호출한다. 나중에 결제 웹훅이 서버에서 이 컬럼을 갱신하도록
   * 바꾸면 되고, 화면 쪽은 authStore.isPremium()만 보므로 수정할 필요가 없다.
   * 주의: profiles UPDATE RLS가 본인 행 전체를 허용하므로, 지금은 클라이언트가 직접
   * is_premium을 켤 수 있다 — 실 결제 연동 시 이 컬럼은 반드시 서버(webhook/서비스 롤)만
   * 쓰도록 RLS를 좁혀야 한다(컬럼 단위 정책 또는 트리거로 클라이언트 UPDATE 차단). */
  isPremium: () => _user?.isPremium ?? false,
  async setPremiumStatus(isPremium: boolean) {
    if (!_user) return { error: '로그인이 필요해요.' };
    const { error } = await supabase.from('profiles').update({ is_premium: isPremium }).eq('id', _user.id);
    if (error) return { error: error.message };
    _user = { ..._user, isPremium };
    notifyAuth();
    return { error: null };
  },
  getStreakCount: () => _user?.streakCount ?? 0,
  /** 무료 사용자(게스트 포함) 단어 저장 상한 체크 — 이미 저장된 단어를 해제하는 건 항상 허용,
   *  새로 추가할 때만 막는다. 화면에서 toggleWordSaved 호출 전에 확인한다. */
  canSaveMoreWords: () => _user?.isPremium === true || _savedWordIds.size < FREE_WORD_SAVE_LIMIT,

  /** 회원탈퇴 — DB의 delete_own_account()가 auth.users를 지우면 profiles/저장한 단어/게시글 등이
   *  전부 CASCADE로 함께 삭제된다. 성공하면 로컬 세션도 정리. */
  async deleteAccount() {
    const { error } = await supabase.rpc('delete_own_account');
    if (error) return { error: error.message };
    await supabase.auth.signOut();
    return { error: null };
  },

  subscribe(fn: AuthListener) {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },

  /* ── 저장한 단어 ── */
  isWordSaved: (id: string) => _savedWordIds.has(id),
  toggleWordSaved(id: string) {
    const wasSaved = _savedWordIds.has(id);
    if (wasSaved) _savedWordIds.delete(id); else _savedWordIds.add(id);
    notifyBookmarks();

    /* 비로그인(게스트)은 세션 메모리에만 유지 — 로그인 시 fetchBookmarks가 계정으로 이관한다. */
    if (!_user) return;
    const userId = _user.id;

    const write = wasSaved
      ? supabase.from('saved_words').delete().eq('user_id', userId).eq('word_id', id)
      : supabase.from('saved_words').insert({ user_id: userId, word_id: id });

    write.then(({ error }) => {
      if (!error) return;
      // 실패 시 롤백
      if (wasSaved) _savedWordIds.add(id); else _savedWordIds.delete(id);
      notifyBookmarks();
    });
  },
  getSavedWordIds: () => Array.from(_savedWordIds),

  /* ── 저장한 게시글 ── */
  isPostSaved: (id: string) => _savedPostIds.has(id),
  togglePostSaved(id: string) {
    const wasSaved = _savedPostIds.has(id);
    if (wasSaved) _savedPostIds.delete(id); else _savedPostIds.add(id);
    notifyBookmarks();

    if (!_user) return;
    const userId = _user.id;
    const write = wasSaved
      ? supabase.from('saved_posts').delete().eq('user_id', userId).eq('post_id', id)
      : supabase.from('saved_posts').insert({ user_id: userId, post_id: id });

    write.then(({ error }) => {
      if (!error) return;
      if (wasSaved) _savedPostIds.add(id); else _savedPostIds.delete(id);
      notifyBookmarks();
    });
  },
  getSavedPostIds: () => Array.from(_savedPostIds),

  /* ── 좋아요 한 게시글 ── */
  isPostLiked: (id: string) => _likedPostIds.has(id),
  togglePostLiked(id: string) {
    const wasLiked = _likedPostIds.has(id);
    if (wasLiked) _likedPostIds.delete(id); else _likedPostIds.add(id);
    notifyBookmarks();

    if (!_user) return;
    const userId = _user.id;

    const write = wasLiked
      ? supabase.from('post_likes').delete().eq('user_id', userId).eq('post_id', id)
      : supabase.from('post_likes').insert({ user_id: userId, post_id: id });

    write.then(({ error }) => {
      if (!error) return;
      if (wasLiked) _likedPostIds.add(id); else _likedPostIds.delete(id);
      notifyBookmarks();
    });
  },
  getLikedPostIds: () => Array.from(_likedPostIds),

  /* ── 좋아요 한 댓글 ── */
  isCommentLiked: (id: string) => _likedCommentIds.has(id),
  toggleCommentLiked(id: string) {
    const wasLiked = _likedCommentIds.has(id);
    if (wasLiked) _likedCommentIds.delete(id); else _likedCommentIds.add(id);
    notifyBookmarks();

    if (!_user) return;
    const userId = _user.id;

    const write = wasLiked
      ? supabase.from('comment_likes').delete().eq('user_id', userId).eq('comment_id', id)
      : supabase.from('comment_likes').insert({ user_id: userId, comment_id: id });

    write.then(({ error }) => {
      if (!error) return;
      if (wasLiked) _likedCommentIds.add(id); else _likedCommentIds.delete(id);
      notifyBookmarks();
    });
  },

  /* ── 좋아요 한 카테고리 (세션 전용, DB 미연동) ── */
  isCategoryLiked: (slug: string) => _likedCategorySlugs.has(slug),
  toggleCategoryLiked(slug: string) {
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
    return () => _bookmarkListeners.delete(fn);
  },
};
