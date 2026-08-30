/** 속닥 커뮤니티 Mock 데이터 */
import { tFor, type Language } from '../../../shared/i18n/languageStore';

export type PostBoard = '질문' | '자유';

/** 게시판 값은 데이터 키라 그대로 두고, 화면에 보이는 라벨만 언어에 맞게 바꾼다.
 * 2026-08-30 재편: 궁금해요/Q&A/질문하기(사실상 전부 질문)를 '질문'으로 병합하고,
 * 부담 없는 진입점으로 '자유'를 신설 — 기존 글은 migration에서 전부 '질문'으로 이동. */
export function getBoardLabel(board: PostBoard, language: Language): string {
  return board === '질문' ? tFor(language, 'boardQuestion') : tFor(language, 'boardFree');
}

export type Comment = {
  id: string;
  author: { name: string; emoji: string; level: string };
  content: string;
  likes: number;
  createdAt: string;
  replies?: Comment[];
};

export type Post = {
  id: string;
  board: PostBoard;
  title: string;
  content: string;
  author: { name: string; emoji: string; level: string };
  createdAt: string;
  views: number;
  likes: number;
  comments: Comment[];
  isFeatured?: boolean;
};

/** Figma: Display/게시판 종류 배지 — bg(채움)+fg(글자) 페어 (Point 컬러 조합) */
export const BOARD_COLORS: Record<PostBoard, { bg: string; fg: string }> = {
  '질문': { bg: '#A4484D', fg: '#F6F2EA' },
  '자유': { bg: '#BBCA9F', fg: '#526192' },
};
