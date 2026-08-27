/** 속닥 커뮤니티 Mock 데이터 */
import { tFor, type Language } from '../../../shared/i18n/languageStore';

export type PostBoard = '궁금해요' | 'Q&A' | '질문하기';

/** 게시판 값 자체(Q&A 등)는 데이터 키라 그대로 두고, 화면에 보이는 라벨만 언어에 맞게 바꾼다 */
export function getBoardLabel(board: PostBoard, language: Language): string {
  if (board === 'Q&A') return board;
  return board === '궁금해요' ? tFor(language, 'boardCurious') : tFor(language, 'boardAskQuestion');
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
  '궁금해요': { bg: '#A4484D', fg: '#F6F2EA' },
  'Q&A':     { bg: '#E2B55D', fg: '#A4484D' },
  '질문하기': { bg: '#BBCA9F', fg: '#526192' },
};
