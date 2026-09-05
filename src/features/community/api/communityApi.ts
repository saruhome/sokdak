/**
 * 커뮤니티 게시글/댓글 실데이터 접근 계층 — Supabase `posts`/`comments`/`post_likes` 테이블.
 * mockPosts.ts의 Post/Comment 타입과 최대한 비슷한 모양으로 매핑해 화면 쪽 변경을 최소화한다.
 */
import { supabase } from '../../../shared/api/supabaseClient';
import { authStore } from '../../../../constants/authStore';
import { languageStore } from '../../../shared/i18n/languageStore';
import { isProfileAvatarPath, profileAvatarPublicUrl } from '../../../../constants/profileAvatarStorage';
import type { PostBoard } from '../model/boards';

/** 차단한 유저의 글은 목록에서 뺀다 — 모든 목록 조회가 이 한 곳을 거치게 해서 한 번만 처리 */
function excludeBlocked(posts: CommunityPostSummary[]): CommunityPostSummary[] {
  const blocked = new Set(authStore.getBlockedUserIds());
  return blocked.size === 0 ? posts : posts.filter(p => !blocked.has(p.authorId));
}

/** 차단한 유저의 댓글(과 그 대댓글)도 같은 방식으로 뺀다 */
function excludeBlockedComments(comments: CommunityComment[]): CommunityComment[] {
  const blocked = new Set(authStore.getBlockedUserIds());
  if (blocked.size === 0) return comments;
  return comments
    .filter(c => !blocked.has(c.authorId))
    .map(c => ({ ...c, replies: c.replies?.filter(r => !blocked.has(r.authorId)) }));
}

export type CommunityAuthor = { name: string; emoji: string; avatarUrl?: string | null; level: string };

export type CommunityComment = {
  id: string;
  authorId: string;
  author: CommunityAuthor;
  content: string;
  createdAt: string;
  likes: number;
  replies?: CommunityComment[];
};

export type CommunityPostSummary = {
  id: string;
  authorId: string;
  board: PostBoard;
  title: string;
  content: string;
  author: CommunityAuthor;
  createdAt: string;
  views: number;
  likes: number;
  commentCount: number;
};

export type CommunityPostDetail = CommunityPostSummary & { comments: CommunityComment[] };
/** hasMore/nextOffset은 항상 서버가 실제로 반환한 원본 행 기준이다 — 차단된 작성자의 글을
 * 걸러낸 posts.length는 이 값들과 다를 수 있으므로, 다음 페이지 요청은 반드시 nextOffset을
 * 그대로 offset에 넘겨야 한다(posts.length를 쓰면 이미 조회한 행을 다시 요청하게 된다). */
export type CommunityPostPage = { posts: CommunityPostSummary[]; hasMore: boolean; nextOffset: number; failed?: boolean };
export const COMMUNITY_POST_PAGE_SIZE = 20;

type ProfileRow = { nickname: string; avatar_emoji: string; avatar_url?: string | null; level: string } | null;

/** 프로필 사진은 public 버킷 공개 URL로 변환해 커뮤니티에도 자동 반영한다(운영자 지시). */
export function toCommunityAuthor(profile: ProfileRow): CommunityAuthor {
  const avatarUrl = profile?.avatar_url ?? null;
  return {
    name: profile?.nickname ?? languageStore.t('deletedUser'),
    emoji: profile?.avatar_emoji ?? '👤',
    avatarUrl: isProfileAvatarPath(avatarUrl) ? profileAvatarPublicUrl(avatarUrl) : avatarUrl,
    level: profile?.level ?? '초급',
  };
}

/** 게시글/댓글 시각 — 7일 이내는 접속 언어 기준 상대시간("3분 전"/"vor 3 Minuten"),
 * 그 이후는 로컬 날짜. 기기 시계로 계산하므로 유저 시간대 변환이 자동으로 맞는다.
 * ponytail: fetch 시점에 문자열로 굳는다(화면을 오래 켜두거나 언어를 바꿔도 갱신 안 됨) —
 * 모든 목록이 focus마다 재조회하므로 충분, 실시간 갱신이 필요해지면 렌더 시점 포맷으로 이동. */
export function formatPostDate(iso: string, now = Date.now()): string {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return iso.slice(0, 10);
  const language = languageStore.getLanguage();
  const diffSec = Math.max(0, (now - time) / 1000);
  try {
    if (diffSec >= 7 * 86400) {
      return new Date(time).toLocaleDateString(language, { year: 'numeric', month: 'short', day: 'numeric' });
    }
    const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });
    if (diffSec < 60) return rtf.format(-Math.floor(diffSec), 'second');
    if (diffSec < 3600) return rtf.format(-Math.floor(diffSec / 60), 'minute');
    if (diffSec < 86400) return rtf.format(-Math.floor(diffSec / 3600), 'hour');
    return rtf.format(-Math.floor(diffSec / 86400), 'day');
  } catch {
    return iso.slice(0, 10); // Intl 미지원 런타임 폴백 — 기존 표기(YYYY-MM-DD) 유지
  }
}

/* profiles!posts_author_id_fkey — posts→profiles 경로가 direct FK와 post_likes 경유 두 가지라
 * PostgREST가 어느 쪽인지 못 정하고 에러(PGRST201)를 내서 fetchPosts가 항상 빈 배열을 반환했다.
 * FK 이름으로 명시해 direct FK 쪽으로 고정. */
const POST_SUMMARY_SELECT =
  'id, author_id, board, title, content, view_count, created_at, profiles!posts_author_id_fkey(nickname, avatar_emoji, avatar_url, level), post_likes(count), comments(count)';

function mapPostSummaryRow(row: any): CommunityPostSummary {
  return {
    id: row.id,
    authorId: row.author_id,
    board: row.board as PostBoard,
    title: row.title,
    content: row.content,
    author: toCommunityAuthor(row.profiles as ProfileRow),
    createdAt: formatPostDate(row.created_at),
    views: row.view_count,
    likes: (row.post_likes as { count: number }[])[0]?.count ?? 0,
    commentCount: (row.comments as { count: number }[])[0]?.count ?? 0,
  };
}

/** 공지 핀 — 운영자가 Supabase Studio(service_role)에서 is_pinned를 켠 글.
 * 관리자 화면은 의도적으로 없다. 커뮤니티 탭 최상단(화제의 글 위)에 노출되며,
 * 아래 목록 쿼리들은 핀 글을 제외해 같은 화면에 두 번 보이지 않는다.
 * ponytail: 핀은 한 번에 1개(최신 우선) — 공지가 여러 개 필요해지면 limit 해제 */
export async function fetchPinnedPost(): Promise<CommunityPostSummary | null> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SUMMARY_SELECT)
    .eq('is_pinned', true)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error || !data?.[0]) return null;
  return mapPostSummaryRow(data[0]);
}

/** 커뮤니티 목록 (게시판 필터 옵션) — 조회수/좋아요/댓글수 집계 포함 */
export async function fetchPosts(board?: PostBoard): Promise<CommunityPostSummary[]> {
  let query = supabase
    .from('posts')
    .select(POST_SUMMARY_SELECT)
    .eq('is_pinned', false)
    .order('created_at', { ascending: false });
  if (board) query = query.eq('board', board);

  const { data, error } = await query;
  if (error || !data) return [];
  return excludeBlocked(data.map(mapPostSummaryRow));
}

/** 커뮤니티 목록을 서버에서 페이지 단위로 조회한다. 추가 요청 여부를 판별하기 위해 한 행을 더 가져온다. */
export async function fetchPostsPage({
  board,
  offset = 0,
  limit = COMMUNITY_POST_PAGE_SIZE,
}: {
  board?: PostBoard;
  offset?: number;
  limit?: number;
} = {}): Promise<CommunityPostPage> {
  const safeOffset = Math.max(0, Math.floor(offset));
  const safeLimit = Math.max(1, Math.min(50, Math.floor(limit)));
  let query = supabase
    .from('posts')
    .select(POST_SUMMARY_SELECT)
    .eq('is_pinned', false)
    .order('created_at', { ascending: false })
    .range(safeOffset, safeOffset + safeLimit);
  if (board) query = query.eq('board', board);

  const { data, error } = await query;
  /* 화면이 '빈 목록'과 '불러오기 실패'를 구분해 재시도 CTA를 띄울 수 있게 실패를 표시한다 */
  if (error || !data) return { posts: [], hasMore: false, nextOffset: safeOffset, failed: true };

  const rawConsumed = Math.min(data.length, safeLimit);
  return {
    posts: excludeBlocked(data.slice(0, safeLimit).map(mapPostSummaryRow)),
    hasMore: data.length > safeLimit,
    // 원본 행 기준 offset — 차단 필터로 줄어든 posts.length가 아니라 실제로 조회를 마친
    // 행 수만큼 전진시켜야 다음 페이지가 이미 본 행을 다시 요청하지 않는다.
    nextOffset: safeOffset + rawConsumed,
  };
}

/** 특정 id 목록의 게시글들 (예: 저장/좋아요 한 게시글) — 요청한 순서를 보존해 반환 */
export async function fetchPostsByIds(ids: string[]): Promise<CommunityPostSummary[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from('posts').select(POST_SUMMARY_SELECT).in('id', ids);
  if (error || !data) return [];
  const byId = new Map(data.map(row => [row.id, mapPostSummaryRow(row)]));
  const ordered = ids.map(id => byId.get(id)).filter((p): p is CommunityPostSummary => !!p);
  return excludeBlocked(ordered);
}

/** 내가 작성한 게시글 */
export async function fetchMyPosts(): Promise<CommunityPostSummary[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SUMMARY_SELECT)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map(mapPostSummaryRow);
}

/** 내가 댓글을 단 게시글 (중복 게시글 제거) */
export async function fetchPostsCommentedByMe(): Promise<CommunityPostSummary[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: myComments } = await supabase
    .from('comments')
    .select('post_id, created_at')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });
  if (!myComments || myComments.length === 0) return [];
  const postIds = [...new Set(myComments.map(c => c.post_id))];
  return fetchPostsByIds(postIds);
}

/** 게시글 상세 + 댓글(대댓글 1단계 포함) */
export async function fetchPost(id: string): Promise<CommunityPostDetail | null> {
  const [{ data: post, error: postError }, { data: comments }] = await Promise.all([
    supabase
      .from('posts')
      .select('id, author_id, board, title, content, view_count, created_at, profiles!posts_author_id_fkey(nickname, avatar_emoji, avatar_url, level), post_likes(count)')
      .eq('id', id)
      .single(),
    supabase
      .from('comments')
      .select('id, author_id, content, created_at, parent_comment_id, profiles!comments_author_id_fkey(nickname, avatar_emoji, avatar_url, level), comment_likes(count)')
      .eq('post_id', id)
      .order('created_at', { ascending: true }),
  ]);

  if (postError || !post) return null;

  const rows = comments ?? [];
  const byId = new Map<string, CommunityComment>();
  rows.forEach(r => byId.set(r.id, {
    id: r.id,
    authorId: r.author_id,
    author: toCommunityAuthor(r.profiles as ProfileRow),
    content: r.content,
    createdAt: formatPostDate(r.created_at),
    likes: (r.comment_likes as { count: number }[])[0]?.count ?? 0,
    replies: [],
  }));
  const topLevel: CommunityComment[] = [];
  rows.forEach(r => {
    const node = byId.get(r.id)!;
    if (r.parent_comment_id && byId.has(r.parent_comment_id)) {
      byId.get(r.parent_comment_id)!.replies!.push(node);
    } else {
      topLevel.push(node);
    }
  });

  // 조회수 +1 (백그라운드, 실패해도 화면엔 영향 없음)
  supabase.from('posts').update({ view_count: post.view_count + 1 }).eq('id', id).then(() => {});

  return {
    id: post.id,
    authorId: post.author_id,
    board: post.board as PostBoard,
    title: post.title,
    content: post.content,
    author: toCommunityAuthor(post.profiles as ProfileRow),
    createdAt: formatPostDate(post.created_at),
    views: post.view_count + 1,
    likes: (post.post_likes as { count: number }[])[0]?.count ?? 0,
    commentCount: rows.length,
    comments: excludeBlockedComments(topLevel),
  };
}

export async function createPost(params: { board: PostBoard; title: string; content: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: '로그인이 필요해요.' };

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      board: params.board,
      title: params.title,
      content: params.content,
      created_at: now,
      view_count: 0,
    })
    .select('id')
    .single();

  return { data, error: error?.message ?? null };
}

/** 게시글 수정 — RLS(authors can update their own posts)가 작성자 본인만 허용 */
export async function updatePost(id: string, params: { board: PostBoard; title: string; content: string }) {
  const { error } = await supabase
    .from('posts')
    .update({ board: params.board, title: params.title, content: params.content })
    .eq('id', id);
  return { error: error?.message ?? null };
}

/** 게시글 삭제 — RLS(authors can delete their own posts)가 작성자 본인만 허용 */
export async function deletePost(id: string) {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  return { error: error?.message ?? null };
}

/** 게시글 신고 — 신고자/사유/신고당한 유저를 reports 테이블에 남긴다. 운영팀은 Supabase 대시보드에서 확인 */
export async function reportPost(params: { postId: string; reportedUserId: string; reason: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요해요.' };

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    reported_user_id: params.reportedUserId,
    post_id: params.postId,
    reason: params.reason,
  });
  return { error: error?.message ?? null };
}

const MAX_POST_IMAGE_BYTES = 5 * 1024 * 1024;
const POST_IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/** 글쓰기용 사진 첨부 — 서버 Storage 제한과 동일하게 형식·용량을 검사한 뒤 공개 버킷에 업로드한다. */
export async function uploadPostImage(uri: string): Promise<{ url: string | null; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { url: null, error: '로그인이 필요해요.' };

  const response = await fetch(uri);
  const blob = await response.blob();
  const contentType = blob.type.toLowerCase();
  const ext = POST_IMAGE_EXTENSIONS[contentType];
  if (!ext) return { url: null, error: 'JPEG, PNG 또는 WebP 이미지만 첨부할 수 있어요.' };
  if (blob.size > MAX_POST_IMAGE_BYTES) {
    return { url: null, error: '이미지 파일은 5MB 이하만 첨부할 수 있어요.' };
  }
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from('post-images').upload(path, blob, {
    contentType,
  });
  if (error) return { url: null, error: error.message };

  const { data } = supabase.storage.from('post-images').getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

export async function createComment(params: { postId: string; content: string; parentCommentId?: string | null }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요해요.' };

  const { error } = await supabase.from('comments').insert({
    post_id: params.postId,
    author_id: user.id,
    content: params.content,
    parent_comment_id: params.parentCommentId ?? null,
  });
  return { error: error?.message ?? null };
}

/** 댓글 수정 — RLS(authors can update their own comments)가 작성자 본인만 허용 */
export async function updateComment(id: string, content: string) {
  const { error } = await supabase.from('comments').update({ content }).eq('id', id);
  return { error: error?.message ?? null };
}

/** 댓글 삭제 — RLS(authors can delete their own comments)가 작성자 본인만 허용 */
export async function deleteComment(id: string) {
  const { error } = await supabase.from('comments').delete().eq('id', id);
  return { error: error?.message ?? null };
}

/** 댓글 신고 — 게시글 신고와 같은 reports 테이블, comment_id로 구분 */
export async function reportComment(params: { commentId: string; postId: string; reportedUserId: string; reason: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요해요.' };

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    reported_user_id: params.reportedUserId,
    post_id: params.postId,
    comment_id: params.commentId,
    reason: params.reason,
  });
  return { error: error?.message ?? null };
}
