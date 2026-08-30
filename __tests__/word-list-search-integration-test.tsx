import React from 'react';
import { Pressable, Text } from 'react-native';
import { render, userEvent, waitFor } from '@testing-library/react-native';

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
  Search: () => null,
  Star: () => null,
  Volume2: () => null,
  Heart: () => null,
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

jest.mock('@/components/VoiceSearchButton', () => {
  const { Pressable: MockPressable, Text: MockText } = require('react-native');
  return {
    VoiceSearchButton: ({ onTranscript }: { onTranscript: (value: string) => void }) => (
      <MockPressable
        accessibilityRole="button"
        accessibilityLabel="Inject Korean voice transcript"
        onPress={() => onTranscript('Sieu huong ngoai')}
      >
        <MockText>voice</MockText>
      </MockPressable>
    ),
  };
});

jest.mock('@/components/WordFilterBar', () => {
  const { Text: MockText } = require('react-native');
  return {
    SORT_TABS: ['popular', 'recent', 'consonant'],
    WordFilterBar: ({ total }: { total: number }) => <MockText testID="word-search-result-total">{total}</MockText>,
    sortWords: (words: unknown[]) => words,
    matchesCategories: () => true,
    getInitialConsonant: () => null,
  };
});

jest.mock('@/constants/words', () => ({
  fetchWords: jest.fn(),
  localizedText: jest.requireActual('@/src/features/dictionary/model/localizedText').localizedText,
}));

jest.mock('@/constants/categories', () => ({
  getCategoryBySlug: () => undefined,
  getCategoryName: () => '',
  pickLeastPopular: (words: unknown[]) => words[0],
}));

jest.mock('@/constants/languageStore', () => ({
  useLanguage: () => 'en',
  languageStore: {
    t: (key: string) => ({
      wordSearchPlaceholder: 'Search words, meanings, or romanization',
      clearWordSearch: 'Clear search',
      translationSearchMatch: 'Meaning match:',
      noSearchResults: 'No results found',
      a11ySaveWord: 'Save word',
      a11yPlayPronunciation: 'Play pronunciation',
      loginRequiredTitle: 'Login required',
      loginRequiredSave: 'Login to save',
      cancelLabel: 'Cancel',
      goToLogin: 'Go to login',
      saveLimitReachedTitle: 'Save limit reached',
      saveLimitReachedMessage: 'Save limit reached',
      savedLabel: 'Saved',
    }[key] ?? key),
  },
}));

jest.mock('@/constants/authStore', () => ({
  authStore: {
    getSavedWordIds: jest.fn(() => []),
    subscribeBookmarks: jest.fn(() => () => undefined),
    isWordSaved: jest.fn(() => false),
    isLoggedIn: jest.fn(() => true),
    canSaveMoreWords: jest.fn(() => true),
    toggleWordSaved: jest.fn(),
  },
}));

jest.mock('@/constants/speech', () => ({ speakWord: jest.fn() }));
jest.mock('@/constants/alert', () => ({ Alert: { alert: jest.fn() } }));

import { fetchWords } from '@/constants/words';
import { authStore } from '@/constants/authStore';
import { WordListView } from '@/components/WordListView';

const mockFetchWords = fetchWords as jest.Mock;

const WORDS = [
  {
    id: '1',
    word: '핵인싸',
    romanization: 'Haek-In-Ssa',
    shortDesc: '매우 사교적이고 무리에 잘 어울리는 사람',
    category: 'daily',
    secondaryCategory: null,
    likes: 12,
    translations: [
      { lang: '🇺🇸 EN', text: 'The ultimate insider / Social butterfly' },
      { lang: '🇻🇳 VI', text: 'Siêu hướng ngoại / người cực kỳ hòa đồng' },
      { lang: '🇪🇸 ES', text: 'Súper sociable / el alma del grupo' },
    ],
  },
  {
    id: '2',
    word: '갓생',
    romanization: 'Gat-Saeng',
    shortDesc: '계획적이고 부지런한 삶',
    category: 'daily',
    secondaryCategory: null,
    likes: 8,
    translations: [
      { lang: '🇻🇳 VI', text: 'Sống kỷ luật và năng suất' },
      { lang: '🇪🇸 ES', text: 'Vida disciplinada y productiva' },
    ],
  },
] as any[];

describe('<WordListView /> multilingual search flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchWords.mockResolvedValue(WORDS);
  });

  async function renderLoadedList() {
    const screen = await render(<WordListView showTipCard={false} />);
    await waitFor(() => expect(screen.getByText('핵인싸')).toBeTruthy());
    return screen;
  }

  it('shows the matching translation language when a Spanish meaning query finds a Korean word', async () => {
    const screen = await renderLoadedList();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('Search words, meanings, or romanization'), 'super sociable');

    await waitFor(() => {
      expect(screen.getByText('Meaning match: 🇪🇸 ES')).toBeTruthy();
    });
    expect(screen.queryByText('갓생')).toBeNull();
    expect(String(screen.getByTestId('word-search-result-total').props.children)).toBe('1');
  });

  it('provides an explicit Android-compatible clear action that restores the unfiltered list', async () => {
    const screen = await renderLoadedList();
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Search words, meanings, or romanization');

    await user.type(input, 'productive');
    await waitFor(() => expect(screen.queryByText('핵인싸')).toBeNull());

    await user.press(screen.getByLabelText('Clear search'));

    await waitFor(() => {
      expect(screen.getByText('핵인싸')).toBeTruthy();
      expect(screen.getByText('갓생')).toBeTruthy();
      expect(input.props.value).toBe('');
    });
  });

  it('routes a voice transcript through the same accent-insensitive Vietnamese meaning search', async () => {
    const screen = await renderLoadedList();
    const user = userEvent.setup();

    await user.press(screen.getByLabelText('Inject Korean voice transcript'));

    await waitFor(() => {
      expect(screen.getByText('Meaning match: 🇻🇳 VI')).toBeTruthy();
    });
    expect(screen.queryByText('갓생')).toBeNull();
  });

  it('shows a Horang cheer feedback after a user adds a word to saved words', async () => {
    const screen = await renderLoadedList();
    const user = userEvent.setup();

    await user.press(screen.getAllByLabelText('Save word')[0]);

    expect(authStore.toggleWordSaved).toHaveBeenCalledWith('1');
    expect(screen.getByTestId('word-saved-success-feedback')).toBeTruthy();
    expect(screen.getByText('Saved')).toBeTruthy();
    expect(screen.getByText('“핵인싸”')).toBeTruthy();
  });

  it('uses the localized empty state when no searchable field matches', async () => {
    const screen = await renderLoadedList();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('Search words, meanings, or romanization'), 'not-a-real-slang-term');

    await waitFor(() => expect(screen.getByText('No results found')).toBeTruthy());
    expect(screen.queryByTestId('translation-search-match-1')).toBeNull();
    expect(String(screen.getByTestId('word-search-result-total').props.children)).toBe('0');
  });
});
