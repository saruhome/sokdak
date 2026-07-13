import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

/** Figma: 831:4800 알림 설정 — 트랙 44×24, 놉 20×20, 다크 트랙 + 화이트 놉 */
export function Toggle({ value, onValueChange }: { value: boolean; onValueChange: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.track, value ? styles.trackOn : styles.trackOff]}
      onPress={onValueChange}
      activeOpacity={0.8}
    >
      <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 44, height: 24, borderRadius: 12,
    justifyContent: 'center', paddingHorizontal: 2,
  },
  trackOn: { backgroundColor: Colors.navBar, alignItems: 'flex-end' },
  trackOff: { backgroundColor: Colors.border, alignItems: 'flex-start' },
  knob: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.surface,
  },
  knobOn: {},
  knobOff: {},
});
