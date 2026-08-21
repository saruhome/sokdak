import { render, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useRefreshPrivateSignedMediaUrls } from '@/hooks/useRefreshPrivateSignedMediaUrls';
import {
  PRIVATE_SIGNED_MEDIA_REFRESH_BUFFER_MS,
  registerPrivateSignedMediaResource,
} from '@/constants/privateSignedMediaRegistry';
import { reportAppError } from '@/constants/errorReporting';

jest.mock('@/constants/errorReporting', () => ({ reportAppError: jest.fn() }));

function HookProbe() {
  useRefreshPrivateSignedMediaUrls();
  return null;
}

describe('useRefreshPrivateSignedMediaUrls', () => {
  let appStateListener: ((state: 'active' | 'background' | 'inactive') => void) | null = null;
  const refresh = jest.fn();
  const getExpiresAt = jest.fn();
  let unregisterResource: (() => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    appStateListener = null;
    refresh.mockResolvedValue({ error: null });
    getExpiresAt.mockReturnValue(null);
    unregisterResource = registerPrivateSignedMediaResource({
      id: 'test-profile-avatar',
      getExpiresAt,
      refresh,
    });
    jest.spyOn(AppState, 'addEventListener').mockImplementation(((_event: 'change', listener: (state: 'active' | 'background' | 'inactive') => void) => {
      appStateListener = listener as typeof appStateListener;
      return { remove: jest.fn() } as any;
    }) as any);
  });

  afterEach(() => {
    unregisterResource?.();
    jest.restoreAllMocks();
  });

  it('refreshes only when the app returns from background to active', async () => {
    render(<HookProbe />);

    await waitFor(() => expect(appStateListener).not.toBeNull());
    appStateListener?.('background');
    appStateListener?.('active');

    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
  });

  it('reports a refresh failure without interrupting the foreground transition', async () => {
    refresh.mockResolvedValue({ error: 'signed URL failed' });
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
    const expiresAt = Date.now() + PRIVATE_SIGNED_MEDIA_REFRESH_BUFFER_MS + 45_000;
    getExpiresAt.mockReturnValue(expiresAt);

    render(<HookProbe />);

    await waitFor(() => expect(appStateListener).not.toBeNull());
    const setTimeoutSpy = jest.spyOn(globalThis, 'setTimeout');
    appStateListener?.('active');

    expect(getExpiresAt).toHaveBeenCalled();
    const [, delay] = setTimeoutSpy.mock.calls.at(-1) ?? [];
    expect(delay).toBeGreaterThan(44_000);
    expect(delay).toBeLessThanOrEqual(45_000);
  });
});
