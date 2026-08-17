import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname } from 'expo-router';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { Colors } from '@/constants/Colors';
import { languageStore, useLanguage } from '@/constants/languageStore';
import { reportAppError } from '@/constants/errorReporting';

type AppErrorBoundaryProps = {
  children: ReactNode;
  route?: string;
};

function AppErrorFallback({ resetErrorBoundary }: FallbackProps) {
  // 언어 설정 화면 등에서 locale이 바뀌면 fallback도 즉시 다시 번역한다.
  useLanguage();
  const t = languageStore.t;

  return (
    <View style={styles.container} accessibilityRole="alert" accessibilityLiveRegion="assertive">
      <Text style={styles.title}>{t('errorBoundaryTitle')}</Text>
      <Text style={styles.body}>{t('errorBoundaryBody')}</Text>
      <Pressable
        style={styles.retryButton}
        onPress={resetErrorBoundary}
        accessibilityRole="button"
        accessibilityLabel={t('errorBoundaryRetry')}
      >
        <Text style={styles.retryText}>{t('errorBoundaryRetry')}</Text>
      </Pressable>
    </View>
  );
}

export function AppErrorBoundary({ children, route = 'unknown' }: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={AppErrorFallback}
      onError={(error, info) => {
        reportAppError(error, {
          source: 'render_boundary',
          route,
          componentStack: info.componentStack ?? undefined,
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/** Expo Router 컨텍스트에서 현재 경로를 자동 기록하는 앱 루트 전용 경계. */
export function RouteAwareAppErrorBoundary({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <AppErrorBoundary route={pathname || 'root'}>{children}</AppErrorBoundary>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 28,
    backgroundColor: Colors.background,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: Colors.point1,
  },
  retryText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
});
