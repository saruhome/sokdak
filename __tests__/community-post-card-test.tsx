import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('@/components/AppText', () => ({ AppText: require('react-native').Text }));
jest.mock('lucide-react-native', () => ({ Eye: () => null, Heart: () => null, MessageCircle: () => null }));

import { CommunityPostCard, previewText } from '@/src/features/community/components/CommunityPostCard';
import { CommunityFilterBar, type CommunityBoardTab } from '@/src/features/community/components/CommunityFilterBar';
import type { CommunityPostSummary } from '@/constants/community';

const POST: CommunityPostSummary = {
  id: 'p1',
  authorId: 'a1',
  board: '질문',
  title: "'갓벽'이 무슨 뜻인가요?",
  content: '**너무** 어려운 한국어 ![](https://img.example/x.png) [링크](https://example.com)',
  author: { name: '한국어공부어려워', emoji: '🐦', level: '초급' },
  createdAt: '2026-08-20',
  views: 234,
  likes: 23,
  commentCount: 10,
};

describe('previewText', () => {
  it('strips image/link/format markup down to plain context', () => {
    expect(previewText(POST.content)).toBe('너무 어려운 한국어 링크');
    expect(previewText('![](https://img.example/only.png)')).toBe('');
  });
});

describe('CommunityPostCard', () => {
  it('renders board → 2-line title → 1-line preview → author/time and localized meta', async () => {
    const screen = await render(<CommunityPostCard post={POST} language="en" onPress={jest.fn()} />);

    const title = screen.getByText(POST.title);
    expect(title.props.numberOfLines).toBe(2);
    const preview = screen.getByText('너무 어려운 한국어 링크');
    expect(preview.props.numberOfLines).toBe(1);
    expect(screen.getByText(`${POST.author.emoji} ${POST.author.name}`)).toBeTruthy();
    expect(screen.getByText('2026-08-20')).toBeTruthy();
    /* localized metadata — en에서는 board 라벨이 영어로 나온다 */
    expect(screen.getByText('Curious?')).toBeTruthy();
  });

  it('fires onPress for a tap anywhere on the card and exposes a semantic label', async () => {
    const onPress = jest.fn();
    const screen = await render(
      <CommunityPostCard post={POST} language="en" onPress={onPress} testID="post-card" />,
    );

    const card = screen.getByTestId('post-card');
    expect(card.props.accessibilityLabel).toContain(POST.title);
    expect(card.props.accessibilityLabel).toContain(POST.author.name);
    expect(card.props.accessibilityLabel).toContain('10');
    await fireEvent.press(card);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('omits the preview line when content is image-only', async () => {
    const screen = await render(
      <CommunityPostCard
        post={{ ...POST, content: '![](https://img.example/only.png)' }}
        language="ko"
        onPress={jest.fn()}
      />,
    );
    expect(screen.queryByText('')).toBeNull();
  });
});

const TABS: CommunityBoardTab[] = ['전체', '질문', '자유'];

describe('CommunityFilterBar', () => {
  it('renders every board, marks selection via accessibilityState, and scrolls horizontally', async () => {
    const onSelect = jest.fn();
    const screen = await render(
      <CommunityFilterBar tabs={TABS} active="질문" onSelect={onSelect} language="ko" />,
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    const selected = tabs.filter(tab => tab.props.accessibilityState?.selected);
    expect(selected).toHaveLength(1);
    expect(screen.getByText('궁금해요')).toBeTruthy();

    /* 긴 locale/큰 글꼴에서 잘리는 대신 가로 스크롤 — horizontal ScrollView여야 한다 */
    const horizontalScrolls = screen.container.queryAll(node => node.props.horizontal === true);
    expect(horizontalScrolls.length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByText('속닥속닥'));
    expect(onSelect).toHaveBeenCalledWith('자유');
  });
});
