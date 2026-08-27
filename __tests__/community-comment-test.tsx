import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('@/components/AppText', () => ({ AppText: require('react-native').Text }));
jest.mock('lucide-react-native', () => ({ MoreVertical: () => null, Star: () => null, X: () => null }));

import { CommunityCommentComposer } from '@/src/features/community/components/CommunityCommentComposer';
import { CommunityCommentItem } from '@/src/features/community/components/CommunityCommentItem';
import { tFor } from '@/constants/languageStore';
import type { CommunityComment } from '@/constants/community';

const COMMENT: CommunityComment = {
  id: 'c1',
  authorId: 'other',
  author: { name: '한외인', emoji: '🐯', level: '초급' },
  content: 'GOD + 완벽 이라는 뜻이에요',
  createdAt: '2026-08-20',
  likes: 36,
};

describe('CommunityCommentComposer', () => {
  const baseProps = {
    language: 'ko' as const,
    value: '',
    onChangeText: jest.fn(),
    onSend: jest.fn(),
    sending: false,
    replyingToName: null,
    onCancelReply: jest.fn(),
  };

  it('starts as a single line but can grow to three lines (multiline with a max height)', async () => {
    const screen = await render(<CommunityCommentComposer {...baseProps} />);
    const input = screen.getByPlaceholderText(tFor('ko', 'commentPlaceholder'));
    expect(input.props.multiline).toBe(true);
    const style = [input.props.style].flat().reduce((acc, s) => ({ ...acc, ...s }), {});
    expect(style.minHeight).toBe(36);
    expect(style.maxHeight).toBe(80);
  });

  it('shows the reply target display name and lets the user cancel it', async () => {
    const onCancelReply = jest.fn();
    const screen = await render(
      <CommunityCommentComposer {...baseProps} replyingToName="한외인" onCancelReply={onCancelReply} />,
    );
    expect(screen.getByText(new RegExp('한외인'))).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(tFor('ko', 'cancelLabel')));
    expect(onCancelReply).toHaveBeenCalledTimes(1);
  });

  it('disables send while empty and while a submit is in flight', async () => {
    const onSend = jest.fn();
    const empty = await render(<CommunityCommentComposer {...baseProps} onSend={onSend} />);
    await fireEvent.press(empty.getByLabelText(tFor('ko', 'sendLabel')));
    expect(onSend).not.toHaveBeenCalled();

    const sending = await render(
      <CommunityCommentComposer {...baseProps} value="댓글" sending onSend={onSend} />,
    );
    await fireEvent.press(sending.getByLabelText(tFor('ko', 'sendLabel')));
    expect(onSend).not.toHaveBeenCalled();
    expect(sending.getByText(tFor('ko', 'sendingLabel'))).toBeTruthy();
  });
});

describe('CommunityCommentItem', () => {
  const baseProps = {
    comment: COMMENT,
    language: 'ko' as const,
    liked: false,
    likeCount: 36,
    onToggleLike: jest.fn(),
    onReply: jest.fn(),
    onMenuPress: jest.fn(),
    isEditing: false,
    editText: '',
    onChangeEditText: jest.fn(),
    onSaveEdit: jest.fn(),
    onCancelEdit: jest.fn(),
    savingEdit: false,
  };

  it('exposes labeled like/reply/menu actions and reports like selection state', async () => {
    const onToggleLike = jest.fn();
    const onReply = jest.fn();
    const screen = await render(
      <CommunityCommentItem {...baseProps} liked onToggleLike={onToggleLike} onReply={onReply} />,
    );

    const like = screen.getByLabelText(`${tFor('ko', 'likesCount')} 36`);
    expect(like.props.accessibilityState?.selected).toBe(true);
    await fireEvent.press(like);
    expect(onToggleLike).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByLabelText(tFor('ko', 'replyLabel')));
    expect(onReply).toHaveBeenCalledTimes(1);

    expect(screen.getByLabelText(tFor('ko', 'moreLink'))).toBeTruthy();
  });

  it('hides the reply action on nested replies', async () => {
    const screen = await render(<CommunityCommentItem {...baseProps} isReply />);
    expect(screen.queryByLabelText(tFor('ko', 'replyLabel'))).toBeNull();
  });
});
