const mockEq: jest.Mock = jest.fn();
const mockRange: jest.Mock = jest.fn();
const mockOrder: jest.Mock = jest.fn(() => ({ range: mockRange }));
const mockSelect: jest.Mock = jest.fn(() => ({ order: mockOrder }));
const mockFrom: jest.Mock = jest.fn(() => ({ select: mockSelect }));

jest.mock('@/constants/supabase', () => ({
  supabase: { from: (table: string) => mockFrom(table) },
}));
jest.mock('@/constants/authStore', () => ({
  authStore: { getBlockedUserIds: jest.fn(() => []) },
}));
jest.mock('@/constants/profileAvatarStorage', () => ({
  isProfileAvatarPath: jest.fn(() => false),
}));

import { fetchPostsPage } from '@/constants/community';

const POST_ROW = {
  author_id: 'author-1',
  board: '궁금해요',
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
    expect(mockRange).toHaveBeenCalledWith(0, 1);
    expect(page.posts.map(post => post.id)).toEqual(['first']);
    expect(page.hasMore).toBe(true);
  });

  it('passes a selected board filter to the server query', async () => {
    mockRange.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ data: [{ ...POST_ROW, id: 'question' }], error: null });

    const page = await fetchPostsPage({ board: '궁금해요', limit: 20 });

    expect(mockEq).toHaveBeenCalledWith('board', '궁금해요');
    expect(page.posts.map(post => post.id)).toEqual(['question']);
    expect(page.hasMore).toBe(false);
  });
});
