/**
 * SokDak Design System - Color Tokens
 * Source: Figma (RbDWZdCLT0xXbH0ZW25jPi) — "Sok-Dak Color" variable collection,
 * read directly via Figma API (get_variable_defs) on nodes 229:3706 / 229:2528 /
 * 229:11206 / 229:3201.
 */
export const Colors = {
  background:        '#F6F2EA',   // Sok-Dak Color/Primary
  surface:            '#FAFAFA',  // Sok-Dak Color/기본
  pageBackground:     '#F8F8F8',  // Sok-Dak Color/배경 (일부 화면의 보조 배경)

  navBar:            '#52514E',   // Sok-Dak Color/Secondary
  navBarIconActive:  '#F6F2EA',
  navBarIconMuted:   '#948E84',

  textPrimary:   '#333333',   // Sok-Dak Color/Font_02 (타이틀)
  textSecondary: '#666666',   // Sok-Dak Color/Font_03 (본문)
  textTertiary:  '#888888',   // Sok-Dak Color/Font_04 (비강조)
  textEmphasis:  '#121212',   // Sok-Dak Color/Font_01 (강조, 버튼)

  white:      '#FFFFFF',
  border:     '#C5C5C5',   // Sok-Dak Color/Line_01
  divider:    '#EBEBEB',   // Sok-Dak Color/Line_02

  // Sok-Dak Color/Point_01~05 (카테고리 포인트 등 장식적 강조에 사용)
  point1: '#A4484D',
  point2: '#526192',
  point3: '#BBCA9F',
  point5: '#E2B55D',

  accent:   '#121212',   // = textEmphasis. 기존 초록색은 Figma에 없던 임의값이었음
  error:    '#A94949',   // SOKDAK_GUIDELINES.md point.like — 좋아요 활성/알림 뱃지/경고에 겸용
  warning:  '#C07A2A',
  success:  '#3A8C5C',
  premium:  '#E2B55D',   // = point5. 아이콘·테두리·별 등 액센트 전용 — 밝은 배경 위 '텍스트'에는 쓰지 말 것
  premiumText: '#8A651E', // 프리미엄 텍스트 전용 진한 골드 — 크림/연금색 배경에서 대비 확보 (#E2B55D는 2.2:1로 미달)
} as const;

/**
 * 카테고리별 colorBg/colorFg 페어는 Figma 원본 자체가 항상 고대비 조합은
 * 아니라서(예: 릴스는 두 톤 다 옅은 파랑), 채움 배지에 텍스트를 얹을 때는
 * 배경색 밝기를 계산해 검정/흰 텍스트 중 읽기 쉬운 쪽을 고른다.
 */
export function getReadableTextColor(bgHex: string): string {
  return luminanceOf(bgHex) > 0.6 ? '#1A1A1A' : '#FFFFFF';
}

function luminanceOf(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * 카테고리 2톤(colorBg/colorFg) 중 어두운 쪽을 반환.
 * 카드 라벨은 밝은 스크림 위에 얹히는데, 릴스처럼 colorFg가 밝은 톤(#DCEDFF)인
 * 카테고리는 그대로 쓰면 글자가 보이지 않는다. 카테고리 색 정체성은 유지하면서
 * 대비만 확보하기 위해 두 톤 중 더 어두운 쪽을 고른다.
 */
export function getCategoryLabelColor(colorBg: string, colorFg: string): string {
  return luminanceOf(colorFg) <= luminanceOf(colorBg) ? colorFg : colorBg;
}
