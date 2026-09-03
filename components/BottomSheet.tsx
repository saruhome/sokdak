import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Modal, View, TouchableOpacity, Animated, Easing, StyleSheet, KeyboardAvoidingView, Platform,
  type ViewStyle, type StyleProp,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SCREEN_WIDTH } from '@/constants/layout';

/** 시트 시작 위치(화면 밖) — 실제 패널 높이를 몰라도 화면 밖으로 밀어내기 충분한 값 */
const OFFSCREEN_Y = 500;

/**
 * 앱 공통 바텀시트 — 뒷배경은 자연스럽게 페이드 인/아웃, 패널만 아래에서 슬라이드업/다운.
 * RN Modal의 animationType은 배경+패널을 하나로 묶어 애니메이션해 둘을 분리할 수 없어
 * animationType="none" + Animated.Value 2개(배경 opacity, 패널 translateY)로 직접 구동한다.
 */
export function BottomSheet({
  visible, onClose, children, panelStyle,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  panelStyle?: StyleProp<ViewStyle>;
}) {
  const [mounted, setMounted] = useState(visible);
  const insets = useSafeAreaInsets();
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const panelY = useRef(new Animated.Value(OFFSCREEN_Y)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(panelY, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 150, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        Animated.timing(panelY, { toValue: OFFSCREEN_Y, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start(() => setMounted(false));
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      {/* iOS에서 키보드가 시트 입력창(문의·신고 폼)을 가리지 않게 패널을 밀어올린다 */}
      <KeyboardAvoidingView
        style={styles.avoider}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.root}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose}>
            <Animated.View style={[StyleSheet.absoluteFill, styles.dim, { opacity: backdropOpacity }]} />
          </TouchableOpacity>
          <Animated.View style={{ transform: [{ translateY: panelY }] }}>
            <TouchableOpacity activeOpacity={1} style={panelStyle}>
              {children}
              {/* 홈 인디케이터만큼 패널 배경째 늘리는 스페이서 — inset 0(웹/구형 기기)이면 0 */}
              <View style={{ height: insets.bottom }} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  /* RN Modal은 웹에서 DeviceFrame(360px 고정 프레임) 밖 document.body로 그대로 포탈되므로
   * width를 SCREEN_WIDTH로 잡고 가운데 정렬해야 프레임과 같은 폭으로 보인다 */
  avoider: { flex: 1 },
  root: {
    flex: 1, width: '100%', maxWidth: SCREEN_WIDTH, alignSelf: 'center', justifyContent: 'flex-end',
  },
  dim: { backgroundColor: 'rgba(0,0,0,0.25)' },
});
