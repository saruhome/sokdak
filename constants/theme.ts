// Sok-Dak (속닥) design tokens — extracted from Figma file "SokDak" (node 229:1651)

export const Colors = {
  // Sok-Dak Color/Primary — main background (cream)
  primary: '#F6F2EA',
  // Sok-Dak Color/기본 — base surface
  base: '#FAFAFA',
  // Sok-Dak Color/Secondary — bottom nav / top app bar background
  secondary: '#52514E',
  // Active tab background (slightly darker than secondary)
  secondaryActive: '#333333',
  // Sok-Dak Color/Point_01 — accent red
  point01: '#A4484D',
  // Sok-Dak Color/Point_02
  point02: '#526192',
  // Sok-Dak Color/Point_03
  point03: '#BBCA9F',
  // Sok-Dak Color/Point_05
  point05: '#E2B55D',

  // Text colors
  font01: '#000000', // 강조, 버튼 (emphasis / buttons)
  font02: '#333333', // 타이틀 (titles)
  font03: '#666666', // 본문 (body)
  font04: '#888888', // 비강조 (de-emphasized)
  textOnDark: '#F6F2EA', // labels on the dark nav bar

  line01: '#C5C5C5',
  white: '#FFFFFF',
  black: '#000000',
} as const;

// Category tag colors (used for word/post category badges)
export const CategoryColors = {
  자주쓰는신조어: '#7C2929',
  릴스: '#DCEDFF',
  kpop: '#4E3894',
} as const;

export const Fonts = {
  // Loaded via @expo-google-fonts/noto-serif-kr — headings / titles
  serifSemiBold: 'NotoSerifKR_600SemiBold',
  serifBold: 'NotoSerifKR_700Bold',
  serifRegular: 'NotoSerifKR_400Regular',
  // Pretendard Variable is not on Google Fonts — add the .ttf/.otf file(s)
  // under assets/fonts/ and load it in app/_layout.tsx (see TODO there).
  // Falls back to the system font until that's added.
  body: 'PretendardVariable',
} as const;

export const Spacing = {
  screenPadding: 24,
} as const;
