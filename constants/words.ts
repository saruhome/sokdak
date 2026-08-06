/**
 * 사전 단어 실데이터 접근 계층 — Supabase `words` 테이블.
 * 예전 mockWords.ts와 동일한 Word 타입을 그대로 유지해 화면 쪽 변경을 최소화한다.
 */
import { supabase } from './supabase';

export type Word = {
  id: string;
  word: string;
  /** 로마자 표기(국립국어원 Revised Romanization, 음절 단위 하이픈) — 목록에서 단어 옆에 표시 */
  romanization: string;
  category: string;   // Category slug (주 카테고리)
  /** Figma: 단어가 두 카테고리에 걸치는 경우(예: "오빠" = 감탄사+릴스) 상세 화면에 배지/탭 2개로 표시 */
  secondaryCategory?: string;
  shortDesc: string;
  pronunciation?: string;
  meanings: Array<{
    type: string;
    definition: string;
    examples: Array<{ kor: string; eng: string }>;
  }>;
  origin?: string;
  originEn?: string;
  usage: string;
  usageEn?: string;
  relatedWords: string[];
  likes: number;
  saves: number;
  translations: { lang: string; text: string }[];
  /** 단어 상세 상단 영상 클립 — 비디오 링크(mp4/스트리밍 URL)가 있는 단어만 지정 */
  videoUrl?: string;
};

const WORDS_SELECT =
  'id, word, romanization, category, secondary_category, short_desc, pronunciation, meanings, origin, origin_en, usage, usage_en, related_words, likes, saves, translations, video_url';

function mapRow(row: any): Word {
  return {
    id: row.id,
    word: row.word,
    romanization: row.romanization ?? '',
    category: row.category,
    secondaryCategory: row.secondary_category ?? undefined,
    shortDesc: row.short_desc,
    pronunciation: row.pronunciation ?? undefined,
    meanings: row.meanings ?? [],
    origin: row.origin ?? undefined,
    originEn: row.origin_en ?? undefined,
    usage: row.usage,
    usageEn: row.usage_en ?? undefined,
    relatedWords: row.related_words ?? [],
    likes: row.likes,
    saves: row.saves,
    translations: row.translations ?? [],
    videoUrl: row.video_url ?? undefined,
  };
}

/** 전체 단어 목록 (사전/카테고리/저장/검색/홈 공통 데이터 소스) */
export async function fetchWords(): Promise<Word[]> {
  const { data, error } = await supabase.from('words').select(WORDS_SELECT);
  if (error || !data) return [];
  return data.map(mapRow);
}

/** 단어 상세 — id 하나만 조회 */
export async function fetchWordById(id: string): Promise<Word | null> {
  const { data, error } = await supabase.from('words').select(WORDS_SELECT).eq('id', id).single();
  if (error || !data) return null;
  return mapRow(data);
}
