/**
 * SokDak Font ramp — Figma "Sok-Dak Font" variable collection.
 * Body/Title은 Noto Serif KR(전역 Text 기본값, app/_layout.tsx 참고),
 * 작은 UI 텍스트(14p/caption)는 Figma가 Pretendard Variable을 쓰지만
 * 해당 폰트 패키지가 RN에서 쓰기엔 너무 커서(97MB+) 시스템 기본 산세리프로 대체한다.
 */
export const Typography = {
  // Sok-Dak Font/속닥 32 — 로고/대형 타이틀
  heading32: { fontFamily: 'NotoSerifKR_600SemiBold', fontSize: 32, lineHeight: 36 },
  // Sok-Dak Font/속닥 Title — 화면/섹션 타이틀
  title: { fontFamily: 'NotoSerifKR_600SemiBold', fontSize: 18, lineHeight: 24 },
  // Sok-Dak Font/속닥 본문
  body: { fontFamily: 'NotoSerifKR_400Regular', fontSize: 16, lineHeight: 20 },
  // Sok-Dak Font/속닥 본문 Bold
  bodyBold: { fontFamily: 'NotoSerifKR_600SemiBold', fontSize: 16, lineHeight: 20 },
  // Sok-Dak Font/속닥 14p — Pretendard 대체(시스템 산세리프)
  ui14: { fontFamily: undefined, fontSize: 14, lineHeight: 18 },
  // Sok-Dak Font/속닥 caption — Pretendard 대체(시스템 산세리프)
  caption: { fontFamily: undefined, fontSize: 12, lineHeight: 16 },
} as const;
