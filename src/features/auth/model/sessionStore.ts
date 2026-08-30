/**
 * 세션 상태의 단일 소유자 — auth migration 2단계.
 * 현재 로그인 유저(_user)·로그인 여부·인증 리스너만 담당한다. 프로필 fetch, 북마크 캐시,
 * entitlement 등 orchestration은 아직 constants/authStore.ts에 있고(후속 단계),
 * 그쪽 코드는 이 스토어를 통해서만 세션 상태를 읽고 쓴다.
 */

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
  /** 성인 확인(만 19세 이상 자기확인) 시각 — slang 카테고리 열람 게이트에 사용 */
  adultVerifiedAt?: string | null;
};

export type AuthListener = (loggedIn: boolean) => void;

let _user: SokDakUser | null = null;
let _isLoggedIn = false;
const _listeners = new Set<AuthListener>();

export const sessionStore = {
  getUser: () => _user,
  isLoggedIn: () => _isLoggedIn,

  /** 로그인/세션 복원 완료 시 호출. notify는 호출부가 결정한다(북마크 로드 후 한 번에 알리는 패턴). */
  setUser(user: SokDakUser) {
    _user = user;
    _isLoggedIn = true;
  },

  /** 프로필 수정 등 부분 갱신 — 로그인 상태는 유지. */
  patchUser(patch: Partial<SokDakUser>) {
    if (!_user) return;
    _user = { ..._user, ...patch };
  },

  clearUser() {
    _user = null;
    _isLoggedIn = false;
  },

  notify() {
    _listeners.forEach(fn => fn(_isLoggedIn));
  },

  subscribe(fn: AuthListener) {
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  },
};
