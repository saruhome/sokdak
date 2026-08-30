import { router } from 'expo-router';
import { Platform } from 'react-native';

/**
 * 뒤로가기 = "유저가 직전에 본 화면"으로 (운영자 규칙).
 *
 * 웹: router.back()은 중첩 스택 안에서의 pop이라, 홈에서 다른 탭의 서브 화면
 * (예: /tabs/mypage/premium)으로 push해 들어온 경우 홈이 아니라 그 탭의 루트
 * (마이페이지)로 떨어진다. 브라우저 히스토리가 곧 "직전에 본 화면"이므로
 * 히스토리가 있으면 그걸 쓴다. 히스토리가 없는 직접 진입(새 탭·새로고침)은
 * 화면별 fallback(자연스러운 부모)으로 이동한다.
 *
 * 네이티브: 히스토리 개념이 없으므로 기존 canGoBack 가드 유지.
 */
export function safeGoBack(fallback: string = '/tabs') {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.history.length > 1) {
    window.history.back();
    return;
  }
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback as Parameters<typeof router.replace>[0]);
  }
}
