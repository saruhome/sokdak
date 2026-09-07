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

it('성인 확인 전엔 표제어까지 블러(isWordTitleBlurred), 확인 후엔 표제어만 노출', async () => {
  const before = await loadWithStage('production');
  expect(before.wordsApi.isWordTitleBlurred({ category: 'slang' })).toBe(true);
  const after = await loadWithStage('production', { adultVerifiedAt: new Date().toISOString() });
  expect(after.wordsApi.isWordTitleBlurred({ category: 'slang' })).toBe(false);
  expect(after.wordsApi.isLockedWord({ category: 'slang' })).toBe(true); // 비프리미엄 — 뜻은 여전히 잠김
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

/* 뜻 단위 성인 게이트 — 단어는 전체 공개인데 특정 뜻만 19금인 경우(자만추의 '자보고 만남 추구').
 * 단어 전체를 잠그는 category='slang'과 달리 나이만 따진다(프리미엄과 무관). */
const MIXED_MEANINGS = [
  { type: '명사', definition: '자연스러운 만남 추구', examples: [{ kor: '나는 자만추야', eng: 'I go for natural meetings' }] },
  { type: '명사', definition: '자보고 만남 추구', adult_only: true, examples: [{ kor: '(성인 예문)', eng: '(adult example)' }] },
];

it('성인 미확인이면 adult_only 뜻만 가려지고 나머지 뜻은 그대로 보인다', async () => {
  const m = await loadWithStage(undefined);
  expect(m.wordsApi.isMeaningHidden(MIXED_MEANINGS[0])).toBe(false);
  expect(m.wordsApi.isMeaningHidden(MIXED_MEANINGS[1])).toBe(true);
});

it('성인 확인 후에는 adult_only 뜻도 열린다 — 프리미엄과 무관하게 나이만 따진다', async () => {
  const m = await loadWithStage('production', { premium: false, adultVerifiedAt: new Date().toISOString() });
  expect(m.wordsApi.isMeaningHidden(MIXED_MEANINGS[1])).toBe(false);
});

it('가려진 뜻의 예문은 대화 예시로 새어 나가지 않는다', async () => {
  const m = await loadWithStage(undefined);
  /* 상세 화면이 예문을 모으는 방식 그대로 — 정의만 가리고 예문을 안 거르면 여기서 샌다 */
  const shown = MIXED_MEANINGS.filter((x: object) => !m.wordsApi.isMeaningHidden(x)).flatMap((x: any) => x.examples);
  expect(shown.map((e: { kor: string }) => e.kor)).toEqual(['나는 자만추야']);
});
