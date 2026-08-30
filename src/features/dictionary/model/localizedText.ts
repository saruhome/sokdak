/** 본문 번역 묶음({en, ja, es, vi, de}) — 예문 번역과 동일한 en 폴백 규칙.
 * 순수 모듈: supabase 클라이언트를 끌고 오지 않아 테스트에서 requireActual로 안전하게 쓴다. */
export type BodyI18n = { en?: string; ja?: string; es?: string; vi?: string; de?: string };

/** 본문 텍스트를 UI 언어로 — ko UI는 원문, 그 외엔 해당 언어 → en → 원문 순 폴백.
 * 모든 화면(목록 짧은 설명·상세 의미/문화/팁)이 이 한 함수를 거친다. */
export const localizedText = (koText: string, i18n: BodyI18n | null | undefined, language: string): string =>
  language === 'ko' ? koText : (i18n as Record<string, string | undefined>)?.[language] ?? i18n?.en ?? koText;

/** 좁은 카드용 초압축 글로스 — 이미 큐레이션된 translations 한 줄 대응어를 재사용한다.
 * ko UI는 원문 짧은 설명, 그 외엔 해당 언어 대응어의 첫 구절(/ 앞) → 본문 번역 폴백.
 * 카드가 좁아 축소로도 못 담는 웹 환경에서 … 잘림을 없애기 위한 문구 소스(운영 결정). */
export type CardGlossSource = {
  shortDesc: string;
  shortDescI18n?: BodyI18n | null;
  translations?: { lang: string; text: string }[];
};

export const cardGloss = (w: CardGlossSource, language: string): string => {
  if (language === 'ko') return w.shortDesc;
  const code = language.toUpperCase();
  const hit = w.translations?.find(t => t.lang.toUpperCase().includes(code))?.text;
  const first = hit?.split('/')[0].trim();
  return first || localizedText(w.shortDesc, w.shortDescI18n, language);
};
