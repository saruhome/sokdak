/**
 * 단어가 10개 모이기 전인 카테고리(PENDING_CATEGORIES)는 목록에는 안 뜨지만,
 * 그 slug로 이미 등록된 단어의 배지·상세는 계속 찾아져야 한다.
 */
import { CATEGORIES, getCategoryBySlug } from '@/constants/categories';
import { PENDING_CATEGORIES } from '@/src/features/categories/model/categories';

describe('pending categories', () => {
  it.each(PENDING_CATEGORIES.map(c => [c.slug] as const))('%s is hidden from lists but still resolvable', slug => {
    expect(CATEGORIES.some(c => c.slug === slug)).toBe(false);
    expect(getCategoryBySlug(slug)?.slug).toBe(slug);
  });
});
