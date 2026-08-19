jest.mock('@/constants/supabase', () => ({
  supabase: {
    auth: { getUser: jest.fn() },
    storage: { from: jest.fn() },
  },
}));

import { supabase } from '@/constants/supabase';
import {
  PROFILE_AVATAR_BUCKET,
  isProfileAvatarPath,
  uploadProfileAvatar,
} from '@/constants/profileAvatarStorage';

const mockSupabase = supabase as unknown as {
  auth: { getUser: jest.Mock };
  storage: { from: jest.Mock };
};

describe('profile avatar private storage', () => {
  const bucket = {
    upload: jest.fn(),
    createSignedUrl: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockSupabase.storage.from.mockReturnValue(bucket);
    bucket.upload.mockResolvedValue({ error: null });
    bucket.createSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://signed.example/avatar' }, error: null });
    globalThis.fetch = jest.fn().mockResolvedValue({
      arrayBuffer: async () => new ArrayBuffer(128),
      headers: { get: () => 'image/jpeg' },
    });
  });

  it('stores only a private bucket path and returns a signed preview URL', async () => {
    const result = await uploadProfileAvatar({ uri: 'file:///avatar.jpg', mimeType: 'image/jpeg' });

    expect(mockSupabase.storage.from).toHaveBeenCalledWith(PROFILE_AVATAR_BUCKET);
    expect(bucket.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^user-1\/\d+\.jpg$/),
      expect.any(ArrayBuffer),
      { contentType: 'image/jpeg', upsert: false },
    );
    expect(result.path).toMatch(/^profile-avatars\/user-1\/\d+\.jpg$/);
    expect(result.signedUrl).toBe('https://signed.example/avatar');
    expect(result.path).not.toContain('file://');
  });

  it('rejects unsupported image types before upload', async () => {
    const result = await uploadProfileAvatar({ uri: 'file:///avatar.gif', mimeType: 'image/gif' });

    expect(result.error).toBeTruthy();
    expect(bucket.upload).not.toHaveBeenCalled();
  });

  it('recognizes only the private profile-avatar storage paths', () => {
    expect(isProfileAvatarPath('profile-avatars/user-1/avatar.jpg')).toBe(true);
    expect(isProfileAvatarPath('https://example.com/avatar.jpg')).toBe(false);
    expect(isProfileAvatarPath('file:///avatar.jpg')).toBe(false);
  });
});
