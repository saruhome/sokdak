/**
 * 북마크/차단 캐시 도메인 — bookmarks feature 분리.
 * 저장한 단어·게시글, 좋아요 한 게시글·댓글·카테고리, 차단한 유저의 메모리 캐시(Set)를
 * 소유한다. 실제 소스는 각 조인 테이블(saved_words/saved_posts/post_likes/comment_likes/
 * liked_categories/blocked_users)이고, 토글은 화면 컨벤션상 await 없이 호출되므로
 * 낙관적 갱신 → 구독자 즉시 알림 → 백그라운드 DB 반영(실패 시 롤백 + 재알림)한다.
 * 차단 목록은 auth가 아니라 이 도메인 소속 — 같은 리스너 채널·낙관적 갱신 패턴을 공유한다.
 */
import { supabase } from '../../../shared/api/supabaseClient';
import { sessionStore } from '../../auth/model/sessionStore';

type BookmarkListener = () => void;

const _savedWordIds = new Set<string>();
const _savedPostIds = new Set<string>();
const _likedPostIds = new Set<string>();
/** 좋아요 한 댓글 — 로그인 계정에만 의미가 있어 로그인 시에만 채운다 */
const _likedCommentIds = new Set<string>();
/** 좋아요 한 카테고리 — liked_categories 테이블에 영속화 */
const _likedCategorySlugs = new Set<string>();
/** 차단한 유저 — 로그인 계정에만 의미가 있어 로그인 시에만 채운다 */
const _blockedUserIds = new Set<string>();
const _listeners = new Set<BookmarkListener>();

function notify() {
  _listeners.forEach(fn => fn());
}

type BookmarkTable = 'saved_words' | 'saved_posts' | 'post_likes' | 'comment_likes' | 'liked_categories';

/** id 하나를 (user_id, <idColumn>) 조인 테이블에 낙관적으로 insert/delete하는 공용 토글.
 * requireLogin이 true면 비로그인일 때 로컬 Set도 건드리지 않고 그냥 no-op(단어 저장 전용). */
function toggle(set: Set<string>, id: string, table: BookmarkTable, idColumn: string, requireLogin: boolean) {
  const user = sessionStore.getUser();
  if (requireLogin && !user) return;

  const was = set.has(id);
  if (was) set.delete(id); else set.add(id);
  notify();

  if (!user) return;
  const userId = user.id;

  // ponytail: 테이블/컬럼이 런타임 문자열이라 Supabase의 리터럴 유니언 타입과 안 맞음 — any로 우회.
  // supabase gen types로 Database 타입을 도입하는 시점에 제네릭 오버로드로 교체.
  const write = was
    ? supabase.from(table as any).delete().eq('user_id', userId).eq(idColumn, id)
    : supabase.from(table as any).insert({ user_id: userId, [idColumn]: id });

  write.then(({ error }: { error: unknown }) => {
    if (!error) return;
    if (was) set.add(id); else set.delete(id);
    notify();
  });
}

export const bookmarkStore = {
  /** 로그인/세션 복원 시 전체 북마크·차단 캐시를 DB에서 채운다. notify는 호출부(applySession)가
   * 프로필·TTS 로드까지 끝난 뒤 한 번에 한다 — 기존 알림 타이밍 보존. */
  async loadForUser(userId: string) {
    const [savedRes, likedRes, savedPostsRes, likedCommentsRes, likedCategoriesRes, blockedRes] = await Promise.all([
      supabase.from('saved_words').select('word_id').eq('user_id', userId),
      supabase.from('post_likes').select('post_id').eq('user_id', userId),
      supabase.from('saved_posts').select('post_id').eq('user_id', userId),
      supabase.from('comment_likes').select('comment_id').eq('user_id', userId),
      supabase.from('liked_categories').select('category_slug').eq('user_id', userId),
      supabase.from('blocked_users').select('blocked_id').eq('blocker_id', userId),
    ]);

    _savedWordIds.clear();
    savedRes.data?.forEach(row => _savedWordIds.add(row.word_id));
    _likedPostIds.clear();
    likedRes.data?.forEach(row => _likedPostIds.add(row.post_id));
    _savedPostIds.clear();
    savedPostsRes.data?.forEach(row => _savedPostIds.add(row.post_id));
    _likedCommentIds.clear();
    likedCommentsRes.data?.forEach(row => _likedCommentIds.add(row.comment_id));
    _likedCategorySlugs.clear();
    likedCategoriesRes.data?.forEach((row: { category_slug: string }) => _likedCategorySlugs.add(row.category_slug));
    _blockedUserIds.clear();
    blockedRes.data?.forEach(row => _blockedUserIds.add(row.blocked_id));
  },

  clearAll() {
    _savedWordIds.clear();
    _savedPostIds.clear();
    _likedPostIds.clear();
    _likedCommentIds.clear();
    _likedCategorySlugs.clear();
    _blockedUserIds.clear();
  },

  notify,

  subscribe(fn: BookmarkListener) {
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  },

  /* ── 저장한 단어 (로그인 전용 — 화면에서 isLoggedIn() 확인 후 호출할 것) ── */
  isWordSaved: (id: string) => _savedWordIds.has(id),
  toggleWordSaved(id: string) { toggle(_savedWordIds, id, 'saved_words', 'word_id', true); },
  getSavedWordIds: () => Array.from(_savedWordIds),
  getSavedWordCount: () => _savedWordIds.size,

  /* ── 저장한 게시글 ── */
  isPostSaved: (id: string) => _savedPostIds.has(id),
  togglePostSaved(id: string) { toggle(_savedPostIds, id, 'saved_posts', 'post_id', false); },
  getSavedPostIds: () => Array.from(_savedPostIds),

  /* ── 좋아요 한 게시글 ── */
  isPostLiked: (id: string) => _likedPostIds.has(id),
  togglePostLiked(id: string) { toggle(_likedPostIds, id, 'post_likes', 'post_id', false); },
  getLikedPostIds: () => Array.from(_likedPostIds),

  /* ── 좋아요 한 댓글 ── */
  isCommentLiked: (id: string) => _likedCommentIds.has(id),
  toggleCommentLiked(id: string) { toggle(_likedCommentIds, id, 'comment_likes', 'comment_id', false); },

  /* ── 좋아요 한 카테고리 — liked_categories 테이블에 영속화(마이페이지가 즐겨찾기로 보여주므로) ── */
  isCategoryLiked: (slug: string) => _likedCategorySlugs.has(slug),
  toggleCategoryLiked(slug: string) { toggle(_likedCategorySlugs, slug, 'liked_categories', 'category_slug', true); },
  getLikedCategorySlugs: () => Array.from(_likedCategorySlugs),
  getLikedCategoryCount: () => _likedCategorySlugs.size,

  /* ── 차단한 유저 — 차단하면 그 유저 글이 목록에서 안 보인다(constants/community.ts에서 필터링) ── */
  isUserBlocked: (userId: string) => _blockedUserIds.has(userId),
  async blockUser(userId: string) {
    const user = sessionStore.getUser();
    if (!user) return { error: '로그인이 필요해요.' };
    _blockedUserIds.add(userId);
    notify();
    const { error } = await supabase.from('blocked_users').insert({ blocker_id: user.id, blocked_id: userId });
    if (error) { _blockedUserIds.delete(userId); notify(); return { error: error.message }; }
    return { error: null };
  },
  getBlockedUserIds: () => Array.from(_blockedUserIds),
};
