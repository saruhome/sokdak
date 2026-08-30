import { Alert, Image, Modal, StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Colors } from '../../../constants/Colors';
import { safeGoBack } from '../../../constants/navigation';
import { authStore, BETA_UNLIMITED_ENTITLEMENTS } from '../../../constants/authStore';
import { languageStore, useLanguage } from '../../../constants/languageStore';
import { AppIcon } from '@/components/AppIcon';
import { BackIcon } from '@/components/icons/SocialIcons';
import {
  Crown, Infinity as InfinityIcon, Download, MapPin, RotateCcw, Sparkles, Gem,
} from 'lucide-react-native';

const HORANG_CHEER = require('../../../assets/characters/transparent/horang-cheer.png');
const JJAEKI_FULL = require('../../../assets/characters/transparent/jjaeki-full.png');

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
  const [activating, setActivating] = useState(false);
  /* 베타 mock 결제 성공(activateBetaPremium)이 세션을 갱신하면 화면도 따라가도록 구독 */
  const [, forceRender] = useState(0);
  useEffect(() => authStore.subscribe(() => forceRender(n => n + 1)), []);

  useEffect(() => {
    if (BETA_UNLIMITED_ENTITLEMENTS) router.replace('/tabs/mypage');
  }, []);

  /* 가상 결제: 실결제 페이지 대신 테스트용 체크아웃 모달만 띄운다.
   * 카드 입력란은 두지 않는다 — 실제 결제 정보가 수집되는 것처럼 보이면 안 된다. */
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  const completeMockPayment = async () => {
    setActivating(true);
    const { error } = await authStore.activateBetaPremium();
    setActivating(false);
    setCheckoutVisible(false);
    if (error) Alert.alert(t('saveFailedTitle'), error);
    else Alert.alert(t('premiumBetaActivated'));
  };

  if (BETA_UNLIMITED_ENTITLEMENTS) return null;

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
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack('/tabs/mypage')}>
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
          {/* 앱 마스코트 — 호랭(응원)과 짹이가 프리미엄을 홍보하는 자리(운영자 요청) */}
          {/* 호랭이는 짹이보다 항상 크게(세계관 크기 위계 — 운영자 규칙), 바닥선 정렬 */}
          <View style={styles.heroMascots}>
            <Image source={HORANG_CHEER} style={styles.heroMascotHorang} resizeMode="contain" />
            <Image source={JJAEKI_FULL} style={styles.heroMascotJjaeki} resizeMode="contain" />
          </View>
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

        {!isPremium && (
          <TouchableOpacity style={styles.betaCta} onPress={() => setCheckoutVisible(true)}>
            <Text style={styles.betaCtaText}>{t('premiumBetaCta')}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.pendingCard}>
          <Text style={styles.pendingTitle}>{t('premiumComingSoonNote')}</Text>
          <Text style={styles.pendingBody}>{t('premiumPendingBody')}</Text>
        </View>
      </ScrollView>

      {/* 가상 체크아웃 — "테스트 모드, 실제 청구 없음"을 명시하고 결제 정보는 받지 않는다 */}
      <Modal visible={checkoutVisible} transparent animationType="fade"
        onRequestClose={() => setCheckoutVisible(false)}>
        <View style={styles.checkoutBackdrop}>
          <View style={styles.checkoutCard}>
            <View style={styles.checkoutTestBadge}>
              <Text style={styles.checkoutTestBadgeText}>{t('mockCheckoutNotice')}</Text>
            </View>
            <Text style={styles.checkoutTitle}>{t('mockCheckoutTitle')}</Text>
            <View style={styles.checkoutRow}>
              <Text style={styles.checkoutProduct}>{t('mockCheckoutProduct')}</Text>
              <Text style={styles.checkoutPrice} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>₩4,900 / {t('mockCheckoutPerMonth')}</Text>
            </View>
            <TouchableOpacity
              style={[styles.checkoutPayBtn, activating && styles.betaCtaDisabled]}
              onPress={completeMockPayment}
              disabled={activating}
            >
              <Text style={styles.checkoutPayText}>{t('mockCheckoutPay')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.checkoutCancelBtn} onPress={() => setCheckoutVisible(false)}>
              <Text style={styles.checkoutCancelText}>{t('adultGateCancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  heroMascots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 12, marginTop: 8 },
  heroMascotHorang: { width: 96, height: 110 },
  heroMascotJjaeki: { width: 52, height: 62 },
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
  betaCta: {
    alignItems: 'center', paddingVertical: 14, borderRadius: 12,
    backgroundColor: Colors.navBar, marginBottom: 16,
  },
  betaCtaDisabled: { opacity: 0.6 },
  betaCtaText: { fontSize: 15, fontWeight: '700', color: Colors.navBarIconActive },
  checkoutBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  checkoutCard: {
    width: '100%', maxWidth: 320, gap: 12, padding: 20,
    borderRadius: 16, backgroundColor: Colors.surface,
  },
  checkoutTestBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, backgroundColor: Colors.error + '18', borderWidth: 1, borderColor: Colors.error,
  },
  checkoutTestBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.error },
  checkoutTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  checkoutRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, borderRadius: 10, backgroundColor: Colors.background,
  },
  checkoutProduct: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  checkoutPrice: { flexShrink: 1, fontSize: 14, fontWeight: '700', color: Colors.accent },
  checkoutPayBtn: {
    alignItems: 'center', paddingVertical: 13, borderRadius: 10, backgroundColor: Colors.navBar,
  },
  checkoutPayText: { fontSize: 15, fontWeight: '700', color: Colors.navBarIconActive },
  checkoutCancelBtn: { alignItems: 'center', paddingVertical: 8 },
  checkoutCancelText: { fontSize: 13, color: Colors.textSecondary },
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
