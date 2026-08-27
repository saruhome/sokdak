import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    router: { push: (...args: unknown[]) => mockPush(...args), replace: (...args: unknown[]) => mockReplace(...args) },
    useFocusEffect: (effect: () => void | (() => void)) => React.useEffect(effect, [effect]),
    useLocalSearchParams: () => ({ id: 'post-1' }),
  };
});
jest.mock('@/components/AppText', () => ({ AppText: require('react-native').Text }));
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('@/components/PostRichText', () => ({ PostRichText: () => null }));
jest.mock('@/components/icons/SokDakLogo', () => ({ SokDakLogo: () => null }));
jest.mock('@/constants/notifications', () => ({ fetchUnreadNotificationCount: jest.fn(async () => 0) }));
jest.mock('@/constants/communitySafety', () => ({ validateCommunityText: () => ({ ok: true }) }));
jest.mock('@/constants/alert', () => ({ Alert: { alert: jest.fn() } }));

const mockCreateComment = jest.fn();
jest.mock('@/constants/community', () => ({
  fetchPost: jest.fn(),
  deletePost: jest.fn(),
  reportPost: jest.fn(),
  createComment: (...args: unknown[]) => mockCreateComment(...args),
  updateComment: jest.fn(),
  deleteComment: jest.fn(),
  reportComment: jest.fn(),
}));

let mockPostSaved = false;
jest.mock('@/constants/authStore', () => ({
  authStore: {
    isLoggedIn: () => true,
    getUser: () => ({ id: 'me' }),
    isPostLiked: () => false,
    isPostSaved: () => mockPostSaved,
    isCommentLiked: () => false,
    togglePostLiked: jest.fn(),
    togglePostSaved: jest.fn(() => { mockPostSaved = !mockPostSaved; }),
    toggleCommentLiked: jest.fn(),
    subscribeBookmarks: () => () => {},
    hasAcceptedCommunityGuidelines: async () => true,
    blockUser: jest.fn(async () => ({ error: null })),
  },
}));

import { fetchPost } from '@/constants/community';
import { tFor } from '@/constants/languageStore';
import PostDetailScreen from '@/app/tabs/community/[id]';

const mockFetchPost = fetchPost as jest.Mock;

const POST = {
  id: 'post-1',
  authorId: 'other',
  board: '궁금해요' as const,
  title: "'갓벽'이 무슨 뜻인가요?",
  content: '너무 어려운 한국어',
  author: { name: '한국어공부어려워', emoji: '🐦', level: '초급' },
  createdAt: '2026-08-20',
  views: 234,
  likes: 23,
  commentCount: 1,
  comments: [{
    id: 'c1',
    authorId: 'commenter',
    author: { name: '한외인', emoji: '🐯', level: '초급' },
    content: 'GOD + 완벽',
    createdAt: '2026-08-20',
    likes: 36,
    replies: [],
  }],
};

describe('post detail screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPostSaved = false;
    mockFetchPost.mockResolvedValue(POST);
  });

  it('back always falls back to the community list, covering direct links', async () => {
    const screen = await render(<PostDetailScreen />);
    await waitFor(() => expect(screen.getByText(POST.title)).toBeTruthy());

    await fireEvent.press(screen.getByLabelText(tFor('ko', 'goBack')));
    expect(mockReplace).toHaveBeenCalledWith('/tabs/community');
  });

  it('comment action is a real action with a label, and like/save expose selected state', async () => {
    const screen = await render(<PostDetailScreen />);
    await waitFor(() => expect(screen.getByText(POST.title)).toBeTruthy());

    /* 죽은 아이콘이 아니라 라벨 있는 실제 액션 — 눌러도 크래시 없이 동작 */
    const commentsAction = screen.getByTestId('post-comments-action');
    expect(commentsAction.props.accessibilityLabel).toContain('1');
    await fireEvent.press(commentsAction);

    const like = screen.getByLabelText(`${tFor('ko', 'likesCount')} 23`);
    expect(like.props.accessibilityState?.selected).toBe(false);
    await fireEvent.press(like);
    await waitFor(() => expect(screen.getByText('24')).toBeTruthy());

    const save = screen.getByLabelText(tFor('ko', 'saveLabel'));
    expect(save.props.accessibilityState?.selected).toBe(false);
    await fireEvent.press(save);
    await waitFor(() =>
      expect(screen.getByLabelText(tFor('ko', 'savedLabel')).props.accessibilityState?.selected).toBe(true),
    );
  });

  it('replying shows the target display name and sends to that parent comment', async () => {
    /* 전송 중 중복 제출 차단은 composer 컴포넌트 테스트가 커버한다 — 여기선 화면 배선만 검증.
     * (act가 핸들러의 promise를 기다리므로 수동 resolve 방식은 데드락이 된다) */
    mockCreateComment.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 30)),
    );

    const screen = await render(<PostDetailScreen />);
    await waitFor(() => expect(screen.getByText(POST.title)).toBeTruthy());

    await fireEvent.press(screen.getByLabelText(tFor('ko', 'replyLabel')));
    /* 답글 배너에 대상 닉네임 표시 — 작성자 이름과 별개로 배너에서 한 번 더 보인다 */
    expect(screen.getByText(new RegExp(tFor('ko', 'replyingLabel')))).toBeTruthy();
    expect(screen.getAllByText(new RegExp('한외인')).length).toBeGreaterThanOrEqual(2);

    await fireEvent.press(screen.getByLabelText(tFor('ko', 'sendLabel')));
    await waitFor(() => expect(mockCreateComment).toHaveBeenCalledTimes(1));
    expect(mockCreateComment.mock.calls[0][0].parentCommentId).toBe('c1');

    /* 전송 완료 후 답글 모드 해제 */
    await waitFor(() => expect(screen.queryByText(new RegExp(tFor('ko', 'replyingLabel')))).toBeNull());
  });

  it('blocking asks for confirmation before calling blockUser', async () => {
    const { authStore } = require('@/constants/authStore');
    const screen = await render(<PostDetailScreen />);
    await waitFor(() => expect(screen.getByText(POST.title)).toBeTruthy());

    /* 케밥 메뉴 열기(작성자 아님 → 신고/차단) → 차단 → 확인 다이얼로그 */
    /* '더보기'는 TopAppBar 케밥(첫 번째)과 댓글 케밥 둘 다에 있다 — 게시글 메뉴는 첫 번째 */
    await fireEvent.press(screen.getAllByLabelText(tFor('ko', 'moreLink'))[0]);
    await fireEvent.press(screen.getByText(tFor('ko', 'blockLabel')));

    expect(screen.getByText(tFor('ko', 'blockUserTitle'))).toBeTruthy();
    expect(authStore.blockUser).not.toHaveBeenCalled();

    /* 확인을 눌러야만 실제 차단이 실행되고 목록으로 돌아간다 */
    const confirmBtns = screen.getAllByText(tFor('ko', 'blockLabel'));
    await fireEvent.press(confirmBtns[confirmBtns.length - 1]);
    await waitFor(() => expect(authStore.blockUser).toHaveBeenCalledWith('other'));
    expect(mockReplace).toHaveBeenCalledWith('/tabs/community');
  });
});
