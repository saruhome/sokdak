/**
 * 간단한 세션 기반 인증 상태 스토어
 * 실제 앱에서는 zustand / React Context + SecureStore로 대체
 */
type AuthListener = (loggedIn: boolean) => void;

let _isLoggedIn = false;
let _user: { name: string; email: string; emoji: string } | null = null;
const _listeners = new Set<AuthListener>();

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
    _listeners.forEach(fn => fn(false));
  },

  subscribe(fn: AuthListener) {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};
