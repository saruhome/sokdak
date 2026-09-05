import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { AppIcon } from '@/components/AppIcon';
import { ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { tFor, type Language } from '@/constants/languageStore';

/**
 * 게스트에게만 보이는 로그인 유도 callout — 화면당 한 번, 리스트 헤더 최상단에만 놓는다.
 * 별도 CTA 버튼 없이 카드 전체가 로그인 진입점(마이페이지 로그인 배너와 같은 패턴).
 * 표시 여부(게스트인지)는 호출부가 결정한다.
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
    <TouchableOpacity
      style={styles.card}
      testID={testID}
      onPress={onPressLogin}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={tFor(language, 'goToLogin')}
    >
      <View style={styles.textCol}>
        <Text style={styles.title}>{tFor(language, 'guestCalloutTitle')}</Text>
        <Text style={styles.benefit}>{tFor(language, 'guestCalloutBenefit')}</Text>
      </View>
      <AppIcon icon={ChevronRight} size={20} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24, marginTop: 16,
    padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
  },
  textCol: { flex: 1, gap: 6 },
  title: { fontSize: 15, fontFamily: 'NotoSerifKR_600SemiBold', color: Colors.textPrimary },
  benefit: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
});
