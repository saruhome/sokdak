/** 속닥 카테고리 마스터 데이터 */
export type Category = {
  slug: string;
  name: string;
  emoji: string;
  description: string;
  /** Figma "Catogory/{name}_1" — 카드/아이콘 배경 톤 */
  colorBg: string;
  /** Figma "Catogory/{name}_2" — 텍스트/아이콘 전경 톤 */
  colorFg: string;
  /** Figma "Selection/Card/Category" 에셋에서 추출한 카테고리별 일러스트 배경 */
  image: number;
};

/**
 * 카테고리별 2톤 컬러 — SOKDAK_GUIDELINES.md 4-2 "포인트 컬러 — 카테고리 칩" 표 값.
 * '감탄사'는 가이드라인에 정의되지 않은 카테고리라 기존 Figma 추출 값을 그대로 유지.
 */
export const CATEGORIES: Category[] = [
  { slug: 'daily',           name: '일상',            emoji: '☀️',  description: '일상 대화에서 자주 쓰이는 신조어',        colorBg: '#B8C8E8', colorFg: '#3D5B8E', image: require('../assets/categories/daily.jpg') },
  { slug: 'kpop',            name: 'K-POP',           emoji: '🎵',  description: 'K-POP 팬덤에서 비롯된 신조어',            colorBg: '#8B7BC4', colorFg: '#22135F', image: require('../assets/categories/kpop.jpg') },
  { slug: 'drama',           name: '드라마/영화',     emoji: '🎬',  description: '드라마·영화 속 유행 표현',                colorBg: '#E8E8E8', colorFg: '#666666', image: require('../assets/categories/drama.jpg') },
  { slug: 'exclamation',     name: '감탄사',          emoji: '😲',  description: '감정을 강하게 나타내는 감탄 표현',        colorBg: '#FFFFBB', colorFg: '#2E2E1B', image: require('../assets/categories/exclamation.jpg') },
  { slug: 'reels',           name: '릴스',            emoji: '📱',  description: '쇼트폼 영상 문화에서 탄생한 말',          colorBg: '#6B85B8', colorFg: '#DCEDFF', image: require('../assets/categories/reels.jpg') },
  { slug: 'new-slang',       name: '새로운 신조어',   emoji: '✨',  description: '2024-2025년 새롭게 등장한 신조어',        colorBg: '#D97060', colorFg: '#720000', image: require('../assets/categories/new-slang.jpg') },
  { slug: 'frequently-used', name: '자주 쓰는\n신조어', emoji: '🔥', description: '매일 대화에서 빠지지 않는 필수 신조어',   colorBg: '#E8D88A', colorFg: '#7C2929', image: require('../assets/categories/frequently-used.jpg') },
  { slug: 'consonant',       name: '초성 모음집',     emoji: '🔤',  description: 'ㅋㅋ, ㅠㅠ 같은 초성 줄임말 모음',        colorBg: '#E8A880', colorFg: '#C85107', image: require('../assets/categories/consonant.jpg') },
  { slug: 'muhandoejeon',    name: '무한도전',        emoji: '😄',  description: '무한도전에서 비롯된 유행어',              colorBg: '#B0AEA8', colorFg: '#333333', image: require('../assets/categories/muhandoejeon.jpg') },
  { slug: 'outdated-slang',  name: '한물 간\n신조어',  emoji: '🕰️', description: '한때 유행했지만 지금은 잘 안 쓰는 말',    colorBg: '#C8B898', colorFg: '#AF5B23', image: require('../assets/categories/outdated-slang.jpg') },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
