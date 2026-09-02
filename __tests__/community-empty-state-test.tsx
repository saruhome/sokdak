import React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    router: { push: jest.fn() },
    useFocusEffect: (effect: () => void | (() => void)) => React.useEffect(effect, [effect]),
  };
});

jest.mock('@/components/AppText', () => ({
  AppText: require('react-native').Text,
}));

jest.mock('lucide-react-native', () => ({
  Eye: () => null,
  Heart: () => null,
  MessageCircle: () => null,
  Pencil: () => null,
  Bell: () => null,
}));

jest.mock('@/components/AppIcon', () => {
  const { Pressable: MockPressable } = require('react-native');
  return {
    AppIcon: ({ accessibilityLabel, onPress }: { accessibilityLabel?: string; onPress?: () => void }) => (
      <MockPressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} />
    ),
    IconStat: () => null,
  };
});

jest.mock('@/constants/community', () => ({
  COMMUNITY_POST_PAGE_SIZE: 20,
  fetchPinnedPost: jest.fn(async () => null),
  fetchPostsPage: jest.fn(),
}));
jest.mock('@/constants/notifications', () => ({ fetchUnreadNotificationCount: jest.fn() }));
jest.mock('@/constants/authStore', () => ({ authStore: { isLoggedIn: jest.fn(() => false), subscribe: jest.fn(() => () => {}) } }));
jest.mock('@/constants/mockPosts', () => ({
  BOARD_COLORS: { '질문': { bg: '#A4484D', fg: '#F6F2EA' }, '자유': { bg: '#BBCA9F', fg: '#526192' } },
  getBoardLabel: (value: string) => value,
}));
jest.mock('@/constants/languageStore', () => ({
  useLanguage: () => 'en',
  tFor: (_lang: string, key: string) => (require('@/constants/languageStore') as any).languageStore.t(key),
  languageStore: {
    t: (key: string) => ({
      community: 'Community',
      hotPosts: 'Hot posts',
      allLabel: 'All',
      noPostsYet: 'No posts yet',
      writeTitle: 'Write a post',
    }[key] ?? key),
  },
}));

import { router } from 'expo-router';
import { fetchPostsPage } from '@/constants/community';
import { fetchUnreadNotificationCount } from '@/constants/notifications';
import CommunityScreen from '@/app/tabs/community/index';

const mockFetchPostsPage = fetchPostsPage as jest.Mock;
const mockFetchUnreadNotificationCount = fetchUnreadNotificationCount as jest.Mock;

describe('<CommunityScreen /> empty state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchPostsPage.mockResolvedValue({ posts: [], hasMore: false });
    mockFetchUnreadNotificationCount.mockResolvedValue(0);
  });

  it('shows Jjaeki reading with a localized write CTA when no posts exist', async () => {
    const screen = await render(<CommunityScreen />);
    await waitFor(() => expect(screen.getByTestId('community-posts-empty-state')).toBeTruthy());

    expect(screen.getByText('No posts yet')).toBeTruthy();
    expect(screen.queryByText('Hot posts')).toBeNull();

    /* FAB에도 접근성 라벨 'Write a post'가 추가돼 라벨 중복 — 빈 상태 CTA를 testID로 특정 */
    fireEvent.press(screen.getByTestId('community-posts-empty-state-cta'));
    expect(router.push).toHaveBeenCalledWith('/auth/login');
  });
});
