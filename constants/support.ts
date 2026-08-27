/** 호환 facade — 실제 구현은 src/features/mypage/api/supportApi.ts (mypage feature 분리). */
export {
  fetchMyTickets,
  submitTicket,
  hasUnseenReply,
  markRepliesSeen,
  type SupportTicket,
} from '../src/features/mypage/api/supportApi';
