jest.mock('@/constants/supabase', () => ({ supabase: {} }));
jest.mock('@/constants/authStore', () => ({ authStore: { getBlockedUserIds: jest.fn(() => []) } }));

import { toCommunityAuthor } from '@/constants/community';

describe('community private avatar handling', () => {
  it('never exposes a private profile-avatars Storage path in community data', () => {
    expect(toCommunityAuthor({
      nickname: '테스트 사용자',
      avatar_emoji: '🐯',
      avatar_url: 'profile-avatars/user-123/1720000000000.jpg',
      level: '초급',
    })).toEqual({
      name: '테스트 사용자',
      emoji: '🐯',
      avatarUrl: null,
      level: '초급',
    });
  });

  it('keeps a legacy public avatar URL only when it is not a private Storage path', () => {
    expect(toCommunityAuthor({
      nickname: '테스트 사용자',
      avatar_emoji: '🐦',
      avatar_url: 'https://cdn.example.com/legacy-avatar.png',
      level: '중급',
    }).avatarUrl).toBe('https://cdn.example.com/legacy-avatar.png');
  });
});
