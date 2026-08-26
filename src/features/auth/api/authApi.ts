/**
 * Auth 관련 Supabase 호출만 모은 stateless API 계층 — auth migration 1단계.
 * 상태(현재 유저, 리스너)는 전혀 없고, 모든 함수는 호출 → 결과 반환뿐이다.
 * 상태 관리는 model/sessionStore.ts(2단계)와 constants/authStore.ts(잔여 orchestration)가 담당.
 */
import * as Linking from 'expo-linking';
import { supabase } from '../../../shared/api/supabaseClient';

/** 이메일 인증·비밀번호 재설정 링크가 돌아올 주소.
 *  네이티브는 앱 스킴(sokdak://), 웹은 현재 오리진으로 자동 해석된다.
 *  Supabase 대시보드 Authentication > URL Configuration의 Redirect URLs에도 등록돼 있어야 한다. */
const AUTH_REDIRECT_URL = Linking.createURL('/auth/callback');

export const authApi = {
  /** 회원가입 — profiles row는 DB 트리거(handle_new_user)가 자동 생성.
   * "Confirm email" 설정이 켜져 있으면 session이 바로 오지 않는다 → needsEmailConfirmation. */
  async signUp({ email, password, nickname }: { email: string; password: string; nickname: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname, avatar_emoji: '🐦' },
        emailRedirectTo: AUTH_REDIRECT_URL,
      },
    });
    return {
      error: error?.message ?? null,
      needsEmailConfirmation: !error && !data.session,
    };
  },

  async signIn({ email, password }: { email: string; password: string }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /** 딥링크 fragment에서 꺼낸 토큰으로 세션을 넘겨받는다 (detectSessionInUrl: false 환경). */
  async setSessionFromTokens(tokens: { access_token: string; refresh_token: string }) {
    await supabase.auth.setSession(tokens);
  },

  async requestPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: AUTH_REDIRECT_URL });
    return { error: error?.message ?? null };
  },

  /** 이메일 변경 — Supabase가 새 주소로 확인 메일을 보내고, 확인 후에 실제로 바뀐다. */
  async updateEmail(email: string) {
    const { error } = await supabase.auth.updateUser({ email });
    return { error: error?.message ?? null };
  },

  /** 비밀번호 변경 — 재로그인 없이 현재 세션으로 바로 변경된다. */
  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  },

  /** 회원탈퇴 Edge Function 호출 — 서버가 Bearer 토큰을 검증하고 서비스 역할로 정리한다. */
  async invokeDeleteAccount() {
    const { data, error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
    if (error) return { error: error.message };
    if (!data?.deleted) return { error: '회원탈퇴 처리 결과를 확인할 수 없어요.' };
    return { error: null };
  },
};
