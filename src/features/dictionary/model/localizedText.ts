/** 본문 번역 묶음({en, ja, es, vi, de}) — 예문 번역과 동일한 en 폴백 규칙.
 * 순수 모듈: supabase 클라이언트를 끌고 오지 않아 테스트에서 requireActual로 안전하게 쓴다. */
export type BodyI18n = { en?: string; ja?: string; es?: string; vi?: string; de?: string };

/** 본문 텍스트를 UI 언어로 — ko UI는 원문, 그 외엔 해당 언어 → en → 원문 순 폴백.
 * 모든 화면(목록 짧은 설명·상세 의미/문화/팁)이 이 한 함수를 거친다. */
export const localizedText = (koText: string, i18n: BodyI18n | null | undefined, language: string): string =>
  language === 'ko' ? koText : (i18n as Record<string, string | undefined>)?.[language] ?? i18n?.en ?? koText;
