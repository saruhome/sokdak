import { render, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';
import {
  AVATAR_SIGNED_URL_REFRESH_BUFFER_MS,
  useRefreshProfileAvatarSignedUrl,
} from '@/hooks/useRefreshProfileAvatarSignedUrl';
import { authStore } from '@/constants/authStore';
import { reportAppError } from '@/constants/errorReporting';

jest.mock('@/constants/authStore', () => ({
  authStore: {
    refreshProfileAvatarSignedUrl: jest.fn(),
    getProfileAvatarSignedUrlExpiresAt: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
  },
}));

jest.mock('@/constants/errorReporting', () => ({ reportAppError: jest.fn() }));

function HookProbe() {
  useRefreshProfileAvatarSignedUrl();
  return null;
}

describe('useRefreshProfileAvatarSignedUrl', () => {
  let appStateListener: ((state: 'active' | 'background' | 'inactive') => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    appStateListener = null;
    (authStore.refreshProfileAvatarSignedUrl as jest.Mock).mockResolvedValue({ error: null });
    (authStore.getProfileAvatarSignedUrlExpiresAt as jest.Mock).mockReturnValue(null);
    jest.spyOn(AppState, 'addEventListener').mockImplementation(((_event: 'change', listener: (state: 'active' | 'background' | 'inactive') => void) => {
      appStateListener = listener as typeof appStateListener;
      return { remove: jest.fn() } as any;
    }) as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('refreshes only when the app returns from background to active', async () => {
    render(<HookProbe />);

    await waitFor(() => expect(appStateListener).not.toBeNull());
    appStateListener?.('background');
    appStateListener?.('active');

    await waitFor(() => expect(authStore.refreshProfileAvatarSignedUrl).toHaveBeenCalledTimes(1));
  });

  it('reports a refresh failure without interrupting the foreground transition', async () => {
    (authStore.refreshProfileAvatarSignedUrl as jest.Mock).mockResolvedValue({ error: 'signed URL failed' });
    render(<HookProbe />);

    await waitFor(() => expect(appStateListener).not.toBeNull());
    appStateListener?.('inactive');
    appStateListener?.('active');

    await waitFor(() => expect(reportAppError).toHaveBeenCalledWith(expect.any(Error), {
      source: 'network_request',
      route: 'root',
    }));
  });

  it('schedules the next refresh five minutes before URL expiry while active', async () => {
    const expiresAt = Date.now() + AVATAR_SIGNED_URL_REFRESH_BUFFER_MS + 45_000;
    (authStore.getProfileAvatarSignedUrlExpiresAt as jest.Mock).mockReturnValue(expiresAt);

    render(<HookProbe />);

    await waitFor(() => expect(appStateListener).not.toBeNull());
    const setTimeoutSpy = jest.spyOn(globalThis, 'setTimeout');
    appStateListener?.('active');

    expect(authStore.getProfileAvatarSignedUrlExpiresAt).toHaveBeenCalled();
    const [, delay] = setTimeoutSpy.mock.calls.at(-1) ?? [];
    expect(delay).toBeGreaterThan(44_000);
    expect(delay).toBeLessThanOrEqual(45_000);
  });
});
