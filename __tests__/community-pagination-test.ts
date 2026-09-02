const mockEq: jest.Mock = jest.fn();
const mockRange: jest.Mock = jest.fn();
const mockOrder: jest.Mock = jest.fn(() => ({ range: mockRange }));
/* 목록 쿼리는 공지 핀 글을 항상 제외한다 — select 직후의 .eq('is_pinned', false) 체인 */
const mockPinnedFilter: jest.Mock = jest.fn(() => ({ order: mockOrder }));
const mockSelect: jest.Mock = jest.fn(() => ({ eq: mockPinnedFilter }));
const mockFrom: jest.Mock = jest.fn(() => ({ select: mockSelect }));

jest.mock('@/constants/supabase', () => ({
  supabase: { from: (table: string) => mockFrom(table) },
}));
const mockGetBlockedUserIds: jest.Mock = jest.fn(() => []);
jest.mock('@/constants/authStore', () => ({
  authStore: { getBlockedUserIds: () => mockGetBlockedUserIds() },
}));
jest.mock('@/constants/profileAvatarStorage', () => ({
  isProfileAvatarPath: jest.fn(() => false),
}));

import { fetchPostsPage } from '@/constants/community';

const POST_ROW = {
  author_id: 'author-1',
  board: '질문',
  title: '게시글 제목',
  content: '게시글 내용',
  view_count: 3,
  created_at: '2026-08-20T00:00:00.000Z',
  profiles: { nickname: '테스터', avatar_emoji: '🐦', level: '초급' },
  post_likes: [{ count: 1 }],
  comments: [{ count: 0 }],
};

describe('fetchPostsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requests one additional row and exposes whether another page exists', async () => {
    mockRange.mockResolvedValue({
      data: [
        { ...POST_ROW, id: 'first' },
        { ...POST_ROW, id: 'next' },
      ],
      error: null,
    });

    const page = await fetchPostsPage({ limit: 1 });

    expect(mockFrom).toHaveBeenCalledWith('posts');
    expect(mockPinnedFilter).toHaveBeenCalledWith('is_pinned', false);
    expect(mockRange).toHaveBeenCalledWith(0, 1);
    expect(page.posts.map(post => post.id)).toEqual(['first']);
    expect(page.hasMore).toBe(true);
  });

  it('passes a selected board filter to the server query', async () => {
    mockRange.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ data: [{ ...POST_ROW, id: 'question' }], error: null });

    const page = await fetchPostsPage({ board: '질문', limit: 20 });

    expect(mockEq).toHaveBeenCalledWith('board', '질문');
    expect(page.posts.map(post => post.id)).toEqual(['question']);
    expect(page.hasMore).toBe(false);
  });

  it('nextOffset tracks raw rows fetched, not the block-filtered post count', async () => {
    mockGetBlockedUserIds.mockReturnValue(['blocked-author']);
    // limit=3 -> range(0,3) requests 4 rows; 2 of the first 3 belong to a blocked author.
    mockRange.mockResolvedValue({
      data: [
        { ...POST_ROW, id: 'a', author_id: 'blocked-author' },
        { ...POST_ROW, id: 'b' },
        { ...POST_ROW, id: 'c', author_id: 'blocked-author' },
        { ...POST_ROW, id: 'lookahead' },
      ],
      error: null,
    });

    const page = await fetchPostsPage({ limit: 3 });

    expect(page.posts.map(post => post.id)).toEqual(['b']);
    // Raw rows consumed = 3 (the page, not counting the lookahead row) regardless of
    // how many got filtered out — NOT posts.length (which would wrongly be 1).
    expect(page.nextOffset).toBe(3);
    expect(page.hasMore).toBe(true);
  });

  it('a page where every post is from a blocked author still advances nextOffset correctly', async () => {
    mockGetBlockedUserIds.mockReturnValue(['blocked-author']);
    mockRange.mockResolvedValue({
      data: [
        { ...POST_ROW, id: 'a', author_id: 'blocked-author' },
        { ...POST_ROW, id: 'b', author_id: 'blocked-author' },
        { ...POST_ROW, id: 'lookahead', author_id: 'blocked-author' },
      ],
      error: null,
    });

    const page = await fetchPostsPage({ limit: 2 });

    expect(page.posts).toEqual([]);
    expect(page.nextOffset).toBe(2);
    expect(page.hasMore).toBe(true);
  });

  it('a post whose author profile row is gone (deleted user) still renders with fallback author', async () => {
    mockRange.mockResolvedValue({
      data: [{ ...POST_ROW, id: 'orphan', profiles: null }],
      error: null,
    });

    const page = await fetchPostsPage({ limit: 20 });

    expect(page.posts).toHaveLength(1);
    expect(page.posts[0].author.name).toBe('탈퇴한 사용자');
    expect(page.hasMore).toBe(false);
  });

  it('a failed query returns an empty page without advancing nextOffset (caller can retry same offset)', async () => {
    mockRange.mockResolvedValue({ data: null, error: { message: 'network error' } });

    const page = await fetchPostsPage({ offset: 40, limit: 20 });

    expect(page.posts).toEqual([]);
    expect(page.hasMore).toBe(false);
    // 실패 시 offset이 전진하지 않아야 재시도가 같은 지점부터 다시 요청한다.
    expect(page.nextOffset).toBe(40);
  });

  it('consecutive pages using nextOffset never re-request already-seen rows or duplicate posts', async () => {
    mockGetBlockedUserIds.mockReturnValue(['blocked-author']);
    mockRange
      .mockResolvedValueOnce({
        data: [
          { ...POST_ROW, id: 'a', author_id: 'blocked-author' },
          { ...POST_ROW, id: 'b' },
          { ...POST_ROW, id: 'lookahead-1' },
        ],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [{ ...POST_ROW, id: 'c' }],
        error: null,
      });

    const first = await fetchPostsPage({ limit: 2 });
    expect(first.nextOffset).toBe(2);

    const second = await fetchPostsPage({ offset: first.nextOffset, limit: 2 });

    expect(mockRange).toHaveBeenNthCalledWith(1, 0, 2);
    expect(mockRange).toHaveBeenNthCalledWith(2, 2, 4);
    const allIds = [...first.posts, ...second.posts].map(post => post.id);
    expect(allIds).toEqual(['b', 'c']);
    expect(new Set(allIds).size).toBe(allIds.length);
    expect(second.hasMore).toBe(false);
  });
});
