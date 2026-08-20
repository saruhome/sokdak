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
  fetchPostsPage: jest.fn(),
}));
jest.mock('@/constants/notifications', () => ({ fetchUnreadNotificationCount: jest.fn() }));
jest.mock('@/constants/authStore', () => ({ authStore: { isLoggedIn: jest.fn(() => false) } }));
jest.mock('@/constants/mockPosts', () => ({
  BOARD_COLORS: {},
  getBoardLabel: (value: string) => value,
}));
jest.mock('@/constants/languageStore', () => ({
  useLanguage: () => 'en',
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

    fireEvent.press(screen.getByLabelText('Write a post'));
    expect(router.push).toHaveBeenCalledWith('/auth/login');
  });
});
