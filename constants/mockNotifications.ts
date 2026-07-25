/** 속닥 Mock 알림 데이터 — 실제 알림 발송/저장 백엔드가 아직 없어(댓글·좋아요 트리거 미구현) mock으로 구성 */
export type AppNotification = {
  id: string;
  actorName: string;
  actorBold: boolean;
  message: string;
  timeAgo: string;
  thumbnail?: number;
};

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: '1', actorName: '우리말사랑', actorBold: true, message: '님의 새로운 댓글 : 안녕하세요. 두쫀쿠가 뭐예요?', timeAgo: '15분' },
  { id: '2', actorName: '두쫀쿠광인', actorBold: true, message: '님이 내 게시물을 마음에 들어 합니다.', timeAgo: '15분' },
  { id: '3', actorName: '우리말사랑', actorBold: true, message: '님의 새로운 댓글 : 안녕하세요. 두쫀쿠가 뭐예요?', timeAgo: '15분' },
  { id: '4', actorName: '우리말사랑', actorBold: true, message: '님의 새로운 댓글 : 안녕하세요. 두쫀쿠가 뭐예요?', timeAgo: '15분' },
  { id: '5', actorName: '우리말사랑', actorBold: true, message: '님의 새로운 댓글 : 안녕하세요. 두쫀쿠가 뭐예요?', timeAgo: '15분' },
];
