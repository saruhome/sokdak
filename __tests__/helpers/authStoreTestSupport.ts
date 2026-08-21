/** authStore를 다루는 테스트 4곳(현재)에서 거의 그대로 복붙되던 Supabase/expo-linking mock 보일러플레이트. */

export function mockSupabaseModuleFactory() {
  return {
    supabase: {
      rpc: jest.fn(),
      from: jest.fn(),
      storage: { from: jest.fn() },
      auth: {
        getSession: jest.fn(),
        onAuthStateChange: jest.fn(),
        signOut: jest.fn(),
      },
    },
  };
}

export function mockLinkingModuleFactory() {
  return {
    createURL: jest.fn(() => 'sokdak://auth/callback'),
    getInitialURL: jest.fn(async () => null),
    addEventListener: jest.fn(),
  };
}

const DEFAULT_PROFILE_ROW: {
  nickname: string; avatar_emoji: string; avatar_url: string | null; level: string;
  timezone: string; is_premium: boolean; streak_count: number; last_active_date: string;
} = {
  nickname: '테스트', avatar_emoji: '🐦', avatar_url: null, level: '초급',
  timezone: 'Asia/Seoul', is_premium: false, streak_count: 1,
  last_active_date: new Date().toISOString().slice(0, 10),
};

/** authStore.initialize()가 profiles/account_settings에 거는 `.single()` 응답 +
 * saved_words/post_likes/... 계열이 거는 배열 응답을 한 mock 쿼리 빌더로 처리한다.
 * `then`을 넘기면 배열 응답 대신 커스텀 thenable로 동작(테이블별로 다른 데이터가 필요할 때). */
export function makeAuthStoreQuery(overrides: {
  profile?: Partial<typeof DEFAULT_PROFILE_ROW>;
  data?: unknown[];
  then?: (resolve: (v: { data: unknown; error: null }) => void) => void;
} = {}) {
  const query: any = {
    select: jest.fn(() => query),
    update: jest.fn(() => query),
    delete: jest.fn(() => query),
    insert: jest.fn(async () => ({ error: null })),
    eq: jest.fn(() => query),
    in: jest.fn(() => query),
    single: jest.fn(async () => ({ data: { ...DEFAULT_PROFILE_ROW, ...overrides.profile }, error: null })),
    data: overrides.data ?? [],
    error: null,
  };
  if (overrides.then) query.then = overrides.then;
  return query;
}

export function mockLoggedInSession(
  mockSupabase: { auth: { getSession: jest.Mock; onAuthStateChange: jest.Mock } },
  userId = 'user-1',
  email = 'test@sokdak.app',
) {
  mockSupabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: userId, email } } } });
  mockSupabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } });
}
