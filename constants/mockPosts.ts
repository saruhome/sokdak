/** 호환 facade — 실제 구현은 src/features/community/model/boards.ts (community feature 분리).
 * 파일명은 초기 mock 시절 이름을 그대로 유지한다(소비처 10곳의 import 경로 보존). */
export { BOARD_COLORS, getBoardLabel, type PostBoard, type Post, type Comment } from '../src/features/community/model/boards';
