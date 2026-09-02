import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { languageStore, type Language } from '@/constants/languageStore';
import { setAppErrorReporter, type AppErrorPayload } from '@/constants/errorReporting';

let shouldThrow = true;

function RecoverableChild() {
  if (shouldThrow) throw new Error('test render failure');
  return <Text>Recovered content</Text>;
}

const ERROR_COPY: Record<Language, { title: string; body: string; retry: string }> = {
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
  de: {
    title: 'Dieser Bildschirm konnte nicht geladen werden',
    body: 'Bitte versuche es gleich noch einmal.',
    retry: 'Erneut versuchen',
  },
  tr: {
    title: 'Bu ekran yüklenemedi',
    body: 'Lütfen birazdan tekrar dene.',
    retry: 'Tekrar dene',
  },
};

describe('<AppErrorBoundary />', () => {
  beforeEach(() => {
    shouldThrow = true;
    languageStore.setLanguage('ko');
    setAppErrorReporter(null);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    setAppErrorReporter(null);
    jest.restoreAllMocks();
  });

  it.each(Object.entries(ERROR_COPY) as [Language, (typeof ERROR_COPY)[Language]][])(
    'shows %s fallback copy and retries successfully',
    async (language, copy) => {
      languageStore.setLanguage(language);
      const screen = await render(
        <AppErrorBoundary route="/tabs/dictionary">
          <RecoverableChild />
        </AppErrorBoundary>,
      );

      await waitFor(() => expect(screen.getByText(copy.title)).toBeTruthy());
      expect(screen.getByText(copy.body)).toBeTruthy();
      expect(screen.getByLabelText(copy.retry)).toBeTruthy();

      shouldThrow = false;
      fireEvent.press(screen.getByLabelText(copy.retry));

      await waitFor(() => expect(screen.getByText('Recovered content')).toBeTruthy());
    },
  );

  it('updates an already visible fallback after the locale changes', async () => {
    const screen = await render(
      <AppErrorBoundary>
        <RecoverableChild />
      </AppErrorBoundary>,
    );

    await waitFor(() => expect(screen.getByText(ERROR_COPY.ko.title)).toBeTruthy());
    languageStore.setLanguage('es');

    await waitFor(() => expect(screen.getByText(ERROR_COPY.es.title)).toBeTruthy());
    expect(screen.getByLabelText(ERROR_COPY.es.retry)).toBeTruthy();
  });

  it('reports a render error with its route, locale and source', async () => {
    const reports: AppErrorPayload[] = [];
    languageStore.setLanguage('vi');
    setAppErrorReporter(payload => reports.push(payload));

    await render(
      <AppErrorBoundary route="/tabs/dictionary/31">
        <RecoverableChild />
      </AppErrorBoundary>,
    );

    await waitFor(() => expect(reports).toHaveLength(1));
    expect(reports[0]).toMatchObject({
      source: 'render_boundary',
      route: '/tabs/dictionary/31',
      locale: 'vi',
      errorName: 'Error',
      errorMessage: 'test render failure',
    });
  });
});
