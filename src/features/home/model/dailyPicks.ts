/** 홈 화면의 "오늘의 ~" 선택 로직과 실전 표현 데이터 — 순수 모듈. */
import type { TranslationKey } from '../../../shared/i18n/keys';

/** 날짜(YYYY-MM-DD)를 시드로 결정적 난수를 뽑아 오늘 하루 동안은 항상 같은 결과가 나오게 한다 */
export function pickDaily<T>(items: T[], count: number, seed: string): T[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const pool = [...items];
  const picked: T[] = [];
  while (picked.length < count && pool.length > 0) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const idx = h % pool.length;
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

/** "오늘의 실전 표현" — 한국 거주 외국인이 바로 써먹는 상황별 표현.
 * 신조어 사전과는 다른 결의 콘텐츠라 별도 로컬 데이터로 관리한다(다른 화면의
 * HORANG_HINTS 등과 동일한 컨벤션 — 아직 사전 콘텐츠처럼 5개 언어로 번역하진 않음). */
export type Situation = 'cafe' | 'subway' | 'work' | 'hospital' | 'sns' | 'dinner';

export const SITUATION_LABEL_KEY: Record<Situation, TranslationKey> = {
  cafe: 'situationCafe', subway: 'situationSubway', work: 'situationWork',
  hospital: 'situationHospital', sns: 'situationSns', dinner: 'situationDinner',
};

export const EXPRESSIONS: { situation: Situation; ko: string; en: string }[] = [
  { situation: 'cafe', ko: '이거 하나 주세요', en: 'One of these, please (pointing at the menu)' },
  { situation: 'cafe', ko: '테이크아웃 할게요', en: "I'll take it to go" },
  { situation: 'subway', ko: '이번 역에서 내리세요?', en: 'Are you getting off at this stop?' },
  { situation: 'subway', ko: '여기 자리 있어요?', en: 'Is this seat taken?' },
  { situation: 'work', ko: '먼저 퇴근하겠습니다', en: "I'll head out first (leaving before others)" },
  { situation: 'work', ko: '확인 후 회신 드리겠습니다', en: "I'll check and get back to you" },
  { situation: 'hospital', ko: '여기가 아파요', en: 'It hurts here' },
  { situation: 'hospital', ko: '실비보험 있어요', en: 'I have private (supplemental) insurance' },
  { situation: 'sns', ko: '선팔하고 갈게요', en: "I'll follow you first" },
  { situation: 'sns', ko: '댓글 감사해요', en: 'Thanks for the comment' },
  { situation: 'dinner', ko: '제가 한 잔 따라드릴게요', en: 'Let me pour you a drink' },
  { situation: 'dinner', ko: '저는 술을 잘 못 마셔요', en: "I don't drink well (polite way to decline alcohol)" },
];
