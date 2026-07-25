/**
 * 커뮤니티 게시글/댓글 실데이터 접근 계층 — Supabase `posts`/`comments`/`post_likes` 테이블.
 * mockPosts.ts의 Post/Comment 타입과 최대한 비슷한 모양으로 매핑해 화면 쪽 변경을 최소화한다.
 */
import { supabase } from './supabase';
import type { PostBoard } from './mockPosts';

export type CommunityAuthor = { name: string; emoji: string; level: string };

export type CommunityComment = {
  id: string;
  author: CommunityAuthor;
  content: string;
  createdAt: string;
  replies?: CommunityComment[];
};

export type CommunityPostSummary = {
  id: string;
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

type ProfileRow = { nickname: string; avatar_emoji: string; level: string } | null;

function toAuthor(profile: ProfileRow): CommunityAuthor {
  return { name: profile?.nickname ?? '탈퇴한 사용자', emoji: profile?.avatar_emoji ?? '👤', level: profile?.level ?? '초급' };
}

function toDate(iso: string) {
  return iso.slice(0, 10);
}

const POST_SUMMARY_SELECT =
  'id, board, title, content, view_count, created_at, profiles(nickname, avatar_emoji, level), post_likes(count), comments(count)';

function mapPostSummaryRow(row: any): CommunityPostSummary {
  return {
    id: row.id,
    board: row.board as PostBoard,
    title: row.title,
    content: row.content,
    author: toAuthor(row.profiles as ProfileRow),
    createdAt: toDate(row.created_at),
    views: row.view_count,
    likes: (row.post_likes as { count: number }[])[0]?.count ?? 0,
    commentCount: (row.comments as { count: number }[])[0]?.count ?? 0,
  };
}

/** 커뮤니티 목록 (게시판 필터 옵션) — 조회수/좋아요/댓글수 집계 포함 */
export async function fetchPosts(board?: PostBoard): Promise<CommunityPostSummary[]> {
  let query = supabase
    .from('posts')
    .select(POST_SUMMARY_SELECT)
    .order('created_at', { ascending: false });
  if (board) query = query.eq('board', board);

  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapPostSummaryRow);
}

/** 특정 id 목록의 게시글들 (예: 저장/좋아요 한 게시글) — 요청한 순서를 보존해 반환 */
export async function fetchPostsByIds(ids: string[]): Promise<CommunityPostSummary[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from('posts').select(POST_SUMMARY_SELECT).in('id', ids);
  if (error || !data) return [];
  const byId = new Map(data.map(row => [row.id, mapPostSummaryRow(row)]));
  return ids.map(id => byId.get(id)).filter((p): p is CommunityPostSummary => !!p);
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
      .select('id, board, title, content, view_count, created_at, profiles(nickname, avatar_emoji, level), post_likes(count)')
      .eq('id', id)
      .single(),
    supabase
      .from('comments')
      .select('id, content, created_at, parent_comment_id, profiles(nickname, avatar_emoji, level)')
      .eq('post_id', id)
      .order('created_at', { ascending: true }),
  ]);

  if (postError || !post) return null;

  const rows = comments ?? [];
  const byId = new Map<string, CommunityComment>();
  rows.forEach(r => byId.set(r.id, {
    id: r.id,
    author: toAuthor(r.profiles as ProfileRow),
    content: r.content,
    createdAt: toDate(r.created_at),
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
    board: post.board as PostBoard,
    title: post.title,
    content: post.content,
    author: toAuthor(post.profiles as ProfileRow),
    createdAt: toDate(post.created_at),
    views: post.view_count + 1,
    likes: (post.post_likes as { count: number }[])[0]?.count ?? 0,
    commentCount: rows.length,
    comments: topLevel,
  };
}

export async function createPost(params: { board: PostBoard; title: string; content: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: '로그인이 필요해요.' };

  const { data, error } = await supabase
    .from('posts')
    .insert({ author_id: user.id, board: params.board, title: params.title, content: params.content })
    .select('id')
    .single();

  return { data, error: error?.message ?? null };
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
