/** 호환 facade — 실제 구현은 src/features/categories/model/categories.ts (categories feature 분리). */
export {
  CATEGORIES,
  getCategoryBySlug,
  getCategoryName,
  categoryMatchesSearch,
  pickLeastPopular,
  type Category,
} from '../src/features/categories/model/categories';
