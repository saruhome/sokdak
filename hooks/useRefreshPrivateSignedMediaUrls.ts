import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  getPrivateSignedMediaRefreshDelay,
  refreshPrivateSignedMediaUrls,
  subscribePrivateSignedMediaRefresh,
} from '@/constants/privateSignedMediaRegistry';
import { reportAppError } from '@/constants/errorReporting';

const PRIVATE_SIGNED_MEDIA_REFRESH_RETRY_MS = 60 * 1000;

/** 모든 등록된 private 미디어의 signed URL을 foreground 복귀와 만료 5분 전에 갱신한다. */
export function useRefreshPrivateSignedMediaUrls() {
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
      const delay = retryDelayMs ?? getPrivateSignedMediaRefreshDelay();
      if (delay === null) return;
      refreshTimer.current = setTimeout(() => { void refresh(true); }, delay);
    };

    const refresh = async (dueOnly: boolean) => {
      if (refreshing.current) return;
      refreshing.current = true;
      try {
        const results = await refreshPrivateSignedMediaUrls({ dueOnly });
        const failures = results.filter(result => result.error);
        failures.forEach(result => {
          reportAppError(new Error(`${result.id}: ${result.error}`), { source: 'network_request', route: 'root' });
        });
        if (lastAppState.current === 'active') {
          scheduleRefresh(failures.length > 0 ? PRIVATE_SIGNED_MEDIA_REFRESH_RETRY_MS : undefined);
        }
      } catch (error) {
        reportAppError(error, { source: 'network_request', route: 'root' });
        if (lastAppState.current === 'active') scheduleRefresh(PRIVATE_SIGNED_MEDIA_REFRESH_RETRY_MS);
      } finally {
        refreshing.current = false;
      }
    };

    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      const returningToForeground = /inactive|background/.test(lastAppState.current) && nextAppState === 'active';
      lastAppState.current = nextAppState;
      if (returningToForeground) {
        void refresh(false);
      } else if (nextAppState === 'active') {
        scheduleRefresh();
      } else {
        clearRefreshTimer();
      }
    });

    const unsubscribe = subscribePrivateSignedMediaRefresh(scheduleRefresh);
    scheduleRefresh();

    return () => {
      clearRefreshTimer();
      unsubscribe();
      appStateSubscription.remove();
    };
  }, []);
}
