/**
 * SokDak Font ramp — Figma "Sok-Dak Font" variable collection.
 * Body/Title은 Noto Serif KR(전역 Text 기본값, app/_layout.tsx 참고),
 * 작은 UI 텍스트(14p/caption)는 Figma가 Pretendard Variable을 쓰지만
 * 해당 폰트 패키지가 RN에서 쓰기엔 너무 커서(97MB+) 시스템 기본 산세리프로 대체한다.
 */
export const Typography = {
  // 속닥 Headline — 강조 단어, 페이지 핵심 제목 (SOKDAK_GUIDELINES.md 4-1)
  heading32: { fontFamily: 'NotoSerifKR_600SemiBold', fontSize: 26, lineHeight: 36 },
  // 속닥 Title — 섹션 헤더, 카드 제목, 내비게이션 바
  title: { fontFamily: 'NotoSerifKR_600SemiBold', fontSize: 18, lineHeight: 18 },
  // 속닥 본문
  body: { fontFamily: 'NotoSerifKR_400Regular', fontSize: 16, lineHeight: 20 },
  // 속닥 본문 Bold — 게시글 제목, 강조 본문
  bodyBold: { fontFamily: 'NotoSerifKR_600SemiBold', fontSize: 16, lineHeight: 20 },
  // 속닥 14p — Pretendard 대체(시스템 산세리프)
  ui14: { fontFamily: undefined, fontSize: 14, lineHeight: 18 },
  // 속닥 caption — Pretendard 대체(시스템 산세리프)
  caption: { fontFamily: undefined, fontSize: 12, lineHeight: 16 },
  // 탭 바 레이블 — 하단 탭 바 아이콘 레이블
  tab: { fontFamily: undefined, fontSize: 10, lineHeight: 16 },
} as const;
