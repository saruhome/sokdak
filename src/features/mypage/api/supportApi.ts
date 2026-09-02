/** 고객센터 문의 실데이터 접근 계층 — Supabase `support_tickets` 테이블.
 * 답변 작성은 클라이언트가 아니라 운영진이 Supabase Studio에서 직접 입력한다
 * (client는 select/insert 정책만 있고 update 정책이 없음 — 실수로도 답변을 조작 못 함).
 * "답변 도착" 알림은 notifications 테이블(댓글/좋아요 전용, actor_id/post_id가 NOT NULL이라
 * 운영진 답변엔 안 맞음)을 재사용하지 않고, account_settings.last_seen_reply_at으로 처리 —
 * 기기 간 동기화되도록 사용자 전용 설정 테이블에 서버 저장한다. */
import { supabase } from '../../../shared/api/supabaseClient';

export type SupportTicket = {
  id: string;
  message: string;
  status: 'open' | 'answered';
  reply: string | null;
  createdAt: string;
  repliedAt: string | null;
  imagePath: string | null;
};

/** 첨부 사진 — 개인정보가 담길 수 있어 비공개 버킷 + 본인 폴더 정책 + signed URL(profile-avatars와 동일 패턴) */
const SUPPORT_ATTACHMENT_BUCKET = 'support-attachments';
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ATTACHMENT_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function createSupportAttachmentSignedUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(SUPPORT_ATTACHMENT_BUCKET).createSignedUrl(path, 60 * 60);
  return error ? null : data.signedUrl;
}

export async function fetchMyTickets(): Promise<SupportTicket[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('support_tickets')
    .select('id, message, status, reply, created_at, replied_at, image_path')
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
    imagePath: t.image_path ?? null,
  }));
}

export async function submitTicket(
  message: string,
  image?: { uri: string; mimeType?: string | null } | null,
): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요해요.' };

  let imagePath: string | null = null;
  if (image) {
    try {
      const response = await fetch(image.uri);
      const arrayBuffer = await response.arrayBuffer();
      const contentType = (image.mimeType || response.headers.get('content-type') || '').toLowerCase().split(';')[0];
      const extension = ATTACHMENT_EXTENSIONS[contentType];
      if (!extension) return { error: 'JPEG, PNG 또는 WebP 이미지만 첨부할 수 있어요.' };
      if (arrayBuffer.byteLength > MAX_ATTACHMENT_BYTES) return { error: '첨부 사진은 5MB 이하만 가능해요.' };

      imagePath = `${user.id}/${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from(SUPPORT_ATTACHMENT_BUCKET)
        .upload(imagePath, arrayBuffer, { contentType });
      if (uploadError) return { error: uploadError.message };
    } catch {
      return { error: '사진을 읽지 못했어요. 다시 시도해 주세요.' };
    }
  }

  const { error } = await supabase.from('support_tickets').insert({ user_id: user.id, message, image_path: imagePath });
  if (error && imagePath) await supabase.storage.from(SUPPORT_ATTACHMENT_BUCKET).remove([imagePath]);
  return { error: error?.message ?? null };
}

/** 마지막으로 확인한 이후 새로 도착한 답변이 있는지 — 마이페이지 배지용 */
export async function hasUnseenReply(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const tickets = await fetchMyTickets();
  const latestReply = tickets.map(t => t.repliedAt).filter((d): d is string => !!d).sort().at(-1);
  if (!latestReply) return false;

  const { data } = await supabase.from('account_settings').select('last_seen_reply_at').eq('user_id', user.id).single();
  const lastSeen = data?.last_seen_reply_at;
  return !lastSeen || latestReply > lastSeen;
}

export async function markRepliesSeen(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('account_settings').update({ last_seen_reply_at: new Date().toISOString() }).eq('user_id', user.id);
}
