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
} as const;

/**
 * 카테고리별 colorBg/colorFg 페어는 Figma 원본 자체가 항상 고대비 조합은
 * 아니라서(예: 릴스는 두 톤 다 옅은 파랑), 채움 배지에 텍스트를 얹을 때는
 * 배경색 밝기를 계산해 검정/흰 텍스트 중 읽기 쉬운 쪽을 고른다.
 */
export function getReadableTextColor(bgHex: string): string {
  const hex = bgHex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1A1A1A' : '#FFFFFF';
}
