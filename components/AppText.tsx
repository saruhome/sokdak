import { Text as RNText, type TextProps } from 'react-native';

/**
 * Figma(Sok-Dak Font/속닥 본문 등)는 제목·본문 전반에 Noto Serif KR을 쓴다.
 * react-native-web에서는 Text.defaultProps 전역 오버라이드가 반영되지 않아서
 * (RNW가 atomic CSS 클래스를 정적으로 생성하며 defaultProps를 읽지 않음)
 * 화면마다 `import { Text } from 'react-native'` 대신 이 컴포넌트를
 * `import { AppText as Text } from '@/components/AppText'`로 바꿔 써서
 * 기본 폰트를 강제한다. 개별 style의 fontFamily는 그대로 우선 적용된다.
 */
export function AppText({ style, ...rest }: TextProps) {
  return <RNText {...rest} style={[{ fontFamily: 'NotoSerifKR_400Regular' }, style]} />;
}
