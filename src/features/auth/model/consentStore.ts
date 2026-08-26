/**
 * 커뮤니티 정책 동의 도메인 — auth migration 5단계.
 * 동의 여부 판정과 기록은 전부 서버 RPC가 소스다(클라이언트 캐시 없음 — 정책 개정 후
 * stale 캐시로 권한 판단하는 사고를 원천 차단). 이 스토어는 로그인 확인 + RPC 호출만 한다.
 *
 * 차단 목록은 계획과 달리 여기로 옮기지 않았다: 북마크 캐시와 같은 리스너 채널
 * (subscribeBookmarks)·낙관적 갱신 패턴을 공유하므로, 추후 북마크 feature와 함께 이동한다.
 */
import { supabase } from '../../../shared/api/supabaseClient';
import type { Language } from '../../../shared/i18n/keys';
import { sessionStore } from './sessionStore';

export type ConsentSource =
  | 'community_onboarding'
  | 'post_gate'
  | 'comment_gate'
  | 'policy_update'
  | 'account_settings';

export const consentStore = {
  /**
   * 커뮤니티 게시 전, 서버가 판정한 최신 활성 정책 버전에 동의했는지 확인한다.
   * 단순 timestamp 캐시는 정책 개정 후에도 남을 수 있으므로 권한 판단에 사용하지 않는다.
   */
  async hasAcceptedCommunityGuidelines() {
    if (!sessionStore.getUser()) return false;
    const { data, error } = await supabase.rpc('has_accepted_current_community_policy');
    return !error && data === true;
  },

  /**
   * 정책 화면에서 사용자가 명시적으로 동의하면 서버 RPC가 정책 버전·언어·원문
   * 해시·서버 시각을 append-only 동의 이력에 기록한다. 현재 UI 언어는 정책
   * 전문을 표시한 언어와 같아야 하므로 호출 화면이 locale을 명시적으로 넘긴다.
   */
  async acceptCommunityGuidelines({
    locale,
    source = 'community_onboarding',
    appVersion,
    platform,
  }: {
    locale: Language;
    source?: ConsentSource;
    appVersion?: string;
    platform?: 'android' | 'ios' | 'web';
  }) {
    if (!sessionStore.getUser()) return { error: '로그인이 필요해요.', consent: null };
    const { data, error } = await supabase.rpc('accept_current_community_policy', {
      p_locale: locale,
      p_source: source,
      p_app_version: appVersion ?? null,
      p_platform: platform ?? null,
    });
    return { error: error?.message ?? null, consent: data?.[0] ?? null };
  },
};
