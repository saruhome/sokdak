import { getCategoryBySlug, categoryMatchesSearch, getCategoryName } from '@/constants/categories';
import { languageStore, tFor } from '@/constants/languageStore';

describe('German language support', () => {
  afterEach(() => {
    languageStore.setLanguage('ko');
  });

  it('stores German as a supported app language and returns localized core UI copy', () => {
    languageStore.setLanguage('de');

    expect(languageStore.getLanguage()).toBe('de');
    expect(languageStore.t('wordSearchPlaceholder')).toBe('Welches Wort suchst du?');
    expect(tFor('de', 'voiceSearchPermissionTitle')).toBe('Mikrofonberechtigung erforderlich');
    expect(tFor('de', 'errorBoundaryRetry')).toBe('Erneut versuchen');
  });

  it('shows and finds German category names, including an umlaut-insensitive search', () => {
    const frequentlyUsed = getCategoryBySlug('frequently-used');
    const outdated = getCategoryBySlug('outdated-slang');

    expect(frequentlyUsed).toBeDefined();
    expect(outdated).toBeDefined();
    expect(getCategoryName(frequentlyUsed!, 'de')).toBe('Häufiger\nSlang');
    expect(categoryMatchesSearch(frequentlyUsed!, 'haufiger')).toBe(true);
    expect(getCategoryName(outdated!, 'de')).toBe('Veralteter\nSlang');
  });
});
