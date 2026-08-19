import { PRIVATE_SIGNED_MEDIA_REFRESH_BUFFER_MS } from '@/constants/privateSignedMediaRegistry';
import { useRefreshPrivateSignedMediaUrls } from './useRefreshPrivateSignedMediaUrls';

/** @deprecated 공용 private 미디어 갱신 버퍼를 사용한다. */
export const AVATAR_SIGNED_URL_REFRESH_BUFFER_MS = PRIVATE_SIGNED_MEDIA_REFRESH_BUFFER_MS;

/**
 * Private Storage의 signed URL은 짧게 유지한다. 앱이 foreground로 돌아올 때만
 * 재발급해 백그라운드 체류 중 URL이 만료된 경우에도 아바타가 다시 표시되도록 한다.
 */
export function useRefreshProfileAvatarSignedUrl() {
  useRefreshPrivateSignedMediaUrls();
}
