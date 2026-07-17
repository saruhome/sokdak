import { Dimensions, Platform } from 'react-native';

/** 출시 기준 해상도 360×800dp (CLAUDE.md 기기 기준) — 앱 출시까지 이 사이즈로 고정 */
export const DEVICE_WIDTH = 360;
export const DEVICE_HEIGHT = 800;

/** 화면 폭: 웹 프리뷰는 360 고정 프레임(app/_layout.tsx DeviceFrame) 기준,
 *  네이티브는 실제 기기 폭. Dimensions를 직접 쓰지 말고 이 값을 사용할 것. */
export const SCREEN_WIDTH =
  Platform.OS === 'web' ? DEVICE_WIDTH : Dimensions.get('window').width;
