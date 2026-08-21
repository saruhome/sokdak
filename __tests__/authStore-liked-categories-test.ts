import { mockSupabaseModuleFactory, mockLinkingModuleFactory, makeAuthStoreQuery, mockLoggedInSession } from './helpers/authStoreTestSupport';

jest.mock('@/constants/supabase', () => mockSupabaseModuleFactory());
jest.mock('expo-linking', () => mockLinkingModuleFactory());

import { authStore } from '@/constants/authStore';
import { supabase } from '@/constants/supabase';

const mockSupabase = supabase as unknown as {
  from: jest.Mock;
  auth: { getSession: jest.Mock; onAuthStateChange: jest.Mock; signOut: jest.Mock };
};

describe('liked categories persist across sessions (no longer session-only)', () => {
  beforeAll(async () => {
    mockLoggedInSession(mockSupabase);
    mockSupabase.from.mockImplementation((table: string) => makeAuthStoreQuery({
      then: resolve => resolve({
        data: table === 'liked_categories' ? [{ category_slug: 'kpop' }] : [],
        error: null,
      }),
    }));
    await authStore.initialize();
  });

  it('loads previously liked categories from the liked_categories table on login', () => {
    // clearMocks wipes call history from beforeAll before this runs, so assert on the
    // resulting state rather than on mockSupabase.from's call history.
    expect(authStore.isCategoryLiked('kpop')).toBe(true);
    expect(authStore.getLikedCategorySlugs()).toEqual(['kpop']);
  });

  it('writes new likes to the liked_categories table, not just local memory', () => {
    authStore.toggleCategoryLiked('drama');
    expect(authStore.isCategoryLiked('drama')).toBe(true);

    const insertCall = mockSupabase.from.mock.calls.find(c => c[0] === 'liked_categories');
    expect(insertCall).toBeDefined();
  });
});
