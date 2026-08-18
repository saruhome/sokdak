import { fireEvent, render } from '@testing-library/react-native';
import { CharacterEmptyState } from '@/components/CharacterEmptyState';

describe('CharacterEmptyState', () => {
  const image = require('../assets/characters/poses/horang-reading.png');

  it('renders the character as decorative content and exposes the localized CTA', async () => {
    const onPressCta = jest.fn();
    const screen = await render(
      <CharacterEmptyState
        image={image}
        title="저장한 단어가 없어요"
        description="사전에서 마음에 드는 단어를 저장해보세요."
        ctaLabel="사전 둘러보기"
        onPressCta={onPressCta}
        testID="character-empty-state"
      />,
    );

    expect(screen.getByTestId('character-empty-state')).toBeTruthy();
    expect(screen.getByText('저장한 단어가 없어요')).toBeTruthy();
    expect(screen.getByText('사전에서 마음에 드는 단어를 저장해보세요.')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('사전 둘러보기'));
    expect(onPressCta).toHaveBeenCalledTimes(1);
  });

  it('does not render an action when no callback is supplied', async () => {
    const screen = await render(
      <CharacterEmptyState image={image} title="검색 결과가 없어요" ctaLabel="사전 둘러보기" />,
    );

    expect(screen.getByText('검색 결과가 없어요')).toBeTruthy();
    expect(screen.queryByLabelText('사전 둘러보기')).toBeNull();
  });
});
