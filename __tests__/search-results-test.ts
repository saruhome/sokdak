import { filterPostResults, filterWordResults, suggestWords } from '@/src/features/search/model/searchResults';
import type { Word } from '@/constants/words';
import type { CommunityPostSummary } from '@/constants/community';

const word = (w: Partial<Word>): Word => ({
  id: '1', word: '갓생', romanization: 'Gat-Saeng', category: 'daily',
  shortDesc: '부지런한 삶', meanings: [], usage: '', relatedWords: [],
  likes: 0, saves: 0, translations: [],
  ...w,
} as Word);

const WORDS = [
  word({ id: '1', word: '갓생', category: 'daily' }),
  word({ id: '2', word: '갓벽', category: 'kpop' }),
  word({ id: '3', word: '억까', romanization: 'Eok-Kka', category: 'daily' }),
];

it('suggestWords caps results and returns nothing for a blank query', () => {
  expect(suggestWords(WORDS, '  ')).toEqual([]);
  expect(suggestWords(WORDS, '갓').map(w => w.id)).toEqual(['1', '2']);
  expect(suggestWords(WORDS, '갓', 1)).toHaveLength(1);
});

it('filterWordResults applies the optional category filter on top of the match', () => {
  expect(filterWordResults(WORDS, '갓', null).map(w => w.id)).toEqual(['1', '2']);
  expect(filterWordResults(WORDS, '갓', 'kpop').map(w => w.id)).toEqual(['2']);
});

it('filterPostResults matches title or content case-insensitively', () => {
  const posts = [
    { title: 'BTS 공연', content: '어제 봤어요' },
    { title: '한강', content: 'I wanna go with bts fans' },
    { title: '무관', content: '없음' },
  ] as CommunityPostSummary[];
  expect(filterPostResults(posts, 'bts')).toHaveLength(2);
});

it('filterPostResults ignores spacing so 월급 루팡 and 월급루팡 return the same posts', () => {
  const posts = [
    { title: '우리 팀 월급 루팡', content: '' },
    { title: '오늘도 월급루팡', content: '' },
    { title: '무관', content: '월급날' },
  ] as CommunityPostSummary[];
  expect(filterPostResults(posts, '월급 루팡')).toEqual(filterPostResults(posts, '월급루팡'));
  expect(filterPostResults(posts, '월급루팡')).toHaveLength(2);

  const words = [word({ id: '244', word: '월급 루팡', aliases: ['월급루팡'] }), word({ id: '9', word: '칼퇴' })];
  expect(filterWordResults(words, '월급 루팡', null).map(w => w.id)).toEqual(['244']);
  expect(filterWordResults(words, '월급루팡', null).map(w => w.id)).toEqual(['244']);
});
