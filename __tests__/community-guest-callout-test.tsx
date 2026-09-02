import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

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
jest.mock('@/components/AppIcon', () => ({ AppIcon: () => null, IconStat: () => null }));
jest.mock('@/constants/community', () => ({
  COMMUNITY_POST_PAGE_SIZE: 20,
  fetchPinnedPost: jest.fn(async () => null),
  fetchPostsPage: jest.fn(async () => ({ posts: [], hasMore: false, nextOffset: 0 })),
}));
jest.mock('@/constants/notifications', () => ({ fetchUnreadNotificationCount: jest.fn(async () => 0) }));
const mockIsLoggedIn = jest.fn(() => false);
jest.mock('@/constants/authStore', () => ({
  authStore: { isLoggedIn: () => mockIsLoggedIn(), subscribe: jest.fn(() => () => {}) },
}));

import CommunityScreen from '@/app/tabs/community/index';
import { tFor } from '@/constants/languageStore';

describe('community guest callout', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows exactly one login CTA at the top of the list for guests', async () => {
    mockIsLoggedIn.mockReturnValue(false);
    const screen = await render(<CommunityScreen />);

    await waitFor(() => expect(screen.getByTestId('community-guest-callout')).toBeTruthy());
    expect(screen.getAllByTestId('community-guest-callout')).toHaveLength(1);
    /* 로그인 CTA는 화면 전체에서 이 하나뿐이어야 한다 */
    expect(screen.getAllByLabelText(tFor('ko', 'goToLogin'))).toHaveLength(1);
    expect(screen.getByText(tFor('ko', 'guestCalloutTitle'))).toBeTruthy();
    expect(screen.getByText(tFor('ko', 'guestCalloutBenefit'))).toBeTruthy();
  });

  it('is hidden for logged-in users', async () => {
    mockIsLoggedIn.mockReturnValue(true);
    const screen = await render(<CommunityScreen />);

    await waitFor(() => expect(screen.getByTestId('community-posts-empty-state')).toBeTruthy());
    expect(screen.queryByTestId('community-guest-callout')).toBeNull();
    expect(screen.queryByLabelText(tFor('ko', 'goToLogin'))).toBeNull();
  });
});
