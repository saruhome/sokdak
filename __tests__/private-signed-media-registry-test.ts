import {
  getPrivateSignedMediaRefreshDelay,
  PRIVATE_SIGNED_MEDIA_REFRESH_BUFFER_MS,
  refreshPrivateSignedMediaUrls,
  registerPrivateSignedMediaResource,
} from '@/constants/privateSignedMediaRegistry';

describe('private signed media registry', () => {
  const now = 1_700_000_000_000;

  it('refreshes only media due within the five-minute buffer', async () => {
    const refreshVideo = jest.fn().mockResolvedValue({ error: null });
    const refreshAttachment = jest.fn().mockResolvedValue({ error: null });
    const unregisterVideo = registerPrivateSignedMediaResource({
      id: 'private-video',
      getExpiresAt: () => now + PRIVATE_SIGNED_MEDIA_REFRESH_BUFFER_MS - 1,
      refresh: refreshVideo,
    });
    const unregisterAttachment = registerPrivateSignedMediaResource({
      id: 'private-attachment',
      getExpiresAt: () => now + PRIVATE_SIGNED_MEDIA_REFRESH_BUFFER_MS + 1,
      refresh: refreshAttachment,
    });

    await refreshPrivateSignedMediaUrls({ dueOnly: true, now });

    expect(refreshVideo).toHaveBeenCalledTimes(1);
    expect(refreshAttachment).not.toHaveBeenCalled();
    unregisterVideo();
    unregisterAttachment();
  });

  it('uses the earliest registered private media expiry to schedule the next refresh', () => {
    const unregisterVideo = registerPrivateSignedMediaResource({
      id: 'private-video',
      getExpiresAt: () => now + PRIVATE_SIGNED_MEDIA_REFRESH_BUFFER_MS + 90_000,
      refresh: jest.fn().mockResolvedValue({ error: null }),
    });
    const unregisterAttachment = registerPrivateSignedMediaResource({
      id: 'private-attachment',
      getExpiresAt: () => now + PRIVATE_SIGNED_MEDIA_REFRESH_BUFFER_MS + 30_000,
      refresh: jest.fn().mockResolvedValue({ error: null }),
    });

    expect(getPrivateSignedMediaRefreshDelay(now)).toBe(30_000);
    unregisterVideo();
    unregisterAttachment();
  });

  it('refreshes registered media without an expiry timestamp on foreground recovery', async () => {
    const refresh = jest.fn().mockResolvedValue({ error: null });
    const unregister = registerPrivateSignedMediaResource({
      id: 'private-video-without-cache',
      getExpiresAt: () => null,
      refresh,
    });

    await refreshPrivateSignedMediaUrls({ dueOnly: false, now });

    expect(refresh).toHaveBeenCalledTimes(1);
    unregister();
  });
});
