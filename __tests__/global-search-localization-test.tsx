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
jest.mock('@/components/AppIcon', () => {
  const { Pressable, Text } = require('react-native');
  return {
    AppIcon: ({ accessibilityLabel, onPress }: { accessibilityLabel?: string; onPress?: () => void }) => (
      <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress}>
        <Text>{accessibilityLabel ?? 'icon'}</Text>
      </Pressable>
    ),
    IconStat: ({ value }: { value: number }) => <Text>{String(value)}</Text>,
  };
});
jest.mock('@/components/icons/SocialIcons', () => ({ BackIcon: () => null }));
jest.mock('@/components/CharacterEmptyState', () => {
  const { Text, View } = require('react-native');
  return {
    CharacterEmptyState: ({ testID, title, description }: { testID?: string; title: string; description?: string }) => (
      <View testID={testID}>
        <Text>{title}</Text>
        {description ? <Text>{description}</Text> : null}
      </View>
    ),
  };
});
jest.mock('lucide-react-native', () => ({
  Search: () => null,
  BookOpen: () => null,
  Heart: () => null,
  Star: () => null,
  Eye: () => null,
  MessageCircle: () => null,
  Inbox: () => null,
  X: () => null,
}));
jest.mock('@/constants/words', () => ({ fetchWords: jest.fn() }));
jest.mock('@/constants/community', () => ({ fetchPosts: jest.fn() }));
jest.mock('@/constants/categories', () => ({
  CATEGORIES: [{ slug: 'daily', name: '일상', nameEn: 'Daily', nameJa: '日常', nameVi: 'Hằng ngày', nameEs: 'Cotidiano', emoji: '☀️' }],
  getCategoryBySlug: () => undefined,
  getCategoryName: (category: { nameEn: string }) => category.nameEn,
}));
jest.mock('@/constants/authStore', () => ({
  authStore: {
    getSavedWordIds: jest.fn(() => []),
    subscribeBookmarks: jest.fn(() => () => undefined),
    isLoggedIn: jest.fn(() => true),
    isWordSaved: jest.fn(() => false),
    canSaveMoreWords: jest.fn(() => true),
    toggleWordSaved: jest.fn(),
  },
}));
jest.mock('@/constants/alert', () => ({ Alert: { alert: jest.fn() } }));
jest.mock('@/constants/languageStore', () => ({
  useLanguage: () => 'en',
  tFor: (_language: string, key: string) => ({
    goBack: 'Go back',
    wordSearchPlaceholder: 'Search words, meanings, or romanization',
    recentSearches: 'Recent Searches',
    clearAll: 'Clear all',
    noRecentSearches: 'No recent searches.',
    trySearchingCategory: 'Try searching for a category',
    clearWordSearch: 'Clear search',
    globalSearchSubmit: 'Search “{query}”',
    globalSearchWordResults: 'Words {count}',
    globalSearchPostResults: 'Posts {count}',
    globalSearchNoWordResults: 'No words found for “{query}”',
    globalSearchNoPostResults: 'No posts found for “{query}”',
    loginRequiredTitle: 'Login required',
    loginRequiredSave: 'Login to save',
    cancelLabel: 'Cancel',
    goToLogin: 'Go to login',
    saveLimitReachedTitle: 'Save limit reached',
    saveLimitReachedMessage: 'Save limit reached',
    allLabel: 'All',
  }[key] ?? key),
}));

import { fetchWords } from '@/constants/words';
import { fetchPosts } from '@/constants/community';
import SearchScreen from '@/app/search';

const mockFetchWords = fetchWords as jest.Mock;
const mockFetchPosts = fetchPosts as jest.Mock;

const WORDS = [{
  id: '1',
  word: '핵인싸',
  romanization: 'Haek-In-Ssa',
  shortDesc: '매우 사교적인 사람',
  category: 'daily',
  secondaryCategory: null,
  likes: 12,
  translations: [{ lang: '🇺🇸 EN', text: 'The ultimate social butterfly' }],
}];

describe('<SearchScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchWords.mockResolvedValue(WORDS);
    mockFetchPosts.mockResolvedValue([]);
  });

  it('starts with localized empty recent search copy instead of seeded Korean terms or popularity data', async () => {
    const screen = await render(<SearchScreen />);

    await waitFor(() => expect(screen.getByText('Recent Searches')).toBeTruthy());
    expect(screen.getByText('No recent searches.')).toBeTruthy();
    expect(screen.getByText('Try searching for a category')).toBeTruthy();
    expect(screen.queryByText('킹받다')).toBeNull();
    expect(screen.queryByText('Popular Searches')).toBeNull();
  });

  it('uses the shared multilingual matcher for translation-meaning queries', async () => {
    const screen = await render(<SearchScreen />);
    const input = screen.getByLabelText('Search words, meanings, or romanization');

    fireEvent.changeText(input, 'social butterfly');
    const suggestion = await screen.findByText('Search “social butterfly”');
    fireEvent.press(suggestion);

    await waitFor(() => expect(screen.getByText('핵인싸')).toBeTruthy());
    expect(screen.getByText('Words 1')).toBeTruthy();
  });

  it('shows the character-based empty state when a submitted word query has no matches', async () => {
    const screen = await render(<SearchScreen />);
    const input = screen.getByLabelText('Search words, meanings, or romanization');

    fireEvent.changeText(input, 'no-match');
    fireEvent.press(await screen.findByText('Search “no-match”'));

    await waitFor(() => expect(screen.getByTestId('global-search-no-word-results')).toBeTruthy());
    expect(screen.getByText('No words found for “no-match”')).toBeTruthy();
  });
});
