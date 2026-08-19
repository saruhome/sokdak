import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { authStore } from '@/constants/authStore';
import { reportAppError } from '@/constants/errorReporting';

/**
 * Private Storage의 signed URL은 짧게 유지한다. 앱이 foreground로 돌아올 때만
 * 재발급해 백그라운드 체류 중 URL이 만료된 경우에도 아바타가 다시 표시되도록 한다.
 */
export function useRefreshProfileAvatarSignedUrl() {
  const lastAppState = useRef<AppStateStatus>(AppState.currentState);
  const refreshing = useRef(false);

  useEffect(() => {
    const refresh = async () => {
      if (refreshing.current) return;
      refreshing.current = true;
      try {
        const { error } = await authStore.refreshProfileAvatarSignedUrl();
        if (error) reportAppError(new Error(error), { source: 'network_request', route: 'root' });
      } catch (error) {
        reportAppError(error, { source: 'network_request', route: 'root' });
      } finally {
        refreshing.current = false;
      }
    };

    const subscription = AppState.addEventListener('change', nextAppState => {
      const returningToForeground = /inactive|background/.test(lastAppState.current) && nextAppState === 'active';
      lastAppState.current = nextAppState;
      if (returningToForeground) void refresh();
    });

    return () => subscription.remove();
  }, []);
}
