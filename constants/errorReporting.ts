import Constants from 'expo-constants';
import { languageStore, type Language } from '@/constants/languageStore';

export type AppErrorSource =
  | 'render_boundary'
  | 'auth_initialization'
  | 'language_initialization'
  | 'network_request'
  | 'user_action';

export type AppErrorContext = {
  source: AppErrorSource;
  route: string;
  locale?: Language;
  componentStack?: string;
};

export type AppErrorPayload = AppErrorContext & {
  appVersion: string;
  errorName: string;
  errorMessage: string;
};

export type AppErrorReporter = (payload: AppErrorPayload) => void;

let externalReporter: AppErrorReporter | null = null;

/**
 * 향후 Sentry 등 중앙 오류 수집 SDK가 준비되면 앱 시작 시 reporter를 등록한다.
 * SDK가 없을 때는 프로덕션에서 원격 전송을 하지 않으며, 개발 환경에서만 진단 로그를 남긴다.
 */
export function setAppErrorReporter(reporter: AppErrorReporter | null) {
  externalReporter = reporter;
}

function toErrorSummary(error: unknown) {
  if (error instanceof Error) {
    return {
      errorName: error.name || 'Error',
      // 사용자 입력·서버 응답의 무분별한 전송을 피하기 위해 길이를 제한한다.
      errorMessage: error.message.slice(0, 500),
    };
  }

  return {
    errorName: 'UnknownError',
    errorMessage: String(error).slice(0, 500),
  };
}

/**
 * 앱 전반의 오류를 개인정보 최소화 payload로 정규화한다.
 * `source`, `route`, `locale`, `appVersion`은 베타 오류 분류에 필요한 최소 컨텍스트다.
 */
export function reportAppError(error: unknown, context: AppErrorContext): AppErrorPayload {
  const payload: AppErrorPayload = {
    ...toErrorSummary(error),
    source: context.source,
    route: context.route,
    locale: context.locale ?? languageStore.getLanguage(),
    appVersion: Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? 'unknown',
    ...(context.componentStack ? { componentStack: context.componentStack.slice(0, 2_000) } : {}),
  };

  if (externalReporter) {
    externalReporter(payload);
  }

  if (__DEV__) {
    console.error('[SokDak app error]', payload);
  }

  return payload;
}
