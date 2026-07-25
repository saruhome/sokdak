/**
 * Supabase 기반 인증/세션 상태 스토어.
 * - 로그인 상태와 프로필은 메모리 캐시로 유지하고, 실제 소스는 Supabase Auth + `profiles` 테이블.
 * - 저장한 단어/좋아요 한 게시글도 메모리 캐시(Set)로 유지하되, 실제 소스는 `saved_words`/`post_likes` 테이블.
 * - toggleWordSaved/togglePostLiked는 화면 코드에서 await 없이 호출되므로(기존 컨벤션 유지),
 *   먼저 로컬 캐시를 낙관적으로 갱신해 구독자에게 즉시 알리고, DB 반영은 백그라운드에서 처리한다.
 *   실패 시 롤백하고 다시 알린다.
 */
import { supabase } from './supabase';

type AuthListener = (loggedIn: boolean) => void;
type BookmarkListener = () => void;

export type SokDakUser = {
  id: string;
  name: string;
  email: string;
  emoji: string;
  level: string;
};

let _isLoggedIn = false;
let _user: SokDakUser | null = null;
const _listeners = new Set<AuthListener>();

const _savedWordIds = new Set<string>();
const _likedPostIds = new Set<string>();
const _bookmarkListeners = new Set<BookmarkListener>();

let _initialized = false;
let _initPromise: Promise<void> | null = null;

function notifyAuth() {
  _listeners.forEach(fn => fn(_isLoggedIn));
}

function notifyBookmarks() {
  _bookmarkListeners.forEach(fn => fn());
}

async function fetchProfile(userId: string, email: string): Promise<SokDakUser> {
  const { data } = await supabase
    .from('profiles')
    .select('nickname, avatar_emoji, level')
    .eq('id', userId)
    .single();

  return {
    id: userId,
    email,
    name: data?.nickname ?? email.split('@')[0],
    emoji: data?.avatar_emoji ?? '🐦',
    level: data?.level ?? '초급',
  };
}

async function fetchBookmarks(userId: string) {
  const [savedRes, likedRes] = await Promise.all([
    supabase.from('saved_words').select('word_id').eq('user_id', userId),
    supabase.from('post_likes').select('post_id').eq('user_id', userId),
  ]);
  _savedWordIds.clear();
  savedRes.data?.forEach(row => _savedWordIds.add(row.word_id));
  _likedPostIds.clear();
  likedRes.data?.forEach(row => _likedPostIds.add(row.post_id));
}

async function applySession(userId: string | undefined, email: string | undefined) {
  if (!userId || !email) {
    _isLoggedIn = false;
    _user = null;
    _savedWordIds.clear();
    _likedPostIds.clear();
    notifyAuth();
    notifyBookmarks();
    return;
  }
  _user = await fetchProfile(userId, email);
  _isLoggedIn = true;
  await fetchBookmarks(userId);
  notifyAuth();
  notifyBookmarks();
}

export const authStore = {
  /** 앱 시작 시 1회 호출 — 저장된 세션 복원 + 이후 인증 상태 변화 구독. */
  initialize() {
    if (_initPromise) return _initPromise;
    _initPromise = (async () => {
      const { data } = await supabase.auth.getSession();
      await applySession(data.session?.user.id, data.session?.user.email);
      _initialized = true;

      supabase.auth.onAuthStateChange((_event, session) => {
        applySession(session?.user.id, session?.user.email);
      });
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
      options: { data: { nickname, avatar_emoji: '🐦' } },
    });
    return {
      error: error?.message ?? null,
      needsEmailConfirmation: !error && !data.session,
    };
  },

  async signIn({ email, password }: { email: string; password: string }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async requestPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error?.message ?? null };
  },

  async updateUser(patch: Partial<{ name: string; emoji: string }>) {
    if (!_user) return { error: '로그인이 필요해요.' };
    const { error } = await supabase
      .from('profiles')
      .update({
        ...(patch.name !== undefined ? { nickname: patch.name } : {}),
        ...(patch.emoji !== undefined ? { avatar_emoji: patch.emoji } : {}),
      })
      .eq('id', _user.id);
    if (error) return { error: error.message };
    _user = { ..._user, ...(patch.name !== undefined ? { name: patch.name } : {}), ...(patch.emoji !== undefined ? { emoji: patch.emoji } : {}) };
    notifyAuth();
    return { error: null };
  },

  subscribe(fn: AuthListener) {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },

  /* ── 저장한 단어 ── */
  isWordSaved: (id: string) => _savedWordIds.has(id),
  toggleWordSaved(id: string) {
    if (!_user) return;
    const userId = _user.id;
    const wasSaved = _savedWordIds.has(id);
    if (wasSaved) _savedWordIds.delete(id); else _savedWordIds.add(id);
    notifyBookmarks();

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

  /* ── 좋아요 한 게시글 ── */
  isPostLiked: (id: string) => _likedPostIds.has(id),
  togglePostLiked(id: string) {
    if (!_user) return;
    const userId = _user.id;
    const wasLiked = _likedPostIds.has(id);
    if (wasLiked) _likedPostIds.delete(id); else _likedPostIds.add(id);
    notifyBookmarks();

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

  subscribeBookmarks(fn: BookmarkListener) {
    _bookmarkListeners.add(fn);
    return () => _bookmarkListeners.delete(fn);
  },
};
