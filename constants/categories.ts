import type { Language } from './languageStore';

/** 속닥 카테고리 마스터 데이터 */
export type Category = {
  slug: string;
  name: string;
  /** 언어를 바꿨을 때 표시할 이름 (신조어 원문 자체가 아니라 분류명이라 번역 대상) */
  nameEn: string;
  nameJa: string;
  nameVi: string;
  nameEs: string;
  nameDe: string;
  emoji: string;
  description: string;
  /** Figma "Catogory/{name}_1" — 카드/아이콘 배경 톤 */
  colorBg: string;
  /** Figma "Catogory/{name}_2" — 텍스트/아이콘 전경 톤 */
  colorFg: string;
  /** Figma "Selection/Card/Category" 에셋에서 추출한 카테고리별 일러스트 배경 —
   * 신규 카테고리는 실사진 에셋이 없을 수 있어 optional(없으면 colorBg 단색 카드로 대체) */
  image?: number;
  /** true면 비프리미엄 유저는 카드 탭 시 프리미엄 업그레이드 화면으로 우회 */
  premiumOnly?: boolean;
};

/**
 * 카테고리별 2톤 컬러 — SOKDAK_GUIDELINES.md 4-2 "포인트 컬러 — 카테고리 칩" 표 값.
 * '감탄사'는 가이드라인에 정의되지 않은 카테고리라 기존 Figma 추출 값을 그대로 유지.
 */
export const CATEGORIES: Category[] = [
  { slug: 'daily',           name: '일상',            nameEn: 'Daily',           nameJa: '日常',                  nameVi: 'Hằng ngày',             nameEs: 'Cotidiano',             nameDe: 'Alltag',                  emoji: '☀️',  description: '일상 대화에서 자주 쓰이는 신조어',        colorBg: '#B8C8E8', colorFg: '#3D5B8E', image: require('../assets/categories/daily.jpg') },
  { slug: 'kpop',            name: 'K-POP',           nameEn: 'K-POP',           nameJa: 'K-POP',                 nameVi: 'K-POP',                 nameEs: 'K-POP',                 nameDe: 'K-POP',                   emoji: '🎵',  description: 'K-POP 팬덤에서 비롯된 신조어',            colorBg: '#8B7BC4', colorFg: '#22135F', image: require('../assets/categories/kpop.jpg') },
  { slug: 'drama',           name: '드라마/\n영화',   nameEn: 'Drama/\nMovies',  nameJa: 'ドラマ/\n映画',          nameVi: 'Phim/\nĐiện ảnh',       nameEs: 'Series/\nPelículas',    nameDe: 'Drama/\nFilme',           emoji: '🎬',  description: '드라마·영화 속 유행 표현',                colorBg: '#E8E8E8', colorFg: '#666666', image: require('../assets/categories/drama.jpg') },
  { slug: 'exclamation',     name: '감탄사',          nameEn: 'Exclamations',    nameJa: '感嘆詞',                nameVi: 'Thán từ',               nameEs: 'Interjecciones',        nameDe: 'Ausrufe',                 emoji: '😲',  description: '감정을 강하게 나타내는 감탄 표현',        colorBg: '#FFFFBB', colorFg: '#2E2E1B', image: require('../assets/categories/exclamation.jpg') },
  { slug: 'reels',           name: '릴스',            nameEn: 'Reels',           nameJa: 'リール',                nameVi: 'Reels',                 nameEs: 'Reels',                 nameDe: 'Reels',                   emoji: '📱',  description: '쇼트폼 영상 문화에서 탄생한 말',          colorBg: '#6B85B8', colorFg: '#DCEDFF', image: require('../assets/categories/reels.jpg') },
  { slug: 'new-slang',       name: '새로운\n신조어',  nameEn: 'New\nSlang',      nameJa: '新しい\n新造語',         nameVi: 'Từ lóng\nmới',          nameEs: 'Jerga\nnueva',          nameDe: 'Neuer\nSlang',            emoji: '✨',  description: '2024-2025년 새롭게 등장한 신조어',        colorBg: '#D97060', colorFg: '#720000', image: require('../assets/categories/new-slang.jpg') },
  { slug: 'frequently-used', name: '자주 쓰는\n신조어', nameEn: 'Frequently\nUsed', nameJa: 'よく使う\n新造語',     nameVi: 'Từ lóng\nthường dùng',  nameEs: 'Jerga\nfrecuente',      nameDe: 'Häufiger\nSlang',         emoji: '🔥', description: '매일 대화에서 빠지지 않는 필수 신조어',   colorBg: '#E8D88A', colorFg: '#7C2929', image: require('../assets/categories/frequently-used.jpg') },
  { slug: 'consonant',       name: '초성\n모음집',    nameEn: 'Consonant\nSlang', nameJa: '子音字\nコレクション', nameVi: 'Bộ sưu tập\nphụ âm',    nameEs: 'Colección de\nconsonantes', nameDe: 'Konsonanten-\nSlang', emoji: '🔤', description: 'ㅋㅋ, ㅠㅠ 같은 초성 줄임말 모음',        colorBg: '#E8A880', colorFg: '#C85107', image: require('../assets/categories/consonant.jpg') },
  { slug: 'muhandoejeon',    name: '무한도전',        nameEn: 'Infinite\nChallenge', nameJa: '無限挑戦',          nameVi: 'Vô Hạn\nThử Thách',     nameEs: 'Desafío\nInfinito',     nameDe: 'Infinite\nChallenge',     emoji: '😄',  description: '무한도전에서 비롯된 유행어',              colorBg: '#B0AEA8', colorFg: '#333333', image: require('../assets/categories/muhandoejeon.jpg') },
  { slug: 'outdated-slang',  name: '한물 간\n신조어',  nameEn: 'Outdated\nSlang',  nameJa: '古い\n新造語',          nameVi: 'Từ lóng\nlỗi thời',     nameEs: 'Jerga\npasada de moda', nameDe: 'Veralteter\nSlang',        emoji: '🕰️', description: '한때 유행했지만 지금은 잘 안 쓰는 말',    colorBg: '#C8B898', colorFg: '#AF5B23', image: require('../assets/categories/outdated-slang.jpg') },
  // ponytail: 전용 일러스트 에셋이 없어 단색 카드(colorBg)로 대체 — 실제 에셋 추출되면 image 필드 추가
  { slug: 'slang',           name: '속어',            nameEn: 'Slang',           nameJa: '俗語',                  nameVi: 'Tiếng lóng',            nameEs: 'Jerga',                 nameDe: 'Umgangssprache',         emoji: '🔥',  description: '거친 표현·비속어 등 실제 대화에서 쓰이는 속어', colorBg: '#3A3A3A', colorFg: '#E2B55D', premiumOnly: true },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** 언어에 맞는 카테고리 이름 — 신조어 원문이 아니라 분류명이라 다른 언어 모드에서도 번역해 보여준다 */
export function getCategoryName(category: Category, language: Language): string {
  switch (language) {
    case 'en': return category.nameEn;
    case 'ja': return category.nameJa;
    case 'vi': return category.nameVi;
    case 'es': return category.nameEs;
    case 'de': return category.nameDe;
    default: return category.name;
  }
}

/** 표시 언어와 무관하게 카테고리의 지원 언어 이름·slug·기존 설명에서 검색한다.
 * 악센트와 독일어 움라우트를 생략한 입력도 찾을 수 있게 결합 문자를 제거한다. */
function normalizeCategorySearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function categoryMatchesSearch(category: Category, query: string): boolean {
  const normalizedQuery = normalizeCategorySearchText(query);
  if (!normalizedQuery) return false;
  return [
    category.slug,
    category.name,
    category.nameEn,
    category.nameJa,
    category.nameVi,
    category.nameEs,
    category.nameDe,
    category.description,
  ].some(value => normalizeCategorySearchText(value).includes(normalizedQuery));
}

/**
 * countOf가 작은(=인기가 낮은) 항목일수록 뽑힐 확률이 높은 랜덤 선택 — 배너 추천용.
 * 실제 유저별 검색 빈도 데이터가 없어(추적 기능 자체가 아직 없음) likes/카테고리별 단어 수를
 * "자주 찾는 정도"의 대리 지표로 쓴다. Math.random()**2는 0 쪽으로 치우친 분포라 인기 낮은
 * 항목이 더 자주 나오되, 완전히 배제하진 않는다.
 * ponytail: 인기 지표를 대리 신호로 씀 — 진짜 개인별 열람 이력을 추적하게 되면 그 데이터로 교체.
 */
export function pickLeastPopular<T>(items: T[], countOf: (item: T) => number): T {
  const sorted = [...items].sort((a, b) => countOf(a) - countOf(b));
  const index = Math.min(Math.floor(Math.random() ** 2 * sorted.length), sorted.length - 1);
  return sorted[index];
}
