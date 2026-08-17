import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { authStore } from '../../../constants/authStore';
import { languageStore, useLanguage } from '../../../constants/languageStore';
import { AppIcon } from '@/components/AppIcon';
import { BackIcon } from '@/components/icons/SocialIcons';
import {
  Crown, Infinity as InfinityIcon, Download, MapPin, RotateCcw, Sparkles, Gem,
} from 'lucide-react-native';

const FEATURES = [
  { icon: InfinityIcon, labelKey: 'premiumFeatureUnlimitedSaves' } as const,
  { icon: Download,     labelKey: 'premiumFeatureOffline' } as const,
  { icon: MapPin,       labelKey: 'premiumFeatureSituational' } as const,
  { icon: RotateCcw,    labelKey: 'premiumFeatureQuiz' } as const,
  { icon: Sparkles,     labelKey: 'premiumFeaturePersonalized' } as const,
  { icon: Gem,          labelKey: 'premiumFeatureExclusiveContent' } as const,
];

/**
 * 프리미엄 안내 화면.
 *
 * 실제 스토어 결제와 서버 영수증 검증이 연결되기 전에는 이 화면에서 entitlement를
 * 변경하지 않는다. 유료 권한은 결제 웹훅이 서버에서만 갱신해야 하며, 현재는 기존
 * 멤버십 상태를 표시하고 출시 준비 안내만 제공한다.
 */
export default function PremiumScreen() {
  useLanguage();
  const t = languageStore.t;
  const isPremium = authStore.isPremium();

  if (!authStore.isLoggedIn()) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.notFoundText}>{t('loginRequiredGeneric')}</Text>
        <TouchableOpacity style={styles.notFoundBtn} onPress={() => router.replace('/auth/login')}>
          <Text style={styles.notFoundBtnText}>{t('goToLogin')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()}>
          <BackIcon size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t('premiumTitle')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <AppIcon icon={Crown} size={40} color={Colors.premium} />
          <Text style={styles.heroTitle}>{t('premiumBannerTitle')}</Text>
          <Text style={styles.heroSub}>{t('premiumBannerSub')}</Text>
          {isPremium && (
            <View style={styles.activeBadge}>
              <AppIcon icon={Crown} size={13} color={Colors.premium} />
              <Text style={styles.activeBadgeText}>{t('premiumActiveLabel')}</Text>
            </View>
          )}
        </View>

        <View style={styles.featureList}>
          {FEATURES.map(f => (
            <View key={f.labelKey} style={styles.featureRow}>
              <View style={styles.featureIconWrap}>
                <AppIcon icon={f.icon} size={18} color={Colors.premium} />
              </View>
              <Text style={styles.featureLabel}>{t(f.labelKey)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.pendingCard}>
          <Text style={styles.pendingTitle}>{t('premiumComingSoonNote')}</Text>
          <Text style={styles.pendingBody}>
            결제 기능은 스토어 결제와 서버 검증이 완료된 뒤 제공됩니다. 현재 이 화면에서는 회원 등급이 변경되지 않습니다.
          </Text>
        </View>
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
  scroll: { padding: 24, paddingBottom: 40 },
  hero: {
    alignItems: 'center', gap: 8, paddingVertical: 24, paddingHorizontal: 16,
    backgroundColor: Colors.navBar, borderRadius: 16, marginBottom: 24,
  },
  heroTitle: { fontSize: 19, fontWeight: '800', color: Colors.navBarIconActive, textAlign: 'center', marginTop: 4 },
  heroSub: { fontSize: 13, color: Colors.navBarIconMuted, textAlign: 'center', lineHeight: 19 },
  activeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 8, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 14, backgroundColor: Colors.premium + '20', borderWidth: 1, borderColor: Colors.premium,
  },
  activeBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.premium },
  featureList: { gap: 14, marginBottom: 28 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.premium + '15',
  },
  featureLabel: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  pendingCard: {
    gap: 8, padding: 16, borderRadius: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  pendingTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  pendingBody: { fontSize: 12, lineHeight: 18, color: Colors.textSecondary, textAlign: 'center' },
  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },
  notFoundBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.navBar },
  notFoundBtnText: { fontSize: 14, color: Colors.navBarIconActive, fontWeight: '600' },
});
