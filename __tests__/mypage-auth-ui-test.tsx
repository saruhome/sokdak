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
jest.mock('@/components/ProfileAvatar', () => {
  const { View: MockView } = require('react-native');
  return () => <MockView testID="profile-avatar" />;
});
jest.mock('@/components/AppIcon', () => {
  const { View: MockView } = require('react-native');
  return { AppIcon: () => <MockView /> };
});
jest.mock('lucide-react-native', () => ({ ChevronRight: () => null, Crown: () => null, Flame: () => null }));
jest.mock('@/constants/support', () => ({ hasUnseenReply: jest.fn().mockResolvedValue(false) }));
jest.mock('@/constants/languageStore', () => ({
  languageStore: {
    getLanguage: () => 'en',
    initialize: () => Promise.resolve(),
    subscribe: () => () => {},
    t: (key: string) => ({
      mypage: 'My page', loginNeeded: 'Log in', activity: 'Activity', settings: 'Settings',
      notifications: 'Notifications', customerService: 'Support', logout: 'Logout',
    }[key] ?? key),
  },
}));
jest.mock('@/constants/authStore', () => ({
  authStore: {
    isLoggedIn: jest.fn(() => false), getSavedWordIds: () => [], getLikedPostIds: () => [],
    isPremium: () => false, getStreakCount: () => 0, getUser: () => null,
    subscribe: () => () => {}, subscribeBookmarks: () => () => {}, logout: jest.fn(),
  },
}));

import { authStore } from '@/constants/authStore';
import MyPageScreen from '@/app/tabs/mypage/index';

describe('<MyPageScreen /> authentication UI', () => {
  beforeEach(() => jest.clearAllMocks());

  it('does not display the logout action for a guest', async () => {
    (authStore.isLoggedIn as jest.Mock).mockReturnValue(false);
    const screen = await render(<MyPageScreen />);

    await waitFor(() => expect(screen.getByText('My page')).toBeTruthy());
    expect(screen.queryByText('Logout')).toBeNull();
  });
});
