import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    router: { push: jest.fn() },
    useFocusEffect: (effect: () => void | (() => void)) => React.useEffect(effect, [effect]),
  };
});
jest.mock('@/components/AppText', () => ({ AppText: require('react-native').Text }));
jest.mock('lucide-react-native', () => ({
  Eye: () => null, Heart: () => null, MessageCircle: () => null, Pencil: () => null, Bell: () => null, Search: () => null,
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
jest.mock('@/constants/notifications', () => ({ fetchUnreadNotificationCount: jest.fn(async () => 0) }));
jest.mock('@/constants/authStore', () => ({ authStore: { isLoggedIn: jest.fn(() => false) } }));
jest.mock('@/constants/mockPosts', () => ({ BOARD_COLORS: {}, getBoardLabel: (value: string) => value }));
jest.mock('@/constants/languageStore', () => ({
  useLanguage: () => 'en',
  languageStore: {
    t: (key: string) => ({
      community: 'Community',
      hotPosts: 'Hot posts',
      allLabel: 'All',
      noPostsYet: 'No posts yet',
      writeTitle: 'Write a post',
      postsLoadFailed: "Couldn't load posts",
      retryLabel: 'Try again',
    }[key] ?? key),
  },
}));

import { fetchPostsPage } from '@/constants/community';
import CommunityScreen from '@/app/tabs/community/index';

const mockFetchPostsPage = fetchPostsPage as jest.Mock;

describe('community list states are mutually exclusive with a single CTA', () => {
  beforeEach(() => jest.clearAllMocks());

  it('a failed load shows the retry CTA, not the empty-state write CTA', async () => {
    mockFetchPostsPage.mockResolvedValue({ posts: [], hasMore: false, nextOffset: 0, failed: true });

    const screen = await render(<CommunityScreen />);
    await waitFor(() => expect(screen.getByText("Couldn't load posts")).toBeTruthy());

    expect(screen.getByText('Try again')).toBeTruthy();
    expect(screen.queryByTestId('community-posts-empty-state')).toBeNull();
  });

  it('pressing retry re-runs the fetch and recovers to the empty state', async () => {
    mockFetchPostsPage
      .mockResolvedValueOnce({ posts: [], hasMore: false, nextOffset: 0, failed: true })
      .mockResolvedValue({ posts: [], hasMore: false, nextOffset: 0 });

    const screen = await render(<CommunityScreen />);
    await waitFor(() => expect(screen.getByText('Try again')).toBeTruthy());

    fireEvent.press(screen.getByText('Try again'));

    await waitFor(() => expect(screen.getByTestId('community-posts-empty-state')).toBeTruthy());
    expect(screen.queryByText("Couldn't load posts")).toBeNull();
    expect(mockFetchPostsPage.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('a genuinely empty board shows only the write CTA', async () => {
    mockFetchPostsPage.mockResolvedValue({ posts: [], hasMore: false, nextOffset: 0 });

    const screen = await render(<CommunityScreen />);
    await waitFor(() => expect(screen.getByTestId('community-posts-empty-state')).toBeTruthy());

    expect(screen.queryByText("Couldn't load posts")).toBeNull();
  });
});
