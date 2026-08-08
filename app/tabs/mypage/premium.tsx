import {
  StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity,
} from 'react-native';
import { Alert } from '@/constants/alert';
import { AppText as Text } from '@/components/AppText';
import { useState } from 'react';
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

/** 프리미엄 업그레이드 화면 — 실제 결제 SDK 연동 전이라 "체험 시작하기"가 profiles.is_premium을
 * 바로 켠다. 나중에 Google Play Billing/Stripe 웹훅이 같은 컬럼을 갱신하도록 바꾸면
 * 이 화면과 authStore.isPremium()을 쓰는 다른 화면들은 그대로 둬도 된다. */
export default function PremiumScreen() {
  useLanguage();
  const t = languageStore.t;
  const [busy, setBusy] = useState(false);
  const [isPremium, setIsPremiumLocal] = useState(authStore.isPremium());

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

  const handleToggle = async () => {
    setBusy(true);
    const next = !isPremium;
    const { error } = await authStore.setPremiumStatus(next);
    setBusy(false);
    if (error) { Alert.alert(t('saveFailedTitle'), error); return; }
    setIsPremiumLocal(next);
    if (next) Alert.alert(t('premiumActivatedAlert'));
  };

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

        <TouchableOpacity
          style={[styles.ctaBtn, isPremium && styles.ctaBtnActive]}
          onPress={handleToggle}
          disabled={busy}
          activeOpacity={0.85}
        >
          <Text style={[styles.ctaBtnText, isPremium && styles.ctaBtnTextActive]}>
            {isPremium ? t('premiumDeactivateTestBtn') : t('premiumActivateTestBtn')}
          </Text>
        </TouchableOpacity>
        <Text style={styles.comingSoonNote}>{t('premiumComingSoonNote')}</Text>
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

  ctaBtn: {
    height: 52, borderRadius: 12, backgroundColor: Colors.premium,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaBtnActive: { backgroundColor: Colors.divider, borderWidth: 1, borderColor: Colors.border },
  ctaBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  ctaBtnTextActive: { color: Colors.textSecondary },
  comingSoonNote: { fontSize: 11, color: Colors.textTertiary, textAlign: 'center', marginTop: 12, lineHeight: 16 },

  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },
  notFoundBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.navBar },
  notFoundBtnText: { fontSize: 14, color: Colors.navBarIconActive, fontWeight: '600' },
});
