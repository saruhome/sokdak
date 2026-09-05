jest.mock('@/constants/supabase', () => ({
  supabase: {
    storage: {
      from: (bucket: string) => ({
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `https://project.supabase.co/storage/v1/object/public/${bucket}/${path}` },
        }),
      }),
    },
  },
}));
jest.mock('@/constants/authStore', () => ({ authStore: { getBlockedUserIds: jest.fn(() => []) } }));

import { toCommunityAuthor } from '@/constants/community';

describe('community avatar handling', () => {
  it('converts a profile-avatars Storage path to its public URL (photos follow you into the community)', () => {
    expect(toCommunityAuthor({
      nickname: '테스트 사용자',
      avatar_emoji: '🐯',
      avatar_url: 'profile-avatars/user-123/1720000000000.jpg',
      level: '초급',
    })).toEqual({
      name: '테스트 사용자',
      emoji: '🐯',
      avatarUrl: 'https://project.supabase.co/storage/v1/object/public/profile-avatars/user-123/1720000000000.jpg',
      level: '초급',
    });
  });

  it('keeps a legacy public avatar URL untouched', () => {
    expect(toCommunityAuthor({
      nickname: '테스트 사용자',
      avatar_emoji: '🐦',
      avatar_url: 'https://cdn.example.com/legacy-avatar.png',
      level: '중급',
    }).avatarUrl).toBe('https://cdn.example.com/legacy-avatar.png');
  });
});
