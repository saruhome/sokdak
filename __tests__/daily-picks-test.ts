import { EXPRESSIONS, pickDaily } from '@/src/features/home/model/dailyPicks';

const ITEMS = ['a', 'b', 'c', 'd', 'e'];

it('pickDaily is deterministic per seed, without duplicates, capped at the pool size', () => {
  expect(pickDaily(ITEMS, 3, '2026-08-27')).toEqual(pickDaily(ITEMS, 3, '2026-08-27'));
  expect(pickDaily(ITEMS, 3, '2026-08-27')).not.toEqual(pickDaily(ITEMS, 3, '2026-08-28'));

  const all = pickDaily(ITEMS, 99, 'seed');
  expect(new Set(all).size).toBe(ITEMS.length);
  expect(pickDaily([], 3, 'seed')).toEqual([]);
});

it('expression data stays well-formed for the home card', () => {
  expect(EXPRESSIONS.length).toBeGreaterThan(0);
  for (const e of EXPRESSIONS) {
    expect(e.ko.trim()).not.toBe('');
    expect(e.en.trim()).not.toBe('');
    // 사전 연결 칩은 id와 표제어가 항상 쌍으로 있어야 렌더된다
    expect(!!e.wordId).toBe(!!e.wordLabel);
  }
});
