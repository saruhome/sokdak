import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { Colors } from '@/constants/Colors';
import { languageStore, type Language } from '@/constants/languageStore';

type ErrorCopy = {
  title: string;
  body: string;
  retry: string;
};

const ERROR_COPY: Record<Language, ErrorCopy> = {
  ko: {
    title: '화면을 불러오지 못했어요',
    body: '잠시 후 다시 시도해 주세요.',
    retry: '다시 시도',
  },
  en: {
    title: "We couldn't load this screen",
    body: 'Please try again in a moment.',
    retry: 'Try again',
  },
  ja: {
    title: '画面を読み込めませんでした',
    body: 'しばらくしてからもう一度お試しください。',
    retry: 'もう一度試す',
  },
  vi: {
    title: 'Không thể tải màn hình này',
    body: 'Vui lòng thử lại sau ít phút.',
    retry: 'Thử lại',
  },
  es: {
    title: 'No pudimos cargar esta pantalla',
    body: 'Vuelve a intentarlo en unos instantes.',
    retry: 'Reintentar',
  },
};

function AppErrorFallback({ resetErrorBoundary }: FallbackProps) {
  const copy = ERROR_COPY[languageStore.getLanguage()];

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.body}>{copy.body}</Text>
      <Pressable
        style={styles.retryButton}
        onPress={resetErrorBoundary}
        accessibilityRole="button"
        accessibilityLabel={copy.retry}
      >
        <Text style={styles.retryText}>{copy.retry}</Text>
      </Pressable>
    </View>
  );
}

export function AppErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary FallbackComponent={AppErrorFallback}>{children}</ErrorBoundary>;
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
