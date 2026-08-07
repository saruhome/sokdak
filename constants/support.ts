/** 고객센터 문의 실데이터 접근 계층 — Supabase `support_tickets` 테이블.
 * 답변 작성은 클라이언트가 아니라 운영진이 Supabase Studio에서 직접 입력한다
 * (client는 select/insert 정책만 있고 update 정책이 없음 — 실수로도 답변을 조작 못 함). */
import { supabase } from './supabase';

export type SupportTicket = {
  id: string;
  message: string;
  status: 'open' | 'answered';
  reply: string | null;
  createdAt: string;
  repliedAt: string | null;
};

export async function fetchMyTickets(): Promise<SupportTicket[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('support_tickets')
    .select('id, message, status, reply, created_at, replied_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error || !data) return [];

  return data.map(t => ({
    id: t.id,
    message: t.message,
    status: t.status as 'open' | 'answered',
    reply: t.reply,
    createdAt: t.created_at,
    repliedAt: t.replied_at,
  }));
}

export async function submitTicket(message: string): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요해요.' };

  const { error } = await supabase.from('support_tickets').insert({ user_id: user.id, message });
  return { error: error?.message ?? null };
}
