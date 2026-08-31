import { Dimensions, Platform } from 'react-native';

/** 출시 기준 해상도 360×800dp (CLAUDE.md 기기 기준) — 앱 출시까지 이 사이즈로 고정 */
export const DEVICE_WIDTH = 360;
export const DEVICE_HEIGHT = 800;

/** 아이폰 출시 대비 QA용 — 최근 5세대(12~16 일반 모델) 동일 논리 해상도, 아이폰 중 최다 사용.
 * 웹 프리뷰 URL에 ?device=iphone 붙이면 이 크기로 확인 가능 (실기기/네이티브 빌드는 항상
 * 실제 화면 크기를 쓰므로 이 상수와 무관 — SCREEN_WIDTH 주석 참고). */
export const DEVICE_WIDTH_IPHONE = 390;
export const DEVICE_HEIGHT_IPHONE = 844;

const useIphoneFrame =
  Platform.OS === 'web' && typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('device') === 'iphone';

/** 방문자가 실제 폰 브라우저(iOS 사파리 등)로 열었는지 — 데스크톱 프리뷰 프레임 대신
 * 실기기처럼 뷰포트를 꽉 채운다. 고정 800px 프레임은 폰의 가시 영역(~660px)보다 커서
 * 하단 탭바가 잘리기 때문. ponytail: 로드 시점 1회 판정, 회전/리사이즈는 새로고침으로 충분 */
export const IS_PHONE_VIEWPORT =
  Platform.OS === 'web' && typeof window !== 'undefined' &&
  window.innerWidth > 0 && window.innerWidth < 500; // 0 = 숨김 탭/프리렌더 등 측정 불가 → 데스크톱 프레임 기본값

/** 화면 폭/높이: 웹 데스크톱 프리뷰는 360×800(또는 ?device=iphone 시 390×844) 고정 프레임
 *  (app/_layout.tsx DeviceFrame) 기준, 네이티브·폰 브라우저는 실제 기기 크기.
 *  Dimensions를 직접 쓰지 말고 이 값을 사용할 것. */
export const SCREEN_WIDTH = Platform.OS !== 'web' || IS_PHONE_VIEWPORT
  ? Dimensions.get('window').width
  : useIphoneFrame ? DEVICE_WIDTH_IPHONE : DEVICE_WIDTH;
export const SCREEN_HEIGHT = Platform.OS !== 'web' || IS_PHONE_VIEWPORT
  ? Dimensions.get('window').height
  : useIphoneFrame ? DEVICE_HEIGHT_IPHONE : DEVICE_HEIGHT;
