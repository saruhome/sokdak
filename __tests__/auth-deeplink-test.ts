/**
 * 이메일 인증·비밀번호 재설정 딥링크의 세션 넘겨받기(consumeAuthLink) 계약 고정.
 * 네이티브는 detectSessionInUrl: false라 링크 fragment의 토큰을 직접 setSession에
 * 넘겨야 로그인된다 — access_token과 refresh_token이 둘 다 있을 때만 호출하고,
 * fragment가 없거나 토큰이 불완전한 링크는 조용히 무시하는 것이 기존 계약이다.
 */
import { mockSupabaseModuleFactory } from './helpers/authStoreTestSupport';

let mockInitialUrl: string | null = null;
let mockUrlListener: ((event: { url: string }) => void) | undefined;

jest.mock('@/constants/supabase', () => mockSupabaseModuleFactory());
jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => 'sokdak://auth/callback'),
  getInitialURL: jest.fn(async () => mockInitialUrl),
  addEventListener: jest.fn((_type: string, listener: (event: { url: string }) => void) => {
    mockUrlListener = listener;
    return { remove: jest.fn() };
  }),
}));

import { authStore } from '@/constants/authStore';
import { supabase } from '@/constants/supabase';

const mockAuth = (supabase as unknown as {
  auth: { getSession: jest.Mock; onAuthStateChange: jest.Mock; setSession: jest.Mock };
}).auth;

/* consumeAuthLink는 리스너에서 await 없이 실행되므로 마이크로태스크를 비운 뒤 단언한다 */
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

beforeAll(async () => {
  mockAuth.getSession.mockResolvedValue({ data: { session: null } });
  mockAuth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } });
  await authStore.initialize();
});

describe('앱 실행 중 도착한 auth 딥링크', () => {
  it('fragment에 두 토큰이 모두 있으면 그대로 setSession에 넘긴다', async () => {
    mockUrlListener!({ url: 'sokdak://auth/callback#access_token=at-1&refresh_token=rt-1&type=signup' });
    await flush();
    expect(mockAuth.setSession).toHaveBeenCalledWith({ access_token: 'at-1', refresh_token: 'rt-1' });
  });

  it('fragment가 없는 링크는 무시한다', async () => {
    mockUrlListener!({ url: 'sokdak://tabs/mypage' });
    await flush();
    expect(mockAuth.setSession).not.toHaveBeenCalled();
  });

  it('refresh_token이 빠진 불완전한 fragment는 무시한다', async () => {
    mockUrlListener!({ url: 'sokdak://auth/callback#access_token=at-only&type=signup' });
    await flush();
    expect(mockAuth.setSession).not.toHaveBeenCalled();
  });

  it('query string에만 토큰이 있는 링크(fragment 아님)는 무시한다', async () => {
    mockUrlListener!({ url: 'sokdak://auth/callback?access_token=q&refresh_token=q' });
    await flush();
    expect(mockAuth.setSession).not.toHaveBeenCalled();
  });
});

describe('cold start(초기 URL)로 도착한 auth 딥링크', () => {
  it('getInitialURL의 토큰도 동일하게 setSession에 넘긴다', async () => {
    jest.resetModules();
    jest.doMock('@/constants/supabase', () => mockSupabaseModuleFactory());
    jest.doMock('expo-linking', () => ({
      createURL: jest.fn(() => 'sokdak://auth/callback'),
      getInitialURL: jest.fn(async () => 'sokdak://auth/callback#access_token=cold-at&refresh_token=cold-rt'),
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    }));
    /* eslint-disable @typescript-eslint/no-var-requires */
    const { authStore: freshStore } = require('@/constants/authStore');
    const { supabase: freshSupabase } = require('@/constants/supabase');
    /* eslint-enable @typescript-eslint/no-var-requires */
    freshSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    freshSupabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } });

    await freshStore.initialize();
    await flush();
    expect(freshSupabase.auth.setSession).toHaveBeenCalledWith({
      access_token: 'cold-at', refresh_token: 'cold-rt',
    });
  });
});
