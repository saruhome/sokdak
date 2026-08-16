jest.mock('@/constants/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(),
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signOut: jest.fn(),
      setSession: jest.fn(),
    },
  },
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => 'sokdak://auth/callback'),
  getInitialURL: jest.fn(async () => null),
  addEventListener: jest.fn(),
}));

import { authStore } from '@/constants/authStore';
import { supabase } from '@/constants/supabase';

const mockSupabase = supabase as unknown as {
  rpc: jest.Mock;
  from: jest.Mock;
  auth: {
    getSession: jest.Mock;
    onAuthStateChange: jest.Mock;
    signOut: jest.Mock;
    setSession: jest.Mock;
  };
};

const policyConsent = {
  policy_key: 'community_guidelines',
  policy_version: '1.0.0',
  policy_locale: 'ja',
  accepted_at: '2026-08-16T10:00:00.000Z',
};

function makeQuery(table: string) {
  const query: any = {
    select: jest.fn(() => query),
    eq: jest.fn(() => query),
    single: jest.fn(async () => {
      if (table === 'profiles') {
        return {
          data: { nickname: '테스트 사용자', avatar_emoji: '🐦', avatar_url: null, level: '초급' },
          error: null,
        };
      }
      if (table === 'account_settings') {
        return {
          data: {
            phone: null,
            timezone: 'Asia/Seoul',
            is_premium: false,
            streak_count: 1,
            last_active_date: new Date().toISOString().slice(0, 10),
          },
          error: null,
        };
      }
      return { data: null, error: null };
    }),
    data: [],
    error: null,
  };
  return query;
}

describe('authStore community policy RPC integration', () => {
  beforeAll(async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'user-1', email: 'test@sokdak.app' } } },
    });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });
    mockSupabase.from.mockImplementation((table: string) => makeQuery(table));

    await authStore.initialize();
  });

  beforeEach(() => {
    mockSupabase.rpc.mockReset();
  });

  it('uses the server-derived acceptance result instead of a local timestamp cache', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: true, error: null });

    await expect(authStore.hasAcceptedCommunityGuidelines()).resolves.toBe(true);
    expect(mockSupabase.rpc).toHaveBeenCalledWith('has_accepted_current_community_policy');
  });

  it('keeps community writing gated when the server RPC reports an error or false', async () => {
    mockSupabase.rpc.mockResolvedValueOnce({ data: false, error: null });
    await expect(authStore.hasAcceptedCommunityGuidelines()).resolves.toBe(false);

    mockSupabase.rpc.mockResolvedValueOnce({ data: null, error: { message: 'network unavailable' } });
    await expect(authStore.hasAcceptedCommunityGuidelines()).resolves.toBe(false);
  });

  it('passes the displayed locale and source to the consent RPC and returns server evidence', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: [policyConsent], error: null });

    await expect(authStore.acceptCommunityGuidelines({
      locale: 'ja',
      source: 'community_onboarding',
      appVersion: '1.0.0-beta.1',
      platform: 'android',
    })).resolves.toEqual({ error: null, consent: policyConsent });

    expect(mockSupabase.rpc).toHaveBeenCalledWith('accept_current_community_policy', {
      p_locale: 'ja',
      p_source: 'community_onboarding',
      p_app_version: '1.0.0-beta.1',
      p_platform: 'android',
    });
  });

  it('does not call the consent RPC after logout', async () => {
    await authStore.logout();

    await expect(authStore.acceptCommunityGuidelines({ locale: 'en' })).resolves.toEqual({
      error: '로그인이 필요해요.',
      consent: null,
    });
    expect(mockSupabase.rpc).not.toHaveBeenCalled();
  });
});
