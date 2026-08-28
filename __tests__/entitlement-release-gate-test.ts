/**
 * BETA_UNLIMITED_ENTITLEMENTS 릴리스 게이트 — 플래그는 EXPO_PUBLIC_RELEASE_STAGE에서
 * 파생되므로(모듈 평가 시점에 읽음) 스테이지별로 jest.resetModules + require로
 * 모듈 그래프를 새로 만들어 검증한다.
 * production: 플래그 꺼짐 → 무료 한도(단어 저장/카테고리 좋아요/TTS) 강제, premium은 우회.
 * private-beta(및 로컬 dev의 스테이지 미설정): 기존 무제한 동작 유지.
 */
import {
  mockSupabaseModuleFactory,
  mockLinkingModuleFactory,
  makeAuthStoreQuery,
  mockLoggedInSession,
} from './helpers/authStoreTestSupport';

const ORIGINAL_STAGE = process.env.EXPO_PUBLIC_RELEASE_STAGE;

type FreshModules = {
  authStore: typeof import('../src/features/auth/model/authStore').authStore;
  entitlementStore: typeof import('../src/features/auth/model/entitlementStore').entitlementStore;
  BETA_UNLIMITED_ENTITLEMENTS: boolean;
  FREE_TTS_DAILY_LIMIT: number;
  mockSupabase: ReturnType<typeof mockSupabaseModuleFactory>['supabase'];
};

/** 지정 스테이지로 env를 바꾼 뒤 authStore/entitlementStore 모듈 그래프를 새로 로드한다. */
async function loadWithStage(
  stage: string | undefined,
  { premium = false, savedWords = 0, likedCategories = 0 } = {},
): Promise<FreshModules> {
  jest.resetModules();
  if (stage === undefined) delete process.env.EXPO_PUBLIC_RELEASE_STAGE;
  else process.env.EXPO_PUBLIC_RELEASE_STAGE = stage;

  jest.doMock('@/constants/supabase', () => mockSupabaseModuleFactory());
  jest.doMock('expo-linking', () => mockLinkingModuleFactory());

  /* eslint-disable @typescript-eslint/no-var-requires */
  const { supabase } = require('@/constants/supabase');
  const entitlementModule = require('../src/features/auth/model/entitlementStore');
  const { authStore } = require('@/constants/authStore');
  /* eslint-enable @typescript-eslint/no-var-requires */

  mockLoggedInSession(supabase);
  supabase.from.mockImplementation((table: string) => makeAuthStoreQuery({
    profile: { is_premium: premium },
    then: resolve => resolve({
      data: table === 'saved_words'
        ? Array.from({ length: savedWords }, (_, i) => ({ word_id: `w${i}` }))
        : table === 'liked_categories'
          ? Array.from({ length: likedCategories }, (_, i) => ({ category_slug: `c${i}` }))
          : [],
      error: null,
    }),
  }));
  await authStore.initialize();

  return {
    authStore,
    entitlementStore: entitlementModule.entitlementStore,
    BETA_UNLIMITED_ENTITLEMENTS: entitlementModule.BETA_UNLIMITED_ENTITLEMENTS,
    FREE_TTS_DAILY_LIMIT: entitlementModule.FREE_TTS_DAILY_LIMIT,
    mockSupabase: supabase,
  };
}

afterAll(() => {
  if (ORIGINAL_STAGE === undefined) delete process.env.EXPO_PUBLIC_RELEASE_STAGE;
  else process.env.EXPO_PUBLIC_RELEASE_STAGE = ORIGINAL_STAGE;
});

describe('production: 무료 회원 한도 강제', () => {
  it('플래그가 꺼지고 단어 저장·카테고리 좋아요·TTS 한도가 걸린다', async () => {
    const m = await loadWithStage('production', { savedWords: 3, likedCategories: 2 });

    expect(m.BETA_UNLIMITED_ENTITLEMENTS).toBe(false);
    expect(m.entitlementStore.hasUnlimited()).toBe(false);
    expect(m.authStore.canSaveMoreWords()).toBe(false);       // FREE_WORD_SAVE_LIMIT=3 도달
    expect(m.authStore.canLikeMoreCategories()).toBe(false);  // FREE_CATEGORY_LIKE_LIMIT=2 도달

    expect(m.entitlementStore.canPlayTtsToday()).toBe(true);
    for (let i = 0; i < m.FREE_TTS_DAILY_LIMIT; i++) m.entitlementStore.recordTtsPlay();
    expect(m.entitlementStore.canPlayTtsToday()).toBe(false); // 일일 상한 도달
  });

  it('한도 미만이면 무료 회원도 계속 저장할 수 있다', async () => {
    const m = await loadWithStage('production', { savedWords: 2, likedCategories: 1 });
    expect(m.authStore.canSaveMoreWords()).toBe(true);
    expect(m.authStore.canLikeMoreCategories()).toBe(true);
  });
});

describe('production: premium 회원 우회', () => {
  it('한도 도달 상태에서도 전부 허용된다', async () => {
    const m = await loadWithStage('production', { premium: true, savedWords: 3, likedCategories: 2 });

    expect(m.BETA_UNLIMITED_ENTITLEMENTS).toBe(false);
    expect(m.entitlementStore.hasUnlimited()).toBe(true);
    expect(m.authStore.canSaveMoreWords()).toBe(true);
    expect(m.authStore.canLikeMoreCategories()).toBe(true);

    for (let i = 0; i < m.FREE_TTS_DAILY_LIMIT + 2; i++) m.entitlementStore.recordTtsPlay();
    expect(m.entitlementStore.canPlayTtsToday()).toBe(true); // premium은 record가 no-op
  });
});

describe('private-beta 및 스테이지 미설정: 기존 무제한 유지', () => {
  it('private-beta에서는 한도 도달 상태여도 무제한이다', async () => {
    const m = await loadWithStage('private-beta', { savedWords: 3, likedCategories: 2 });
    expect(m.BETA_UNLIMITED_ENTITLEMENTS).toBe(true);
    expect(m.authStore.canSaveMoreWords()).toBe(true);
    expect(m.authStore.canLikeMoreCategories()).toBe(true);
    expect(m.entitlementStore.canPlayTtsToday()).toBe(true);
  });

  it('로컬 dev(스테이지 미설정)도 무제한이다', async () => {
    const m = await loadWithStage(undefined, { savedWords: 3 });
    expect(m.BETA_UNLIMITED_ENTITLEMENTS).toBe(true);
    expect(m.authStore.canSaveMoreWords()).toBe(true);
  });
});
