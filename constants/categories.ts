/** 속닥 카테고리 마스터 데이터 */
export type Category = {
  slug: string;
  name: string;
  emoji: string;
  description: string;
  color: string; // 카테고리별 포인트 컬러
};

export const CATEGORIES: Category[] = [
  { slug: 'daily',           name: '일상',          emoji: '☀️',  description: '일상 대화에서 자주 쓰이는 신조어',         color: '#E8943A' },
  { slug: 'kpop',            name: 'K-POP',         emoji: '🎵',  description: 'K-POP 팬덤에서 비롯된 신조어',             color: '#9B5DE5' },
  { slug: 'drama',           name: '드라마/영화',   emoji: '🎬',  description: '드라마·영화 속 유행 표현',                  color: '#E84D4D' },
  { slug: 'exclamation',     name: '감탄사',         emoji: '😲',  description: '감정을 강하게 나타내는 감탄 표현',          color: '#F5A623' },
  { slug: 'reels',           name: '릴스',           emoji: '📱',  description: '쇼트폼 영상 문화에서 탄생한 말',            color: '#0095F6' },
  { slug: 'new-slang',       name: '새로운 신조어', emoji: '✨',  description: '2024-2025년 새롭게 등장한 신조어',           color: '#3DAA6E' },
  { slug: 'frequently-used', name: '자주 쓰는 신조어', emoji: '🔥', description: '매일 대화에서 빠지지 않는 필수 신조어',  color: '#FF6B35' },
  { slug: 'consonant',       name: '초성 모음집',   emoji: '🔤',  description: 'ㅋㅋ, ㅠㅠ 같은 초성 줄임말 모음',         color: '#52514E' },
  { slug: 'muhandoejeon',    name: '무한도전',      emoji: '😄',  description: '무한도전에서 비롯된 유행어',                color: '#1A73E8' },
  { slug: 'outdated-slang',  name: '한물 간 신조어', emoji: '🕰️', description: '한때 유행했지만 지금은 잘 안 쓰는 말',     color: '#8B7355' },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
