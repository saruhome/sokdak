import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Colors } from '@/constants/Colors';
import { tFor, type Language } from '@/constants/languageStore';

/**
 * 게스트에게만 보이는 로그인 유도 callout — 화면당 한 번, 리스트 헤더 최상단에만 놓는다.
 * 카드마다 CTA를 반복하지 않기 위한 단일 진입점. 표시 여부(게스트인지)는 호출부가 결정한다.
 */
export function CommunityGuestCallout({
  language,
  onPressLogin,
  testID,
}: {
  language: Language;
  onPressLogin: () => void;
  testID?: string;
}) {
  return (
    <View style={styles.card} testID={testID}>
      <Text style={styles.title}>{tFor(language, 'guestCalloutTitle')}</Text>
      <Text style={styles.benefit}>{tFor(language, 'guestCalloutBenefit')}</Text>
      <TouchableOpacity
        style={styles.cta}
        onPress={onPressLogin}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={tFor(language, 'goToLogin')}
      >
        <Text style={styles.ctaText}>{tFor(language, 'goToLogin')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24, marginTop: 16,
    padding: 16, gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
  },
  title: { fontSize: 15, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
  benefit: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
  cta: {
    marginTop: 8, alignSelf: 'flex-start',
    minHeight: 44, paddingHorizontal: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.navBar, borderRadius: 10,
  },
  ctaText: { fontSize: 14, fontWeight: '700', color: Colors.navBarIconActive },
});
