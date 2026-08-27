import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('@/components/AppText', () => ({ AppText: require('react-native').Text }));
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));

import {
  CommunitySafetyActionSheet,
  composeReportReason,
} from '@/src/features/community/components/CommunitySafetyActionSheet';
import { tFor } from '@/constants/languageStore';

const baseProps = {
  language: 'ko' as const,
  anchorTop: 44,
  onClose: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onBlock: jest.fn(),
  onSubmitReport: jest.fn(async () => ({ error: null })),
};

describe('composeReportReason', () => {
  it('keeps the stable slug and appends optional free text', () => {
    expect(composeReportReason('spam-ad', '')).toBe('[spam-ad]');
    expect(composeReportReason('other', '  광고 계정 같아요  ')).toBe('[other] 광고 계정 같아요');
  });
});

describe('CommunitySafetyActionSheet', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows edit/delete for the owner and report/block for others', async () => {
    const owner = await render(
      <CommunitySafetyActionSheet {...baseProps} target={{ kind: 'post', isOwner: true }} />,
    );
    expect(owner.getByText(tFor('ko', 'editLabel'))).toBeTruthy();
    expect(owner.getByText(tFor('ko', 'deleteLabel'))).toBeTruthy();
    expect(owner.queryByText(tFor('ko', 'reportLabel'))).toBeNull();
    await fireEvent.press(owner.getByText(tFor('ko', 'editLabel')));
    expect(baseProps.onEdit).toHaveBeenCalledTimes(1);

    const other = await render(
      <CommunitySafetyActionSheet {...baseProps} target={{ kind: 'post', isOwner: false }} />,
    );
    expect(other.getByText(tFor('ko', 'reportLabel'))).toBeTruthy();
    expect(other.queryByText(tFor('ko', 'editLabel'))).toBeNull();
    await fireEvent.press(other.getByText(tFor('ko', 'blockLabel')));
    expect(baseProps.onBlock).toHaveBeenCalledTimes(1);
  });

  it('uses the right report title per target kind', async () => {
    const forPost = await render(
      <CommunitySafetyActionSheet {...baseProps} target={{ kind: 'post', isOwner: false }} />,
    );
    await fireEvent.press(forPost.getByText(tFor('ko', 'reportLabel')));
    expect(forPost.getByText(tFor('ko', 'reportPostTitle'))).toBeTruthy();

    const forComment = await render(
      <CommunitySafetyActionSheet {...baseProps} target={{ kind: 'comment', isOwner: false }} />,
    );
    await fireEvent.press(forComment.getByText(tFor('ko', 'reportLabel')));
    expect(forComment.getByText(tFor('ko', 'reportCommentTitle'))).toBeTruthy();
  });

  it('requires one selected reason before submit, then reaches the success state', async () => {
    const onSubmitReport = jest.fn(async () => ({ error: null }));
    const screen = await render(
      <CommunitySafetyActionSheet
        {...baseProps}
        onSubmitReport={onSubmitReport}
        target={{ kind: 'post', isOwner: false }}
      />,
    );
    await fireEvent.press(screen.getByText(tFor('ko', 'reportLabel')));

    /* 사유 미선택 — 제출 비활성, 눌러도 아무 일 없음 */
    const submit = screen.getByLabelText(tFor('ko', 'reportSubmitBtn'));
    expect(submit.props.accessibilityState?.disabled).toBe(true);
    await fireEvent.press(submit);
    expect(onSubmitReport).not.toHaveBeenCalled();

    /* chip 선택 + 자유 입력 → slug와 합쳐진 단일 reason 문자열로 제출 */
    await fireEvent.press(screen.getByLabelText(tFor('ko', 'reportReasonSpam')));
    expect(
      screen.getByLabelText(tFor('ko', 'reportReasonSpam')).props.accessibilityState?.selected,
    ).toBe(true);
    await fireEvent.changeText(
      screen.getByPlaceholderText(tFor('ko', 'reportReasonPlaceholder')),
      '광고 계정 같아요',
    );
    await fireEvent.press(screen.getByLabelText(tFor('ko', 'reportSubmitBtn')));

    expect(onSubmitReport).toHaveBeenCalledWith('[spam-ad] 광고 계정 같아요');
    /* success 상태 — 접수 안내와 확인 버튼 */
    await waitFor(() => expect(screen.getByText(tFor('ko', 'reportReceivedTitle'))).toBeTruthy());
    await fireEvent.press(screen.getByText(tFor('ko', 'confirmLabel')));
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it('surfaces a submit failure and stays on the form with input preserved', async () => {
    const onSubmitReport = jest.fn(async () => ({ error: '네트워크 오류' }));
    const screen = await render(
      <CommunitySafetyActionSheet
        {...baseProps}
        onSubmitReport={onSubmitReport}
        target={{ kind: 'post', isOwner: false }}
      />,
    );
    await fireEvent.press(screen.getByText(tFor('ko', 'reportLabel')));
    await fireEvent.press(screen.getByLabelText(tFor('ko', 'reportReasonHarassment')));
    await fireEvent.press(screen.getByLabelText(tFor('ko', 'reportSubmitBtn')));

    await waitFor(() => expect(screen.getByText('네트워크 오류')).toBeTruthy());
    /* 실패 후에도 form 유지 + 선택 보존 → 바로 재시도 가능 */
    expect(screen.getByText(tFor('ko', 'reportPostTitle'))).toBeTruthy();
    expect(
      screen.getByLabelText(tFor('ko', 'reportReasonHarassment')).props.accessibilityState?.selected,
    ).toBe(true);
  });
});
