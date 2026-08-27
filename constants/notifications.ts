/** 호환 facade — 실제 구현은 src/features/notifications/api/notificationsApi.ts (notifications feature 분리). */
export {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  type AppNotification,
} from '../src/features/notifications/api/notificationsApi';
