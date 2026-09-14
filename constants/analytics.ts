import { usePathname } from 'expo-router';
import { useEffect } from 'react';
import PostHog from 'posthog-react-native';
import { authStore } from '@/constants/authStore';

/**
 * 제품 분석 — PostHog. 키가 없으면 client가 null이라 전부 no-op(CI·로컬 기본).
 * 토큰은 클라이언트 공개값(phc_…)이지만 이벤트 소유권 때문에 env로만 주입한다.
 * 개인정보: 이메일·이름은 보내지 않고 Supabase user id로만 identify 한다.
 */
const key = process.env.EXPO_PUBLIC_POSTHOG_KEY?.trim();
export const posthog: PostHog | null = key
  ? new PostHog(key, {
      host: process.env.EXPO_PUBLIC_POSTHOG_HOST?.trim() || 'https://us.i.posthog.com',
      captureAppLifecycleEvents: true,
    })
  : null;

/** 루트 레이아웃에서 한 번만 호출 — 라우트 변경마다 $screen, 로그인/로그아웃마다 identify/reset. */
export function useAnalytics() {
  const pathname = usePathname();
  useEffect(() => { posthog?.screen(pathname); }, [pathname]);
  useEffect(() => {
    if (!posthog) return;
    const sync = () => {
      const user = authStore.getUser();
      if (user) posthog!.identify(user.id);
      else posthog!.reset();
    };
    sync();
    return authStore.subscribe(sync);
  }, []);
}

export const track = (event: string, props?: Parameters<PostHog['capture']>[1]) => posthog?.capture(event, props);
