/**
 * 사전 단어 실데이터 접근 계층 — Supabase `words` 테이블.
 * 예전 mockWords.ts와 동일한 Word 타입을 그대로 유지해 화면 쪽 변경을 최소화한다.
 */
import { supabase } from './supabase';
import { youtubeThumbnailUrl } from './youtube';

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
  /** 단어 상세 상단 영상 클립 — 직접 보유/라이선스한 mp4·스트리밍 URL (최우선 재생 경로) */
  videoUrl?: string;
  /** 제3자 유튜브 클립 — videoUrl이 없을 때만 사용, 임베드/딥링크로만 재생(다운로드 없음) */
  youtubeId?: string;
  videoStartSec?: number;
  videoEndSec?: number;
  /** 카드·상세 썸네일 — 명시적으로 없으면 youtubeId로 유튜브 공식 썸네일을 유도해서 쓴다 */
  thumbnailUrl?: string;
};

const WORDS_SELECT =
  'id, word, romanization, category, secondary_category, short_desc, pronunciation, meanings, origin, origin_en, usage, usage_en, related_words, likes, saves, translations, video_url, video_youtube_id, video_start_sec, video_end_sec, thumbnail_url';

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
    youtubeId: row.video_youtube_id ?? undefined,
    videoStartSec: row.video_start_sec ?? undefined,
    videoEndSec: row.video_end_sec ?? undefined,
    thumbnailUrl: row.thumbnail_url ?? (row.video_youtube_id ? youtubeThumbnailUrl(row.video_youtube_id) : undefined),
  };
}

/** 전체 단어 목록 (사전/카테고리/저장/검색/홈 공통 데이터 소스) */
export async function fetchWords(): Promise<Word[]> {
  const { data, error } = await supabase.from('words').select(WORDS_SELECT);
  if (error || !data) return [];
  return data.map(mapRow);
}

/** 지정한 ID의 단어만 조회한다. 저장 목록처럼 대상이 이미 확정된 화면에서 전체 사전 로드를 피한다. */
export async function fetchWordsByIds(ids: string[]): Promise<Word[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from('words').select(WORDS_SELECT).in('id', ids);
  if (error || !data) return [];
  const byId = new Map(data.map(row => [row.id, mapRow(row)]));
  return ids.map(id => byId.get(id)).filter((word): word is Word => !!word);
}

/** 단어 상세 — id 하나만 조회 */
export async function fetchWordById(id: string): Promise<Word | null> {
  const { data, error } = await supabase.from('words').select(WORDS_SELECT).eq('id', id).single();
  if (error || !data) return null;
  return mapRow(data);
}
