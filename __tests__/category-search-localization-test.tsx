import React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render, userEvent, waitFor } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

jest.mock('@/components/AppText', () => ({
  AppText: require('react-native').Text,
}));

jest.mock('lucide-react-native', () => ({
  Search: () => null,
  Mic: () => null,
  Clock: () => null,
  ChevronRight: () => null,
  X: () => null,
}));

jest.mock('@/components/AppIcon', () => {
  const { Pressable: MockPressable, Text: MockText } = require('react-native');
  return {
    AppIcon: ({ accessibilityLabel, onPress }: { accessibilityLabel?: string; onPress?: () => void }) => (
      <MockPressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress}>
        <MockText>{accessibilityLabel ?? 'icon'}</MockText>
      </MockPressable>
    ),
  };
});

jest.mock('@/components/icons/JjaekiQuestion', () => ({
  JjaekiQuestion: () => null,
}));

jest.mock('@/components/icons/SocialIcons', () => ({
  BackIcon: () => null,
}));

jest.mock('@/constants/navigation', () => ({
  safeGoBack: jest.fn(),
}));

jest.mock('@/constants/categories', () => ({
  CATEGORIES: [
    { slug: 'kpop', description: 'K-pop and idol culture', colorBg: '#ffffff', emoji: '🎵' },
  ],
  getCategoryName: (category: { slug: string }) => category.slug === 'kpop' ? 'K-POP' : category.slug,
}));

jest.mock('@/constants/languageStore', () => ({
  useLanguage: () => 'en',
  languageStore: {
    t: (key: string) => ({
      categorySearchTitle: 'Category Search',
      categorySearchPlaceholder: 'Search categories',
      clearCategorySearch: 'Clear category search',
      noCategoryResults: 'No results found for “{query}”.',
      suggestToTeam: 'Suggest to the team',
      recentSearches: 'Recent Searches',
      clearAll: 'Clear all',
      noRecentSearches: 'No recent searches.',
      trySearchingCategory: 'Try searching for a category',
      recommendedCategories: 'Recommended Categories',
    }[key] ?? key),
  },
}));

import CategorySearchScreen from '@/app/tabs/category/search';

describe('<CategorySearchScreen /> localization flow', () => {
  it('uses the localized category placeholder and a complete English no-results sentence', async () => {
    const screen = await render(<CategorySearchScreen />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Search categories');

    await user.type(input, 'missing category');
    fireEvent(input, 'submitEditing');

    await waitFor(() => {
      expect(screen.getByText('No results found for “missing category”.')).toBeTruthy();
    });
  });

  it('uses an explicit clear action that works without the iOS-only TextInput clear button', async () => {
    const screen = await render(<CategorySearchScreen />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Search categories');

    await user.type(input, 'missing category');
    expect(screen.getByLabelText('Clear category search')).toBeTruthy();

    await user.press(screen.getByLabelText('Clear category search'));

    await waitFor(() => {
      expect(input.props.value).toBe('');
      expect(screen.queryByText('No results found for “missing category”.')).toBeNull();
    });
  });
});
