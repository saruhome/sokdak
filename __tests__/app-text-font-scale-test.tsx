/** 한 줄 철칙의 접근성 예외(시안 ④-B) — 시스템 글꼴 확대 시 1열 축소 라벨이 2줄로 완화된다 */
import React from 'react';
import { PixelRatio } from 'react-native';
import { render } from '@testing-library/react-native';
import { AppText } from '@/components/AppText';

const renderProps = async (scale: number) => {
  jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(scale);
  const screen = await render(<AppText numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>라벨</AppText>);
  return screen.getByText('라벨').props;
};

describe('AppText one-line rule accessibility exception', () => {
  afterEach(() => jest.restoreAllMocks());

  it('keeps shrink-to-fit single line at normal font scale', async () => {
    const props = await renderProps(1);
    expect(props.numberOfLines).toBe(1);
    expect(props.adjustsFontSizeToFit).toBe(true);
  });

  it('relaxes to two wrapped lines when the user enlarges system fonts', async () => {
    const props = await renderProps(1.5);
    expect(props.numberOfLines).toBe(2);
    expect(props.adjustsFontSizeToFit).toBe(false);
  });
});
