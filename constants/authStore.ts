/**
 * 간단한 세션 기반 인증 상태 스토어
 * 실제 앱에서는 zustand / React Context + SecureStore로 대체
 */
type AuthListener = (loggedIn: boolean) => void;
type BookmarkListener = () => void;

let _isLoggedIn = false;
let _user: { name: string; email: string; emoji: string } | null = null;
const _listeners = new Set<AuthListener>();

/** 세션 동안 유지되는 저장한 단어 / 좋아요 한 게시글 (로그아웃 시 초기화) */
const _savedWordIds = new Set<string>();
const _likedPostIds = new Set<string>();
const _bookmarkListeners = new Set<BookmarkListener>();

export const authStore = {
  isLoggedIn: () => _isLoggedIn,
  getUser: () => _user,

  login(user: { name: string; email: string; emoji: string }) {
    _isLoggedIn = true;
    _user = user;
    _listeners.forEach(fn => fn(true));
  },

  logout() {
    _isLoggedIn = false;
    _user = null;
    _savedWordIds.clear();
    _likedPostIds.clear();
    _listeners.forEach(fn => fn(false));
    _bookmarkListeners.forEach(fn => fn());
  },

  updateUser(patch: Partial<{ name: string; email: string; emoji: string }>) {
    if (!_user) return;
    _user = { ..._user, ...patch };
    _listeners.forEach(fn => fn(_isLoggedIn));
  },

  subscribe(fn: AuthListener) {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },

  /* ── 저장한 단어 ── */
  isWordSaved: (id: string) => _savedWordIds.has(id),
  toggleWordSaved(id: string) {
    if (_savedWordIds.has(id)) _savedWordIds.delete(id); else _savedWordIds.add(id);
    _bookmarkListeners.forEach(fn => fn());
  },
  getSavedWordIds: () => Array.from(_savedWordIds),

  /* ── 좋아요 한 게시글 ── */
  isPostLiked: (id: string) => _likedPostIds.has(id),
  togglePostLiked(id: string) {
    if (_likedPostIds.has(id)) _likedPostIds.delete(id); else _likedPostIds.add(id);
    _bookmarkListeners.forEach(fn => fn());
  },
  getLikedPostIds: () => Array.from(_likedPostIds),

  subscribeBookmarks(fn: BookmarkListener) {
    _bookmarkListeners.add(fn);
    return () => _bookmarkListeners.delete(fn);
  },
};
