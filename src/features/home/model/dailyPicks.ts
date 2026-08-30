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

/** 교과서 문장 금지 — 10~20대가 실제로 쓰는 말투로, 사투리도 간간이 섞는다(운영자 지시).
 * 사투리 항목은 en에 지역·상대(친구끼리 등)를 반드시 표기해 잘못 쓰는 일을 막는다. */
export const EXPRESSIONS: { situation: Situation; ko: string; en: string }[] = [
  { situation: 'cafe', ko: '아아 한 잔 주세요', en: 'One iced americano, please ("a-a" = iced americano slang)' },
  { situation: 'cafe', ko: '여기 콘센트 있는 자리 있어요?', en: 'Is there a seat with a power outlet? (study-café essential)' },
  { situation: 'subway', ko: '나 이번에 내려, 이따 봐', en: "I'm getting off here — see you later (texting a friend)" },
  { situation: 'subway', ko: '몇 정거장 남았어?', en: 'How many stops left? (casual, to a friend)' },
  { situation: 'subway', ko: '언제 오노? 퍼뜩 온나', en: 'When are you coming? Hurry up! (Busan/Gyeongsang dialect, close friends only)' },
  { situation: 'work', ko: '넵! 바로 확인하겠습니다', en: 'Got it! Checking right away (넵 = the eager work "yes" every young employee types)' },
  { situation: 'work', ko: '오늘 칼퇴 각이에요', en: 'Today looks like an on-the-dot leave (칼퇴 = leaving sharp on time, 각 = "the vibe is right")' },
  { situation: 'hospital', ko: '어제부터 몸살 기운이 있어요', en: "I've felt achy and feverish since yesterday" },
  { situation: 'hospital', ko: '주사 꼭 맞아야 돼요?', en: 'Do I really have to get a shot? (casual)' },
  { situation: 'sns', ko: '스토리 봤어, 개웃겨 ㅋㅋ', en: 'Saw your story — hilarious (개- = slangy intensifier, friends only)' },
  { situation: 'sns', ko: '맞팔해요!', en: "Let's follow each other! (맞팔 = mutual follow)" },
  { situation: 'sns', ko: '완전 인생샷이다', en: 'That is THE shot of your life (인생샷 = best photo ever taken of you)' },
  { situation: 'dinner', ko: '오늘은 제가 쏠게요', en: "Tonight's on me (쏘다 = to treat someone)" },
  { situation: 'dinner', ko: '저 술 잘 못 마셔요, 콜라로 할게요', en: "I'm not much of a drinker — I'll have a cola (natural way to pass)" },
  { situation: 'dinner', ko: '겁나 맛있어요', en: 'This is crazy good (겁나 = Jeolla-dialect "super", now used nationwide)' },
  { situation: 'dinner', ko: '마이 무라!', en: 'Dig in! (Busan/Gyeongsang dialect, banmal — close friends only)' },
];
