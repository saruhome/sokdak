import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { authStore } from '@/constants/authStore';
import { reportAppError } from '@/constants/errorReporting';

export const AVATAR_SIGNED_URL_REFRESH_BUFFER_MS = 5 * 60 * 1000;
const AVATAR_SIGNED_URL_REFRESH_RETRY_MS = 60 * 1000;

/**
 * Private Storage의 signed URL은 짧게 유지한다. 앱이 foreground로 돌아올 때만
 * 재발급해 백그라운드 체류 중 URL이 만료된 경우에도 아바타가 다시 표시되도록 한다.
 */
export function useRefreshProfileAvatarSignedUrl() {
  const lastAppState = useRef<AppStateStatus>(AppState.currentState);
  const refreshing = useRef(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearRefreshTimer = () => {
      if (!refreshTimer.current) return;
      clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    };

    const scheduleRefresh = (retryDelayMs?: number) => {
      clearRefreshTimer();
      if (lastAppState.current !== 'active') return;

      const expiresAt = authStore.getProfileAvatarSignedUrlExpiresAt();
      if (!expiresAt && retryDelayMs === undefined) return;
      const delay = retryDelayMs ?? Math.max(0, expiresAt! - Date.now() - AVATAR_SIGNED_URL_REFRESH_BUFFER_MS);
      refreshTimer.current = setTimeout(() => { void refresh(); }, delay);
    };

    const refresh = async () => {
      if (refreshing.current) return;
      refreshing.current = true;
      let succeeded = false;
      try {
        const { error } = await authStore.refreshProfileAvatarSignedUrl();
        if (error) {
          reportAppError(new Error(error), { source: 'network_request', route: 'root' });
        } else {
          succeeded = true;
        }
      } catch (error) {
        reportAppError(error, { source: 'network_request', route: 'root' });
      } finally {
        refreshing.current = false;
        if (lastAppState.current === 'active') {
          scheduleRefresh(succeeded ? undefined : AVATAR_SIGNED_URL_REFRESH_RETRY_MS);
        }
      }
    };

    const subscription = AppState.addEventListener('change', nextAppState => {
      const returningToForeground = /inactive|background/.test(lastAppState.current) && nextAppState === 'active';
      lastAppState.current = nextAppState;
      if (returningToForeground) {
        void refresh();
      } else if (nextAppState === 'active') {
        scheduleRefresh();
      } else {
        clearRefreshTimer();
      }
    });

    const unsubscribe = authStore.subscribe(() => scheduleRefresh());
    scheduleRefresh();

    return () => {
      clearRefreshTimer();
      unsubscribe();
      subscription.remove();
    };
  }, []);
}
