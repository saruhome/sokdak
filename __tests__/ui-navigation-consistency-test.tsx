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
jest.mock('lucide-react-native', () => ({ Bell: () => null, Search: () => null }));
jest.mock('@/constants/notifications', () => ({ fetchUnreadNotificationCount: jest.fn(async () => 0) }));
jest.mock('@/components/icons/SokDakLogo', () => ({ SokDakLogo: () => null }));
jest.mock('@/constants/languageStore', () => ({
  languageStore: {
    t: (key: string) => ({
      a11yOpenSearch: 'Open search',
      a11yOpenNotifications: 'Open notifications',
    }[key] ?? key),
  },
}));

import { TopAppBar } from '@/components/navigation/TopAppBar';

describe('TopAppBar variants', () => {
  it('home variant exposes labeled search and notification actions', async () => {
    const screen = await render(<TopAppBar variant="home" />);
    await waitFor(() => expect(screen.getByLabelText('Open notifications')).toBeTruthy());

    expect(screen.getByLabelText('Open search')).toBeTruthy();
    expect(screen.getByLabelText('SokDak')).toBeTruthy();
  });

  it('title variant shows the title and a labeled notification action, no search', async () => {
    const screen = await render(<TopAppBar variant="title" title="커뮤니티" />);
    await waitFor(() => expect(screen.getByLabelText('Open notifications')).toBeTruthy());

    expect(screen.getByText('커뮤니티')).toBeTruthy();
    expect(screen.queryByLabelText('Open search')).toBeNull();
  });
});
