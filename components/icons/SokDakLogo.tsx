import { View, StyleSheet } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Colors } from '@/constants/Colors';

/**
 * 랜딩페이지(sokdak-landing-page) 헤더 로고 레이아웃과 동일한 구성 — 원형 "속" 배지 +
 * "SokDak" + "· 속닥". 랜딩페이지는 밝은 헤더 위라 bg-primary(다크)/text-primary-foreground(밝음)
 * 조합이지만, 앱 헤더는 이미 navBar(다크)라 배지만 밝은색으로 반전해 대비를 확보한다.
 */
export function SokDakLogo() {
  return (
    <View style={styles.row}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>속</Text>
      </View>
      <Text style={styles.wordmark}>SokDak</Text>
      <Text style={styles.sub}>· 속닥</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.navBarIconActive,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontSize: 15, fontWeight: '800', color: Colors.navBar },
  wordmark: { fontSize: 18, fontWeight: '800', color: Colors.navBarIconActive, letterSpacing: -0.2 },
  sub: { fontSize: 12, color: Colors.navBarIconMuted },
});
