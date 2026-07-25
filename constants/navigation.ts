import { router } from 'expo-router';

/**
 * router.back()을 히스토리가 없는 상태(딥링크로 직접 진입, 새로고침 등)에서 호출하면
 * "The action 'GO_BACK' was not handled by any navigator" 에러가 발생한다.
 * canGoBack()으로 가드하고, 갈 곳이 없으면 안전한 기본 화면(홈)으로 이동한다.
 */
export function safeGoBack(fallback: string = '/tabs') {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback as Parameters<typeof router.replace>[0]);
  }
}
