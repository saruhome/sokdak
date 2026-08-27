import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({}),
}));
jest.mock('@/components/AppText', () => ({ AppText: require('react-native').Text }));
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('@/components/icons/SocialIcons', () => ({ BackIcon: () => null }));
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: [] })),
  MediaTypeOptions: { Images: 'Images' },
}));
const mockAlert = jest.fn();
jest.mock('@/constants/alert', () => ({ Alert: { alert: (...args: unknown[]) => mockAlert(...args) } }));
jest.mock('@/constants/communitySafety', () => ({ validateCommunityPost: () => ({ ok: true }) }));
jest.mock('@/constants/authStore', () => ({
  authStore: { isLoggedIn: () => true, hasAcceptedCommunityGuidelines: async () => true },
}));
const mockCreatePost = jest.fn();
jest.mock('@/constants/community', () => ({
  createPost: (...args: unknown[]) => mockCreatePost(...args),
  updatePost: jest.fn(),
  fetchPost: jest.fn(),
  uploadPostImage: jest.fn(),
}));

import { tFor } from '@/constants/languageStore';
import WritePostScreen from '@/app/tabs/community/write';

describe('community write screen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('always shows the current board name with its one-line description', async () => {
    const screen = await render(<WritePostScreen />);

    /* 기본 선택: 궁금해요 — 뱃지 + 설명이 항상 보인다 */
    expect(screen.getByText(tFor('ko', 'boardCurious'))).toBeTruthy();
    expect(screen.getByText(tFor('ko', 'boardDescCurious'))).toBeTruthy();

    /* 게시판을 질문하기로 바꾸면 설명도 함께 바뀌고, 질문 템플릿이 placeholder로만 제안된다 */
    await fireEvent.press(screen.getByText(tFor('ko', 'boardDescCurious')));
    await fireEvent.press(screen.getByText(tFor('ko', 'boardDescAsk')));

    expect(screen.getAllByText(tFor('ko', 'boardDescAsk')).length).toBeGreaterThanOrEqual(1);
    const contentInput = screen.getByPlaceholderText(tFor('ko', 'askTemplatePlaceholder'));
    /* 템플릿은 placeholder일 뿐 — 제출될 content 값에 자동 포함되지 않는다 */
    expect(contentInput.props.value).toBe('');
  });

  it('shows per-field validation helpers next to each field, not only alerts', async () => {
    const screen = await render(<WritePostScreen />);
    const title = screen.getByPlaceholderText(tFor('ko', 'titlePlaceholder'));
    const content = screen.getByPlaceholderText(tFor('ko', 'contentPlaceholder'));

    await fireEvent.changeText(title, '가');
    await fireEvent(title, 'blur');
    expect(screen.getByText(tFor('ko', 'titleNeeded'))).toBeTruthy();

    await fireEvent.changeText(title, '갓벽이 무슨 뜻인가요?');
    expect(screen.queryByText(tFor('ko', 'titleNeeded'))).toBeNull();

    await fireEvent.changeText(content, '짧음');
    await fireEvent(content, 'blur');
    expect(screen.getByText(tFor('ko', 'contentNeeded'))).toBeTruthy();

    await fireEvent.changeText(content, '충분히 긴 본문입니다. 열 글자 넘어요.');
    expect(screen.queryByText(tFor('ko', 'contentNeeded'))).toBeNull();
  });

  it('walks invalid -> ready -> submitting -> failure and preserves the draft on failure', async () => {
    mockCreatePost.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ error: '서버 오류', data: null }), 30)),
    );
    const screen = await render(<WritePostScreen />);
    const submit = () => screen.getByLabelText(tFor('ko', 'submitComplete'));

    /* invalid: 제출 비활성 */
    expect(submit().props.accessibilityState?.disabled).toBe(true);

    const title = screen.getByPlaceholderText(tFor('ko', 'titlePlaceholder'));
    const content = screen.getByPlaceholderText(tFor('ko', 'contentPlaceholder'));
    await fireEvent.changeText(title, '갓벽이 무슨 뜻인가요?');
    await fireEvent.changeText(content, '드라마에서 봤는데 무슨 뜻인지 궁금해요.');

    /* ready: 제출 활성 */
    expect(submit().props.accessibilityState?.disabled).toBe(false);

    await fireEvent.press(submit());
    await waitFor(() => expect(mockCreatePost).toHaveBeenCalledTimes(1));

    /* failure: 알림이 뜨고 입력값은 그대로 보존된다 */
    await waitFor(() => expect(mockAlert).toHaveBeenCalled());
    expect(mockAlert.mock.calls[0][0]).toBe(tFor('ko', 'submitFailedTitle'));
    expect(title.props.value).toBe('갓벽이 무슨 뜻인가요?');
    expect(content.props.value).toBe('드라마에서 봤는데 무슨 뜻인지 궁금해요.');
  });
});
