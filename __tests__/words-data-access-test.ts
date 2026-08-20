const mockIn: jest.Mock = jest.fn();
const mockSelect: jest.Mock = jest.fn(() => ({ in: mockIn }));
const mockFrom: jest.Mock = jest.fn(() => ({ select: mockSelect }));

jest.mock('@/constants/supabase', () => ({
  supabase: { from: (table: string) => mockFrom(table) },
}));

import { fetchWordsByIds } from '@/constants/words';

const WORD_ROW = {
  word: '테스트',
  romanization: 'Te-seu-teu',
  category: 'daily',
  short_desc: '테스트용 단어',
  meanings: [],
  usage: '테스트 상황',
  related_words: [],
  likes: 0,
  saves: 0,
  translations: [],
};

describe('fetchWordsByIds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns immediately without querying when no IDs are requested', async () => {
    await expect(fetchWordsByIds([])).resolves.toEqual([]);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('queries only requested IDs and preserves the saved-ID order', async () => {
    mockIn.mockResolvedValue({
      data: [
        { ...WORD_ROW, id: 'first', word: '첫째' },
        { ...WORD_ROW, id: 'second', word: '둘째' },
      ],
      error: null,
    });

    const words = await fetchWordsByIds(['second', 'missing', 'first']);

    expect(mockFrom).toHaveBeenCalledWith('words');
    expect(mockIn).toHaveBeenCalledWith('id', ['second', 'missing', 'first']);
    expect(words.map(word => word.id)).toEqual(['second', 'first']);
  });
});
