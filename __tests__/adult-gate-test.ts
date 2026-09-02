/**
 * slang(속어) 성인 게이트 계약.
 * - 성인 미확인이면 fetchWords/fetchWordsByIds가 slang 단어(주/보조 카테고리 불문)를 걸러낸다.
 * - markAdultVerified가 account_settings.adult_verified_at을 기록하고 세션에 반영한다.
 * - 성인 확인은 프리미엄과 별개 축: production에서 무료 유저는 확인해도 열람 불가,
 *   반대로 베타 무제한도 성인 확인 없이는 열람 불가.
 */
import {
  mockSupabaseModuleFactory,
  mockLinkingModuleFactory,
  makeAuthStoreQuery,
  mockLoggedInSession,
} from './helpers/authStoreTestSupport';

const ORIGINAL_STAGE = process.env.EXPO_PUBLIC_RELEASE_STAGE;

const WORD_ROWS = [
  { id: 'w1', word: '킹받다', category: 'daily', secondary_category: null, short_desc: 'd', usage: 'u', likes: 0, saves: 0, meanings: [], related_words: [], translations: [] },
  { id: 'w2', word: '좆소', category: 'slang', secondary_category: 'work', short_desc: 'd', usage: 'u', likes: 0, saves: 0, meanings: [], related_words: [], translations: [] },
  { id: 'w3', word: '가상속어', category: 'work', secondary_category: 'slang', short_desc: 'd', usage: 'u', likes: 0, saves: 0, meanings: [], related_words: [], translations: [] },
];

async function loadWithStage(stage: string | undefined, { premium = false, adultVerifiedAt = null as string | null } = {}) {
  jest.resetModules();
  if (stage === undefined) delete process.env.EXPO_PUBLIC_RELEASE_STAGE;
  else process.env.EXPO_PUBLIC_RELEASE_STAGE = stage;

  jest.doMock('@/constants/supabase', () => mockSupabaseModuleFactory());
  jest.doMock('expo-linking', () => mockLinkingModuleFactory());

  /* eslint-disable @typescript-eslint/no-var-requires */
  const { supabase } = require('@/constants/supabase');
  const { entitlementStore } = require('../src/features/auth/model/entitlementStore');
  const wordsApi = require('../src/features/dictionary/api/wordsApi');
  const { authStore } = require('@/constants/authStore');
  /* eslint-enable @typescript-eslint/no-var-requires */

  mockLoggedInSession(supabase);
  supabase.from.mockImplementation((table: string) => makeAuthStoreQuery({
    profile: { is_premium: premium, adult_verified_at: adultVerifiedAt } as any,
    then: resolve => resolve({ data: table === 'words' ? WORD_ROWS : [], error: null }),
  }));
  await authStore.initialize();

  return { entitlementStore, wordsApi, mockSupabase: supabase };
}

afterAll(() => {
  if (ORIGINAL_STAGE === undefined) delete process.env.EXPO_PUBLIC_RELEASE_STAGE;
  else process.env.EXPO_PUBLIC_RELEASE_STAGE = ORIGINAL_STAGE;
});

it('성인 미확인이면 목록에서 slang 단어(주/보조 모두)가 걸러진다', async () => {
  const m = await loadWithStage(undefined);
  expect(m.entitlementStore.isAdultVerified()).toBe(false);
  const words = await m.wordsApi.fetchWords();
  expect(words.map((w: { word: string }) => w.word)).toEqual(['킹받다']);
});

it('includeLocked면 잠긴 속어도 목록에 남는다 — 블러 행+팝업 게이트는 화면 책임', async () => {
  const m = await loadWithStage('production');
  const words = await m.wordsApi.fetchWords({ includeLocked: true });
  expect(words).toHaveLength(3);
  expect(words.filter((w: object) => m.wordsApi.isLockedWord(w)).map((w: { word: string }) => w.word))
    .toEqual(['좆소', '가상속어']);
});

it('isAdultOnlyWord는 보조 카테고리 slang도 성인 전용으로 판정한다', async () => {
  const m = await loadWithStage(undefined);
  expect(m.wordsApi.isAdultOnlyWord({ category: 'slang' })).toBe(true);
  expect(m.wordsApi.isAdultOnlyWord({ category: 'work', secondaryCategory: 'slang' })).toBe(true);
  expect(m.wordsApi.isAdultOnlyWord({ category: 'work' })).toBe(false);
});

it('markAdultVerified가 account_settings에 기록하고, 이후 목록에 slang 단어가 보인다', async () => {
  const m = await loadWithStage(undefined);
  const { error } = await m.entitlementStore.markAdultVerified();
  expect(error).toBeNull();
  const settingsCall = m.mockSupabase.from.mock.calls.find((c: string[]) => c[0] === 'account_settings');
  expect(settingsCall).toBeDefined();
  expect(m.entitlementStore.isAdultVerified()).toBe(true);
  const words = await m.wordsApi.fetchWords();
  expect(words).toHaveLength(3);
});

it('production 무료 유저는 성인 확인을 해도 열람 불가(프리미엄 필요)', async () => {
  const m = await loadWithStage('production', { adultVerifiedAt: new Date().toISOString() });
  expect(m.entitlementStore.isAdultVerified()).toBe(true);
  expect(m.entitlementStore.canViewAdultContent()).toBe(false);
  const words = await m.wordsApi.fetchWords();
  expect(words.map((w: { word: string }) => w.word)).toEqual(['킹받다']);
});

it('production 프리미엄 + 성인 확인이면 열람 가능', async () => {
  const m = await loadWithStage('production', { premium: true, adultVerifiedAt: new Date().toISOString() });
  expect(m.entitlementStore.canViewAdultContent()).toBe(true);
  const words = await m.wordsApi.fetchWords();
  expect(words).toHaveLength(3);
});
