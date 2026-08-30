import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppText as Text } from '@/components/AppText';
import { AppIcon } from '@/components/AppIcon';
import { BackIcon } from '@/components/icons/SocialIcons';
import { Colors } from '@/constants/Colors';
import { languageStore } from '@/constants/languageStore';
import { LEGAL_LINKS, SUPPORT_EMAIL, isValidPublicUrl } from '@/constants/legal';
import { safeGoBack } from '@/constants/navigation';
import { Alert } from '@/constants/alert';
import { ChevronRight, ExternalLink, Mail, ShieldCheck, Trash2 } from 'lucide-react-native';

type LegalItem = {
  key: keyof typeof LEGAL_LINKS;
  title: string;
  description: string;
  icon: typeof ShieldCheck;
};

const LEGAL_ITEMS: LegalItem[] = [
  {
    key: 'privacyPolicy',
    title: '개인정보처리방침',
    description: '수집 정보, 이용 목적, 보관 및 이용자 권리를 확인합니다.',
    icon: ShieldCheck,
  },
  {
    key: 'termsOfService',
    title: '이용약관',
    description: '서비스 이용 조건과 커뮤니티 운영 원칙을 확인합니다.',
    icon: ExternalLink,
  },
  {
    key: 'accountDeletion',
    title: '계정·데이터 삭제 요청',
    description: '웹에서 계정과 연계된 데이터 삭제를 요청할 수 있습니다.',
    icon: Trash2,
  },
];

export default function LegalScreen() {
  const openLegalLink = async (key: keyof typeof LEGAL_LINKS) => {
    const url = LEGAL_LINKS[key];
    if (!isValidPublicUrl(url)) {
      Alert.alert('준비 중인 정보예요', '이 문서의 공개 주소는 출시 전에 설정됩니다. 고객센터로 문의해주세요.');
      return;
    }
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('문서를 열 수 없어요', '잠시 후 다시 시도하거나 고객센터로 문의해주세요.');
      return;
    }
    await Linking.openURL(url);
  };

  const contactSupport = async () => {
    if (!SUPPORT_EMAIL) {
      router.push('/tabs/mypage/support');
      return;
    }
    await Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()} accessibilityLabel="뒤로가기">
          <BackIcon size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{languageStore.t('mypageLegal')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          속닥은 이용자의 개인정보와 콘텐츠 권리를 존중합니다. 아래 문서에서 서비스 이용과 데이터 처리 방침을 확인할 수 있습니다.
        </Text>

        <View style={styles.itemList}>
          {LEGAL_ITEMS.map(item => {
            const available = isValidPublicUrl(LEGAL_LINKS[item.key]);
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.item, !available && styles.itemUnavailable]}
                onPress={() => openLegalLink(item.key)}
                activeOpacity={0.8}
                accessibilityRole="link"
                accessibilityLabel={item.title}
              >
                <View style={styles.itemIcon}>
                  <AppIcon icon={item.icon} size={19} color={Colors.navBar} />
                </View>
                <View style={styles.itemTextWrap}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  {!available && <Text style={styles.pendingText}>출시 전 공개 URL 설정 필요</Text>}
                </View>
                <AppIcon icon={ChevronRight} size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.supportRow} onPress={contactSupport} activeOpacity={0.8}>
          <AppIcon icon={Mail} size={18} color={Colors.textSecondary} />
          <Text style={styles.supportText}>개인정보 및 정책 문의</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  content: { padding: 24, paddingBottom: 40, gap: 20 },
  intro: { fontSize: 14, lineHeight: 22, color: Colors.textSecondary },
  itemList: { gap: 10 },
  item: {
    minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
  },
  itemUnavailable: { opacity: 0.72 },
  itemIcon: {
    width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.navBar + '12',
  },
  itemTextWrap: { flex: 1, gap: 3 },
  itemTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  itemDescription: { fontSize: 12, lineHeight: 17, color: Colors.textSecondary },
  pendingText: { fontSize: 11, color: Colors.point1, fontWeight: '600' },
  supportRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    paddingVertical: 14, borderRadius: 10, backgroundColor: Colors.divider,
  },
  supportText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
});
