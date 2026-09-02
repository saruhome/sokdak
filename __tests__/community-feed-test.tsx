import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    router: { push: jest.fn() },
    useFocusEffect: (effect: () => void | (() => void)) => React.useEffect(effect, [effect]),
  };
});
jest.mock('@/components/AppText', () => ({ AppText: require('react-native').Text }));
jest.mock('lucide-react-native', () => ({
  Eye: () => null, Heart: () => null, MessageCircle: () => null, Pencil: () => null, Bell: () => null, Search: () => null,
}));
jest.mock('@/components/AppIcon', () => ({ AppIcon: () => null, IconStat: () => null }));
jest.mock('@/constants/community', () => ({
  COMMUNITY_POST_PAGE_SIZE: 20,
  fetchPinnedPost: jest.fn(async () => null),
  fetchPostsPage: jest.fn(),
}));
jest.mock('@/constants/notifications', () => ({ fetchUnreadNotificationCount: jest.fn(async () => 0) }));
jest.mock('@/constants/authStore', () => ({ authStore: { isLoggedIn: jest.fn(() => true), subscribe: jest.fn(() => () => {}) } }));

import { fetchPinnedPost, fetchPostsPage } from '@/constants/community';
import CommunityScreen, { selectFeaturedPosts } from '@/app/tabs/community/index';

const mockFetchPostsPage = fetchPostsPage as jest.Mock;

const post = (id: string, views = 0) => ({
  id,
  authorId: `author-${id}`,
  board: '질문' as const,
  title: `게시글 ${id}`,
  content: '내용',
  author: { name: '테스터', emoji: '🐦', level: '초급' },
  createdAt: '2026-08-20',
  views,
  likes: 0,
  commentCount: 0,
});

describe('selectFeaturedPosts policy', () => {
  it('hides featured entirely below 5 posts, otherwise picks top 2 by views from the first page', () => {
    expect(selectFeaturedPosts([post('a', 9), post('b', 8)])).toEqual([]);
    const five = [post('a', 1), post('b', 50), post('c', 3), post('d', 40), post('e', 2)];
    expect(selectFeaturedPosts(five).map(p => p.id)).toEqual(['b', 'd']);
  });
});

describe('community feed featured posts', () => {
  beforeEach(() => jest.clearAllMocks());

  it('keeps featured posts in the board list too (operator decision 2026-09-03)', async () => {
    const posts = [post('a', 1), post('b', 50), post('c', 3), post('d', 40), post('e', 2)];
    mockFetchPostsPage.mockResolvedValue({ posts, hasMore: false, nextOffset: 5 });

    const screen = await render(<CommunityScreen />);
    await waitFor(() => expect(screen.getByText('게시글 a')).toBeTruthy());

    /* b·d는 화제의 글 카드 + 게시판 목록 양쪽에(2회), 나머지는 목록에만(1회) —
     * 화제 카드 때문에 보드 탭 목록에서 글이 사라지면 안 된다 */
    for (const id of ['b', 'd']) expect(screen.getAllByText(`게시글 ${id}`)).toHaveLength(2);
    for (const id of ['a', 'c', 'e']) expect(screen.getAllByText(`게시글 ${id}`)).toHaveLength(1);
  });

  it('renders the operator pinned notice above the feed when one exists', async () => {
    (fetchPinnedPost as jest.Mock).mockResolvedValue({ ...post('notice'), title: '베타 테스트 공지' });
    mockFetchPostsPage.mockResolvedValue({ posts: [post('a')], hasMore: false, nextOffset: 1 });

    const screen = await render(<CommunityScreen />);
    await waitFor(() => expect(screen.getByTestId('community-pinned-notice')).toBeTruthy());
    expect(screen.getByText('베타 테스트 공지')).toBeTruthy();
  });
});

/* fake 타이머를 쓰는 이 describe는 파일 마지막에 둔다 — fake 타이머에 걸린 React 스케줄러
 * 콜백이 테스트 종료 시 버려지면, 같은 파일의 이후 테스트에서 passive effect가 돌지 않는다 */
describe('community feed pagination', () => {
  /* VirtualizedList의 50ms 셀 배치 타이머를 결정적으로 돌리기 위해 fake timers 사용
   * (waitFor가 fake timers를 감지해 내부에서 타이머를 전진시킨다) */
  beforeEach(() => { jest.clearAllMocks(); jest.useFakeTimers(); });
  afterEach(async () => {
    /* fake 타이머에 걸려 있는 React 스케줄러 콜백을 비우고 나서 real로 복귀 —
     * 그냥 버리면 스케줄러가 "이미 예약됨" 상태로 남아 다음 테스트의 effect가 영원히 안 돈다 */
    await act(async () => { jest.runOnlyPendingTimers(); });
    jest.useRealTimers();
  });

  it('passes the server nextOffset (not posts.length) to the next page and never renders duplicate ids', async () => {
    /* 서버가 차단 필터로 두 행을 걸러 posts 6개 + nextOffset 8을 돌려준 상황 */
    const page1 = {
      posts: Array.from({ length: 6 }, (_, i) => post(`p${i}`, i)),
      hasMore: true,
      nextOffset: 8,
    };
    const page2 = {
      /* 서버가 경계에서 이미 본 행(p3)을 한 번 더 돌려줘도 화면에는 한 번만 보여야 한다 */
      posts: [post('p3', 1), post('q1'), post('q2')],
      hasMore: false,
      nextOffset: 11,
    };
    mockFetchPostsPage.mockResolvedValueOnce(page1).mockResolvedValueOnce(page2);

    const screen = await render(<CommunityScreen />);
    await waitFor(() => expect(screen.getByText('게시글 p0')).toBeTruthy());

    /* VirtualizedList는 layout/contentSizeChange로 실측을 받고, 셀 배치 타이머가 돈 뒤에야
     * onEndReached를 판단한다 — waitFor 안에서 스크롤을 재시도해 그 시점을 기다린다 */
    const list = screen.getByTestId('community-post-list');
    fireEvent(list, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 360, height: 100 } } });
    fireEvent(list, 'contentSizeChange', 360, 600);
    await waitFor(() => {
      fireEvent.scroll(list, {
        nativeEvent: {
          contentOffset: { y: 500 },
          contentSize: { height: 600, width: 360 },
          layoutMeasurement: { height: 100, width: 360 },
        },
      });
      expect(mockFetchPostsPage).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => expect(screen.getByText('게시글 q2')).toBeTruthy());
    expect(mockFetchPostsPage.mock.calls[1][0].offset).toBe(8);
    expect(screen.getAllByText('게시글 p3')).toHaveLength(1);
  });
});
