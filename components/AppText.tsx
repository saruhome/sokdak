import { PixelRatio, Text as RNText, type TextProps } from 'react-native';

/** 한 줄 철칙의 접근성 예외(운영자 승인 2026-09-02, 시안 ④-B):
 * 시스템 글꼴을 크게 쓰는 사용자(배율 ≥ 1.3)에게는 축소 맞춤이 확대를 되돌리므로(WCAG 1.4.4),
 * 1열 축소 라벨을 2줄 줄바꿈으로 완화한다. 일반 배율에서는 기존과 픽셀 단위로 동일. */
const RELAX_FONT_SCALE = 1.3;

/**
 * Figma(Sok-Dak Font/속닥 본문 등)는 제목·본문 전반에 Noto Serif KR을 쓴다.
 * react-native-web에서는 Text.defaultProps 전역 오버라이드가 반영되지 않아서
 * (RNW가 atomic CSS 클래스를 정적으로 생성하며 defaultProps를 읽지 않음)
 * 화면마다 `import { Text } from 'react-native'` 대신 이 컴포넌트를
 * `import { AppText as Text } from '@/components/AppText'`로 바꿔 써서
 * 기본 폰트를 강제한다. 개별 style의 fontFamily는 그대로 우선 적용된다.
 */
export function AppText({ style, ...rest }: TextProps) {
  if (rest.adjustsFontSizeToFit && rest.numberOfLines === 1 && PixelRatio.getFontScale() >= RELAX_FONT_SCALE) {
    rest = { ...rest, adjustsFontSizeToFit: false, numberOfLines: 2 };
  }
  return <RNText {...rest} style={[{ fontFamily: 'NotoSerifKR_400Regular' }, style]} />;
}
