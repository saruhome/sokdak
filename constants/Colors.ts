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
  error:    '#C04A3A',
  warning:  '#C07A2A',
  success:  '#3A8C5C',
} as const;
